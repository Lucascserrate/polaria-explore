"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { hero } from "@/content/hero";
import { BOOKING_STEP } from "@/content/hero-chat";
import { AgendaGlimpse } from "@/sections/hero/AgendaGlimpse";
import { PhoneConversation } from "@/sections/hero/PhoneConversation";
import { LAST_FRAME, timeline } from "@/sections/hero/timeline";

/**
 * El bloque visual del hero: teléfono adelante, agenda del negocio atrás.
 *
 * Acá vive el único estado de la animación — el índice de fotograma — y de él
 * cuelgan las dos mitades de la historia: lo que el cliente toca en WhatsApp y
 * el hueco que se llena del otro lado. Tenerlo en un solo lugar es lo que
 * permite que las dos cosas pasen sincronizadas sin coordinar dos relojes.
 *
 * Tres reglas que gobiernan el reloj:
 *  - No corre fuera de pantalla. Un bucle de 30 segundos girando en el
 *    background del navegador no lo ve nadie y se paga igual.
 *  - Con movimiento reducido salta al último fotograma: la conversación se lee
 *    completa y quieta, sin perder nada del flujo.
 *  - Ni `Date.now()` ni `Math.random()`: el primer fotograma tiene que
 *    renderizarse igual en el servidor y en el cliente.
 */
export function HeroShowcase() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [frame, setFrame] = useState(0);
  /** Cambia en cada vuelta para reiniciar las animaciones de entrada. */
  const [run, setRun] = useState(0);
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /**
   * Con movimiento reducido no adelantamos el estado: mostramos directamente el
   * último fotograma. El reloj, simplemente, nunca arranca.
   */
  const shown = reduced ? LAST_FRAME : frame;

  useEffect(() => {
    if (reduced || !onScreen) return;

    const timer = setTimeout(() => {
      if (frame >= LAST_FRAME) {
        setFrame(0);
        setRun((value) => value + 1);
        return;
      }
      setFrame(frame + 1);
    }, timeline.frames[frame].ms);

    return () => clearTimeout(timer);
  }, [frame, onScreen, reduced]);

  const booked = shown >= timeline.cues[BOOKING_STEP].say;

  return (
    <div
      ref={rootRef}
      className="relative flex flex-col items-center lg:block lg:min-h-160"
    >
      {/* Halo detrás del teléfono: lo despega del fondo sin una caja. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-104 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(31_107_255/0.16),transparent)] blur-2xl xl:left-136 xl:size-136"
      />

      {/* La agenda queda detrás y a la izquierda, y el teléfono se apoya sobre
          su borde derecho: le tapa la última columna, nunca la de Fabián, que
          es donde entra la cita.

          Aparece recién en xl. Entre lg y xl no hay ancho para las dos piezas
          sin que el teléfono se coma media agenda, y media agenda se lee como
          un error de maquetación. */}
      <div className="pointer-events-none absolute left-0 top-4 hidden xl:block">
        <AgendaGlimpse booked={booked} />
      </div>

      <div className="relative z-10 flex flex-col items-center lg:mt-10 lg:items-start lg:pl-8 xl:ml-104 xl:mt-12 xl:pl-0">
        <PhoneConversation frame={shown} run={run} reduced={reduced ?? false} />

        <div className="mt-5 flex w-70 flex-col items-center gap-1 text-center sm:w-74 lg:items-start lg:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700">
            <span className="size-1.5 rounded-full bg-confirm-500" />
            {hero.phone.caption}
          </span>
          <span className="text-pretty text-xs leading-relaxed text-ink-500">
            {hero.phone.note}
          </span>
        </div>
      </div>
    </div>
  );
}

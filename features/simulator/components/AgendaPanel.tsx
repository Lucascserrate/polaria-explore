"use client";

import { AnimatePresence } from "motion/react";
import { OwnerNotification } from "@/features/simulator/components/OwnerNotification";
import type { AgendaSlot, BarberId, OwnerAlert } from "@/features/simulator/types";
import { barbers, freeSlotsOf, salon } from "@/features/simulator/data/salon";
import { cn } from "@/lib/utils";

/**
 * El panel del dueño. Es la mitad que de verdad vende.
 *
 * Hay una agenda por profesional y el panel sigue a la que se esté eligiendo
 * en el chat. Ver que los horarios cambian al cambiar de barbero es lo que
 * demuestra que Polaria gestiona agendas; sin eso, sería un chatbot con buena
 * redacción.
 */
export function AgendaPanel({
  agendas,
  activeBarberId,
  alerts,
  messageCount,
  onSelectBarber,
}: {
  agendas: Record<BarberId, AgendaSlot[]>;
  activeBarberId: BarberId;
  alerts: OwnerAlert[];
  messageCount: number;
  onSelectBarber: (barberId: BarberId) => void;
}) {
  const latestAlert = alerts[0];
  const slots = agendas[activeBarberId] ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col bg-paper-100">
      <header className="border-b border-paper-300 px-4 py-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">Tu agenda</p>
            <p className="text-xs text-ink-500">Disponibilidad por profesional</p>
          </div>
          <span className="font-mono text-xs uppercase tabular-nums text-ink-500">
            {salon.shortDay}
          </span>
        </div>

        <div
          role="group"
          aria-label="Profesional"
          className="mt-2.5 flex gap-1 rounded-lg bg-paper-200 p-1"
        >
          {barbers.map((barber) => {
            const active = barber.id === activeBarberId;
            const free = freeSlotsOf(agendas, barber.id).length;

            return (
              <button
                key={barber.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectBarber(barber.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-white text-ink-900 shadow-sm"
                    : "text-ink-600 hover:text-ink-900",
                )}
              >
                {barber.name}
                <span
                  className={cn(
                    "rounded-full px-1.5 font-mono text-[0.625rem] tabular-nums",
                    active ? "bg-brand-50 text-brand-700" : "bg-paper-300 text-ink-600",
                  )}
                >
                  {free}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-3.5 py-4">
        <ul className="flex flex-col gap-1.5">
          {slots.map((slot) => (
            <SlotRow key={`${activeBarberId}-${slot.time}`} slot={slot} />
          ))}
        </ul>

        {alerts.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500">
              Actividad
            </p>
            <ul className="flex flex-col gap-1.5">
              <AnimatePresence initial={false}>
                {alerts.map((alert) => (
                  <OwnerNotification key={alert.id} alert={alert} />
                ))}
              </AnimatePresence>
            </ul>
          </div>
        )}
      </div>

      {/* Indicador honesto: describe esta conversación, no un contador global
          inventado que subiría solo mientras mirás. */}
      <footer className="border-t border-paper-300 px-4 py-3">
        <p className="text-[0.6875rem] leading-relaxed text-ink-500">
          Esta conversación:{" "}
          <span className="font-mono tabular-nums text-ink-700">{messageCount}</span>{" "}
          mensajes · <span className="font-mono tabular-nums text-ink-700">0</span>{" "}
          interrupciones para vos
        </p>
      </footer>

      {/* Los cambios de agenda no son visibles para quien usa lector de
          pantalla: hay que anunciarlos aparte del hilo de mensajes. */}
      <div aria-live="polite" className="sr-only-live">
        {latestAlert?.text}
      </div>
    </div>
  );
}

function SlotRow({ slot }: { slot: AgendaSlot }) {
  const isNew = slot.state === "justBooked";
  const isFree = slot.state === "free";

  return (
    <li
      className={cn(
        "relative flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-inset transition-colors",
        isFree && "border border-dashed border-paper-400 bg-transparent ring-transparent",
        slot.state === "busy" && "bg-white ring-paper-300",
        isNew &&
          "bg-brand-50 ring-brand-300 motion-safe:animate-[slot-fill_0.7s_var(--ease-out-soft)_both]",
      )}
    >
      {isNew && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 size-2 -translate-y-1/2 rounded-full bg-brand-500 motion-safe:animate-[pulse-ring_2.4s_ease-out_infinite]"
        />
      )}

      <span
        className={cn(
          "w-12 shrink-0 font-mono text-xs tabular-nums",
          isNew ? "font-semibold text-brand-700" : "text-ink-500",
        )}
      >
        {slot.time}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[0.8125rem]",
          isFree && "text-ink-500",
          slot.state === "busy" && "text-ink-700",
          isNew && "font-medium text-brand-900",
        )}
      >
        {slot.label ?? "Libre"}
      </span>

      {isNew && (
        <span className="shrink-0 rounded-full bg-brand-600 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-wide text-white">
          Nuevo
        </span>
      )}
    </li>
  );
}

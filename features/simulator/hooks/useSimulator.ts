"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import {
  createInitialState,
  simReducer,
  type SimAction,
} from "@/features/simulator/engine/reducer";
import { resolveTurn } from "@/features/simulator/engine/graph";
import { autoplayScript, typingSpeedMs } from "@/features/simulator/data/autoplay";
import { browsingSuggestions } from "@/features/simulator/data/suggestions";

/**
 * Orquesta el motor: encola los mensajes de Polaria con sus tiempos de
 * "escribiendo…", aplica los efectos en el momento correcto y cede el control
 * al visitante en cuanto interactúa.
 *
 * Todo lo cancelable pasa por `runRef` (una tanda de respuestas queda obsoleta
 * si llega otra) y `abortedRef` (el autoplay muere apenas la persona toca algo).
 */
export function useSimulator() {
  const [state, dispatch] = useReducer(simReducer, undefined, createInitialState);
  const [draft, setDraft] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const prefersReduced = useReducedMotion() ?? false;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const stateRef = useRef(state);
  const runRef = useRef(0);
  const aliveRef = useRef(true);
  const busyRef = useRef(false);
  const abortedRef = useRef(false);
  const autoplayStartedRef = useRef(false);
  const timersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const reducedRef = useRef(prefersReduced);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    reducedRef.current = prefersReduced;
  }, [prefersReduced]);

  useEffect(() => {
    const timers = timersRef.current;
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      runRef.current += 1;
      abortedRef.current = true;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  /** Espera cancelable. Devuelve false si la tanda quedó obsoleta o se desmontó. */
  const wait = useCallback((ms: number, run: number) => {
    const duration = reducedRef.current ? Math.min(ms, 30) : ms;
    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        timersRef.current.delete(timer);
        resolve(aliveRef.current && runRef.current === run);
      }, duration);
      timersRef.current.add(timer);
    });
  }, []);

  /** Entrega un turno completo de Polaria. No distingue quién originó el mensaje. */
  const deliver = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || busyRef.current) return;

      const run = ++runRef.current;
      busyRef.current = true;
      setIsBusy(true);
      setDraft("");

      const finish = () => {
        busyRef.current = false;
        if (aliveRef.current) setIsBusy(false);
      };

      dispatch({ type: "USER_MESSAGE", text });

      const turn = resolveTurn(text, stateRef.current.context);
      if (turn.context) dispatch({ type: "PATCH_CONTEXT", patch: turn.context });

      // Los efectos aterrizan junto al mensaje que lleva la tarjeta de
      // confirmación; si no hay tarjeta, al cerrar el turno.
      const cardIndex = turn.messages.findIndex((m) => m.card);
      const applyAt = cardIndex === -1 ? turn.messages.length - 1 : cardIndex;

      for (let i = 0; i < turn.messages.length; i++) {
        const message = turn.messages[i];

        dispatch({ type: "TYPING", on: true });
        if (!(await wait(message.typingMs ?? 800, run))) {
          dispatch({ type: "TYPING", on: false });
          return finish();
        }

        dispatch({ type: "BOT_MESSAGE", text: message.text, card: message.card });

        if (i === applyAt && turn.effects?.length) {
          // Pequeño respiro para que se lea el mensaje antes de que la agenda
          // se mueva: primero el chat, después el panel del dueño.
          if (!(await wait(340, run))) return finish();
          dispatch({ type: "APPLY_EFFECTS", effects: turn.effects });
        }

        if (i < turn.messages.length - 1 && !(await wait(280, run))) {
          return finish();
        }
      }

      dispatch({
        type: "SET_SUGGESTIONS",
        suggestions: turn.suggests ?? browsingSuggestions,
      });
      finish();
    },
    [wait],
  );

  const abortAutoplay = useCallback(() => {
    if (!abortedRef.current) {
      abortedRef.current = true;
      dispatch({ type: "SET_PHASE", phase: "live" });
    }
  }, []);

  /** Envío iniciado por la persona: siempre corta el autoplay. */
  const send = useCallback(
    (text: string) => {
      abortAutoplay();
      void deliver(text);
    },
    [abortAutoplay, deliver],
  );

  /** Escribe el texto carácter por carácter en el compositor. */
  const typeInto = useCallback(
    async (text: string, run: number) => {
      if (reducedRef.current) {
        setDraft(text);
        return true;
      }
      for (let i = 1; i <= text.length; i++) {
        if (abortedRef.current || runRef.current !== run) return false;
        setDraft(text.slice(0, i));
        // Jitter determinista: humaniza sin recurrir a Math.random.
        if (!(await wait(typingSpeedMs + (i % 4) * 7, run))) return false;
      }
      return true;
    },
    [wait],
  );

  const runAutoplay = useCallback(async () => {
    // Si la persona ya interactuó antes de que el bloque entrara en pantalla,
    // el guion pierde sentido: la conversación ya es suya.
    if (autoplayStartedRef.current || abortedRef.current) return;
    autoplayStartedRef.current = true;

    dispatch({ type: "SET_PHASE", phase: "playing" });

    for (const step of autoplayScript) {
      if (abortedRef.current || !aliveRef.current) break;

      const run = runRef.current;
      if (!(await wait(step.delayBefore, run))) break;
      if (!(await typeInto(step.text, run))) break;
      if (!(await wait(260, run))) break;
      if (abortedRef.current) break;

      await deliver(step.text);
    }

    if (aliveRef.current) dispatch({ type: "SET_PHASE", phase: "live" });
  }, [deliver, typeInto, wait]);

  // Arranca sola al entrar en pantalla. Antes de eso el bloque está quieto.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          observer.disconnect();
          void runAutoplay();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [runAutoplay]);

  const reset = useCallback(() => {
    runRef.current += 1;
    busyRef.current = false;
    setIsBusy(false);
    setDraft("");
    abortedRef.current = true;
    autoplayStartedRef.current = true;
    dispatch({ type: "RESET" });
    dispatch({ type: "SET_PHASE", phase: "live" });
  }, []);

  const markAgendaSeen = useCallback(() => dispatch({ type: "SEEN_AGENDA" }), []);

  return {
    state,
    draft,
    setDraft,
    send,
    reset,
    isBusy,
    containerRef,
    abortAutoplay,
    markAgendaSeen,
    prefersReduced,
  };
}

export type SimulatorApi = ReturnType<typeof useSimulator>;
export type { SimAction };

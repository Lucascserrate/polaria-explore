"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, type FormEvent } from "react";
import { Send } from "@/components/ui/icons";
import { easeOutSoft } from "@/config/motion";
import { cn } from "@/lib/utils";

/**
 * Entrada del visitante.
 *
 * Los chips van primero porque nadie escribe en una landing sin un empujón, y
 * el input libre queda abierto a propósito: cualquier cosa que Polaria no
 * entienda termina en derivación a humano, así que no hay forma de romperla.
 */
export function Composer({
  draft,
  onDraftChange,
  onSend,
  onInteract,
  suggestions,
  isBusy,
}: {
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (text: string) => void;
  onInteract: () => void;
  suggestions: string[];
  isBusy: boolean;
}) {
  const reduced = useReducedMotion();
  const inputId = useId();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || isBusy) return;
    onSend(text);
  }

  return (
    <div className="border-t border-paper-300 bg-paper-100 px-3 pb-3 pt-2.5">
      <AnimatePresence initial={false}>
        {suggestions.length > 0 && !isBusy && (
          <motion.div
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: easeOutSoft }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1.5 pb-2.5">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    onInteract();
                    onSend(suggestion);
                  }}
                  className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-[0.8125rem] font-medium text-brand-700 transition hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <label htmlFor={inputId} className="sr-only-live">
          Escribí un mensaje como si fueras un cliente de la barbería
        </label>

        <input
          id={inputId}
          value={draft}
          onChange={(event) => {
            onInteract();
            onDraftChange(event.target.value);
          }}
          onFocus={onInteract}
          placeholder="Escribile como si fueras tu cliente…"
          autoComplete="off"
          className={cn(
            "h-11 min-w-0 flex-1 rounded-full border border-paper-300 bg-white px-4",
            "text-[0.9375rem] text-ink-900 placeholder:text-ink-500",
            "focus:border-brand-400 focus:outline-none",
          )}
        />

        <button
          type="submit"
          disabled={!draft.trim() || isBusy}
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition",
            "hover:bg-brand-700 active:scale-95",
            "disabled:cursor-not-allowed disabled:bg-paper-400 disabled:text-white/70",
          )}
        >
          <Send className="size-[1.15rem] -translate-x-px" />
          <span className="sr-only-live">Enviar mensaje</span>
        </button>
      </form>

      <p className="mt-2 text-center text-xs text-ink-500">
        Escribí lo que quieras.{" "}
        <span className="font-medium text-ink-700">Intentá confundirla.</span>
      </p>
    </div>
  );
}

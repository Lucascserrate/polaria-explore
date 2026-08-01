"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "motion/react";
import { getSimulatorOutro } from "@/config/cta";
import { Check } from "@/components/ui/icons";
import { easeOutSoft } from "@/config/motion";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error";

/**
 * Cierre del simulador.
 *
 * Es el único pedido de datos de toda la landing y aparece recién después de
 * que la persona confirmó una cita ficticia. Pedir un contacto arriba de todo
 * es pedirlo antes de haber demostrado nada.
 */
export function SimulatorOutro() {
  const outro = getSimulatorOutro();
  const reduced = useReducedMotion();
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = contact.trim();
    if (value.length < 6 || status === "sending") return;

    setStatus("sending");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: value, source: "simulador" }),
      });
      setStatus(response.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOutSoft }}
      className="mt-4 rounded-2xl bg-white/[0.06] p-5 ring-1 ring-inset ring-white/10 backdrop-blur-sm sm:p-6"
    >
      {status === "done" ? (
        <div className="flex items-center justify-center gap-2.5 py-2 text-center">
          <Check className="size-5 shrink-0 text-brand-300" />
          <p className="text-sm text-white/85">
            Anotado. Te escribimos cuando Polaria esté lista para vos.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-base font-semibold text-white">{outro.title}</p>
            <p className="mt-1 text-sm text-white/60">{outro.body}</p>
          </div>

          {outro.showForm && (
            <form
              onSubmit={handleSubmit}
              className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row"
            >
              <label htmlFor="waitlist-contact" className="sr-only-live">
                Tu número de WhatsApp
              </label>
              <input
                id="waitlist-contact"
                type="tel"
                inputMode="tel"
                required
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Tu WhatsApp"
                className={cn(
                  "h-11 rounded-full border border-white/15 bg-white/5 px-4 text-[0.9375rem] text-white",
                  "placeholder:text-white/40 focus:border-brand-300 focus:outline-none sm:w-52",
                )}
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="h-11 shrink-0 rounded-full bg-white px-5 text-[0.9375rem] font-medium text-ink-900 transition hover:bg-paper-200 active:scale-[0.98] disabled:opacity-60"
              >
                {status === "sending" ? "Enviando…" : "Avisame"}
              </button>
            </form>
          )}
        </div>
      )}

      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-attention-400">
          No pudimos guardarlo. Probá de nuevo en un momento.
        </p>
      )}
    </motion.div>
  );
}

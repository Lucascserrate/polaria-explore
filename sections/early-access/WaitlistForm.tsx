"use client";

import { useState, type FormEvent } from "react";
import { Check } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "done" | "error";

export function WaitlistForm() {
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
        body: JSON.stringify({ contact: value, source: "acceso-anticipado" }),
      });
      setStatus(response.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-confirm-50 p-5 ring-1 ring-inset ring-confirm-100">
        <Check className="size-5 shrink-0 text-confirm-700" />
        <p className="text-sm text-ink-700">
          Listo. Te escribimos por WhatsApp para coordinar la prueba con tu negocio.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="early-access-contact" className="sr-only-live">
          Tu número de WhatsApp
        </label>
        <input
          id="early-access-contact"
          type="tel"
          inputMode="tel"
          required
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="Tu WhatsApp"
          className={cn(
            "h-12 min-w-0 flex-1 rounded-full border border-paper-400 bg-white px-5",
            "text-[0.9375rem] text-ink-900 placeholder:text-ink-500",
            "focus:border-brand-500 focus:outline-none",
          )}
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="h-12 shrink-0 rounded-full bg-brand-600 px-7 font-medium text-white transition hover:bg-brand-700 active:scale-[0.98] disabled:opacity-60"
        >
          {status === "sending" ? "Enviando…" : "Quiero un cupo"}
        </button>
      </form>

      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-attention-700">
          No pudimos guardarlo. Probá de nuevo en un momento.
        </p>
      )}
    </div>
  );
}

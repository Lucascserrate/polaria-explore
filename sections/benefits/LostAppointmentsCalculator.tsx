"use client";

import { useId, useState } from "react";
import {
  benefits,
  calculatorAssumptions,
  estimateLostAppointments,
} from "@/content/benefits";

/**
 * Reemplaza a la sección de precios mientras el modelo comercial no esté
 * definido. Mantiene la conversación económica sin comprometer un número —y
 * de paso mide con qué volumen de mensajes trabaja quien visita la página.
 */
export function LostAppointmentsCalculator() {
  const [messagesPerDay, setMessagesPerDay] = useState<number>(
    calculatorAssumptions.default,
  );
  const sliderId = useId();
  const lost = estimateLostAppointments(messagesPerDay);

  return (
    <div className="rounded-3xl bg-ink-950 p-7 text-white sm:p-9">
      <h3 className="text-xl font-semibold tracking-[-0.025em] sm:text-2xl">
        {benefits.calculator.title}
      </h3>

      <div className="mt-8 grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <label htmlFor={sliderId} className="block text-sm text-white/60">
            {benefits.calculator.question}
          </label>

          <div className="mt-3 flex items-baseline gap-2">
            <output
              htmlFor={sliderId}
              className="font-mono text-4xl font-semibold tabular-nums text-white"
            >
              {messagesPerDay}
            </output>
            <span className="text-sm text-white/50">por día</span>
          </div>

          <input
            id={sliderId}
            type="range"
            min={calculatorAssumptions.min}
            max={calculatorAssumptions.max}
            step={1}
            value={messagesPerDay}
            onChange={(event) => setMessagesPerDay(Number(event.target.value))}
            aria-describedby={`${sliderId}-result`}
            className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-brand-400"
          />

          <div className="mt-2 flex justify-between font-mono text-xs tabular-nums text-white/35">
            <span>{calculatorAssumptions.min}</span>
            <span>{calculatorAssumptions.max}+</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.06] p-6 ring-1 ring-inset ring-white/10">
          <p className="text-sm text-white/60">{benefits.calculator.resultLabel}</p>
          <p
            id={`${sliderId}-result`}
            aria-live="polite"
            className="mt-2 font-mono text-5xl font-semibold tabular-nums text-brand-300"
          >
            {lost}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-white/45">
            {benefits.calculator.disclaimer}
          </p>
        </div>
      </div>

      <p className="mt-7 text-pretty text-sm leading-relaxed text-white/50">
        {benefits.calculator.footnote}
      </p>
    </div>
  );
}

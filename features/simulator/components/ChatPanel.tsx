"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/features/simulator/components/MessageBubble";
import { TypingIndicator } from "@/features/simulator/components/TypingIndicator";
import { Composer } from "@/features/simulator/components/Composer";
import { StarGlyph } from "@/components/layout/logo";
import { salon } from "@/features/simulator/data/salon";
import { formatClock } from "@/features/simulator/engine/reducer";
import type { SimulatorApi } from "@/features/simulator/hooks/useSimulator";

export function ChatPanel({ api }: { api: SimulatorApi }) {
  const { state, draft, setDraft, send, abortAutoplay, isBusy, prefersReduced } = api;
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Seguir la conversación sin arrastrar el scroll de la página.
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({
      top: element.scrollHeight,
      behavior: prefersReduced ? "auto" : "smooth",
    });
  }, [state.messages.length, state.typing, prefersReduced]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <header className="flex items-center gap-3 border-b border-paper-300 px-4 py-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600">
          <StarGlyph className="size-4 text-white" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-900">{salon.name}</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            <span className="size-1.5 rounded-full bg-confirm-500" />
            Polaria responde
          </p>
        </div>

        <span className="shrink-0 font-mono text-xs tabular-nums text-ink-500">
          {formatClock(state.clock)}
        </span>
      </header>

      <div
        ref={scrollRef}
        className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-3.5 py-4"
      >
        {/* El detalle que explica el producto entero: el mensaje llega
            un domingo a la noche, con la barbería cerrada. */}
        <p className="mx-auto rounded-full bg-paper-200 px-3 py-1 text-center text-[0.6875rem] font-medium text-ink-500">
          {salon.today} · {formatClock(salon.startClock)} · la barbería está cerrada
        </p>

        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-label="Conversación con Polaria"
          className="flex flex-col gap-2.5"
        >
          {state.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>

        {state.typing && <TypingIndicator />}
      </div>

      <Composer
        draft={draft}
        onDraftChange={setDraft}
        onSend={send}
        onInteract={abortAutoplay}
        suggestions={state.suggestions}
        isBusy={isBusy}
      />
    </div>
  );
}

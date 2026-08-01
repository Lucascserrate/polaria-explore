"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ChatMessage } from "@/features/simulator/types";
import { MessageActions } from "@/features/simulator/components/MessageActions";
import { Check } from "@/components/ui/icons";
import { easeOutSoft } from "@/config/motion";
import { cn } from "@/lib/utils";

/**
 * Burbuja de conversación.
 *
 * Decisión de marca: Polaria habla en azul a la izquierda y el cliente en gris
 * a la derecha — al revés que WhatsApp, donde lo coloreado es lo que uno envía.
 * Evoca un chat sin clonar una interfaz ajena, y deja la voz del producto como
 * el elemento visualmente dominante.
 */
export function MessageBubble({
  message,
  onSelectAction,
}: {
  message: ChatMessage;
  onSelectAction: (id: string, label: string) => void;
}) {
  const reduced = useReducedMotion();
  const isPolaria = message.sender === "polaria";

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.34, ease: easeOutSoft }}
      className={cn("flex w-full", isPolaria ? "justify-start" : "justify-end")}
    >
      <div
        className={cn(
          "flex max-w-[88%] flex-col gap-1.5",
          isPolaria ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[0.9375rem] leading-relaxed shadow-sm",
            isPolaria
              ? "rounded-bl-md bg-brand-600 text-white"
              : "rounded-br-md bg-paper-200 text-ink-900",
          )}
        >
          <p className="whitespace-pre-line text-pretty">{message.text}</p>

          {message.card && <ConfirmationCardView card={message.card} />}

          <span
            className={cn(
              "mt-1 block text-right font-mono text-[0.6875rem] tabular-nums",
              isPolaria ? "text-white/55" : "text-ink-500",
            )}
          >
            {message.time}
          </span>
        </div>

        {message.interactive && (
          <MessageActions
            interactive={message.interactive}
            disabled={message.actionsResolved ?? false}
            onSelect={onSelectAction}
          />
        )}
      </div>
    </motion.div>
  );
}

function ConfirmationCardView({ card }: { card: NonNullable<ChatMessage["card"]> }) {
  return (
    <div className="mt-2.5 rounded-xl bg-white p-3 text-ink-900 shadow-sm">
      <div className="flex items-center gap-1.5 text-confirm-700">
        <Check className="size-3.5" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Cita confirmada
        </span>
      </div>

      <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-ink-500">Servicio</dt>
        <dd className="text-right font-medium">{card.service}</dd>

        <dt className="text-ink-500">Cuándo</dt>
        <dd className="text-right font-medium">
          {card.day} · <span className="font-mono tabular-nums">{card.time}</span>
        </dd>

        <dt className="text-ink-500">Precio</dt>
        <dd className="text-right font-mono font-medium tabular-nums">{card.price}</dd>

        <dt className="text-ink-500">Atiende</dt>
        <dd className="text-right font-medium">{card.staff}</dd>
      </dl>
    </div>
  );
}

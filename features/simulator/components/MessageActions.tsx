"use client";

import type { Interactive } from "@/features/simulator/types";
import { ChevronRight } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Opciones tocables adjuntas a un mensaje.
 *
 * Es la representación de los mensajes interactivos de WhatsApp: botones de
 * respuesta rápida y mensajes de lista. La lista se muestra desplegada en vez
 * de detrás de un botón que abre una hoja: en una landing, esconder el
 * contenido del flujo sería esconder justamente lo que estamos demostrando.
 */
export function MessageActions({
  interactive,
  disabled,
  onSelect,
}: {
  interactive: Interactive;
  disabled: boolean;
  onSelect: (id: string, label: string) => void;
}) {
  if (interactive.kind === "buttons") {
    // Etiquetas cortas (horarios) van en fila; las largas, apiladas.
    const compact = interactive.actions.every((a) => a.label.length <= 9);

    return (
      <div
        className={cn(
          "w-full gap-1.5",
          compact
            ? "grid grid-flow-col auto-cols-fr"
            : "flex flex-col",
        )}
      >
        {interactive.actions.map((action) => (
          <button
            key={action.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(action.id, action.label)}
            className={cn(
              "rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-brand-700",
              "ring-1 ring-inset ring-paper-300 transition",
              "hover:bg-brand-50 hover:ring-brand-300 active:scale-[0.98]",
              "disabled:pointer-events-none disabled:opacity-45",
              compact && "font-mono tabular-nums",
            )}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl bg-white ring-1 ring-inset ring-paper-300">
      <p className="border-b border-paper-300 px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-ink-500">
        {interactive.title}
      </p>

      <ul>
        {interactive.actions.map((action) => (
          <li key={action.id} className="border-b border-paper-200 last:border-b-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(action.id, action.label)}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition",
                "hover:bg-brand-50 active:bg-brand-100",
                "disabled:pointer-events-none disabled:opacity-45",
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-ink-900">
                  {action.label}
                </span>
                {action.description && (
                  <span className="mt-0.5 block text-xs text-ink-500">
                    {action.description}
                  </span>
                )}
              </span>
              <ChevronRight className="size-4 shrink-0 text-brand-500" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

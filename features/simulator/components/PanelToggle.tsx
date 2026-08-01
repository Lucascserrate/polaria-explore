"use client";

import { cn } from "@/lib/utils";

export type PanelKey = "chat" | "agenda";

/**
 * Conmutador para móvil. El badge sobre "Agenda" es, en sí mismo, media demo:
 * algo pasó del lado del dueño sin que él hiciera nada.
 */
export function PanelToggle({
  value,
  onChange,
  badgeCount,
}: {
  value: PanelKey;
  onChange: (next: PanelKey) => void;
  badgeCount: number;
}) {
  return (
    // Botones con aria-pressed en vez de role="tab": en desktop los dos paneles
    // se ven a la vez y un tablist con tabs ocultos sería semántica falsa.
    <div
      role="group"
      aria-label="Vista del simulador"
      className="flex gap-1 rounded-full bg-paper-200 p-1 lg:hidden"
    >
      <Tab
        id="chat"
        label="Chat del cliente"
        short="Chat"
        active={value === "chat"}
        onSelect={() => onChange("chat")}
      />
      <Tab
        id="agenda"
        label="Tu agenda"
        short="Tu agenda"
        active={value === "agenda"}
        onSelect={() => onChange("agenda")}
        badgeCount={badgeCount}
      />
    </div>
  );
}

function Tab({
  id,
  label,
  short,
  active,
  onSelect,
  badgeCount = 0,
}: {
  id: PanelKey;
  label: string;
  short: string;
  active: boolean;
  onSelect: () => void;
  badgeCount?: number;
}) {
  return (
    <button
      type="button"
      id={`sim-tab-${id}`}
      aria-pressed={active}
      aria-controls={`sim-panel-${id}`}
      aria-label={label}
      onClick={onSelect}
      className={cn(
        "relative flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900",
      )}
    >
      {short}
      {badgeCount > 0 && !active && (
        <span
          className="absolute right-2 top-1.5 grid size-4 place-items-center rounded-full bg-attention-500 text-[0.5625rem] font-bold text-white"
          aria-label={`${badgeCount} novedades`}
        >
          {badgeCount}
        </span>
      )}
    </button>
  );
}

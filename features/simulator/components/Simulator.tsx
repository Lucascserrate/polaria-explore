"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ChatPanel } from "@/features/simulator/components/ChatPanel";
import { AgendaPanel } from "@/features/simulator/components/AgendaPanel";
import { PanelToggle, type PanelKey } from "@/features/simulator/components/PanelToggle";
import { SimulatorOutro } from "@/features/simulator/components/SimulatorOutro";
import { useSimulator } from "@/features/simulator/hooks/useSimulator";
import { cn } from "@/lib/utils";

/**
 * Shell de doble panel.
 *
 * Izquierda: el chat del cliente. Derecha: lo que ve el dueño.
 * En móvil se convierte en un conmutador, y el badge que salta sobre "Tu
 * agenda" cuenta la historia igual de bien que la vista partida.
 */
export function Simulator() {
  const api = useSimulator();
  const [panel, setPanel] = useState<PanelKey>("chat");

  function switchPanel(next: PanelKey) {
    setPanel(next);
    if (next === "agenda") api.markAgendaSeen();
  }

  return (
    <div ref={api.containerRef} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <PanelToggle
          value={panel}
          onChange={switchPanel}
          badgeCount={api.state.unseenAgendaUpdates}
        />

        {api.state.messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              api.reset();
              setPanel("chat");
            }}
            className="ml-auto shrink-0 text-xs font-medium text-white/45 underline-offset-4 transition hover:text-white/80 hover:underline"
          >
            Empezar de nuevo
          </button>
        )}
      </div>

      <div
        className={cn(
          "grid overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-32px_rgb(0_0_0/0.7)]",
          "ring-1 ring-white/10 lg:grid-cols-[1.08fr_0.92fr]",
        )}
      >
        <div
          id="sim-panel-chat"
          className={cn(
            "h-[30rem] min-h-0 sm:h-[33rem]",
            panel === "chat" ? "flex flex-col" : "hidden",
            "lg:flex lg:flex-col lg:border-r lg:border-paper-300",
          )}
        >
          <ChatPanel api={api} />
        </div>

        <div
          id="sim-panel-agenda"
          className={cn(
            "h-[30rem] min-h-0 sm:h-[33rem]",
            panel === "agenda" ? "flex flex-col" : "hidden",
            "lg:flex lg:flex-col",
          )}
        >
          <AgendaPanel api={api} />
        </div>
      </div>

      <AnimatePresence>{api.state.outroVisible && <SimulatorOutro />}</AnimatePresence>
    </div>
  );
}

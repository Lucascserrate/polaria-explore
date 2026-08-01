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
 * Izquierda: el chat del cliente, con la reserva guiada. Derecha: la agenda
 * del profesional que se esté eligiendo, que se mueve sola a medida que
 * avanza el flujo. En móvil se convierte en un conmutador, y el badge que
 * salta sobre "Tu agenda" cuenta la historia igual de bien.
 */
export function Simulator() {
  const {
    state,
    draft,
    setDraft,
    send,
    selectAction,
    setActiveBarber,
    reset,
    isBusy,
    attachContainer,
    abortAutoplay,
    markAgendaSeen,
    prefersReduced,
  } = useSimulator();

  const [panel, setPanel] = useState<PanelKey>("chat");

  function switchPanel(next: PanelKey) {
    setPanel(next);
    if (next === "agenda") markAgendaSeen();
  }

  const panelHeight = "h-[32rem] min-h-0 sm:h-[35rem]";

  return (
    <div ref={attachContainer} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <PanelToggle
          value={panel}
          onChange={switchPanel}
          badgeCount={state.unseenAgendaUpdates}
        />

        {state.messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              reset();
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
            panelHeight,
            panel === "chat" ? "flex flex-col" : "hidden",
            "lg:flex lg:flex-col lg:border-r lg:border-paper-300",
          )}
        >
          <ChatPanel
            messages={state.messages}
            typing={state.typing}
            clock={state.clock}
            suggestions={state.suggestions}
            draft={draft}
            isBusy={isBusy}
            prefersReduced={prefersReduced}
            onDraftChange={setDraft}
            onSend={send}
            onSelectAction={selectAction}
            onInteract={abortAutoplay}
          />
        </div>

        <div
          id="sim-panel-agenda"
          className={cn(
            panelHeight,
            panel === "agenda" ? "flex flex-col" : "hidden",
            "lg:flex lg:flex-col",
          )}
        >
          <AgendaPanel
            agendas={state.agendas}
            activeBarberId={state.activeBarberId}
            alerts={state.alerts}
            messageCount={state.messages.length}
            onSelectBarber={setActiveBarber}
          />
        </div>
      </div>

      <AnimatePresence>{state.outroVisible && <SimulatorOutro />}</AnimatePresence>
    </div>
  );
}

import type {
  ConfirmationCard,
  Effect,
  OwnerAlert,
  SimContext,
  SimPhase,
  SimState,
} from "@/features/simulator/types";
import { initialAgenda, salon } from "@/features/simulator/data/salon";
import { initialContext } from "@/features/simulator/engine/graph";
import { openingSuggestions } from "@/features/simulator/data/suggestions";

/** Única fuente de verdad del simulador. La UI sólo lee de acá. */

export type SimAction =
  | { type: "USER_MESSAGE"; text: string }
  | { type: "TYPING"; on: boolean }
  | { type: "BOT_MESSAGE"; text: string; card?: ConfirmationCard }
  | { type: "APPLY_EFFECTS"; effects: Effect[] }
  | { type: "SET_SUGGESTIONS"; suggestions: string[] }
  | { type: "PATCH_CONTEXT"; patch: Partial<SimContext> }
  | { type: "SET_PHASE"; phase: SimPhase }
  | { type: "SEEN_AGENDA" }
  | { type: "RESET" };

export function formatClock(minutes: number) {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function createInitialState(): SimState {
  return {
    phase: "idle",
    messages: [],
    typing: false,
    agenda: initialAgenda.map((slot) => ({ ...slot })),
    alerts: [],
    context: { ...initialContext },
    suggestions: openingSuggestions,
    clock: salon.startClock,
    seq: 0,
    unseenAgendaUpdates: 0,
    outroVisible: false,
  };
}

function applyEffect(state: SimState, effect: Effect, seq: number): SimState {
  const time = formatClock(state.clock);
  const alert = (kind: OwnerAlert["kind"], text: string): OwnerAlert => ({
    id: `alert-${seq}`,
    kind,
    text,
    time,
  });

  switch (effect.type) {
    case "appointment.created":
      return {
        ...state,
        agenda: state.agenda.map((slot) =>
          slot.time === effect.slot
            ? {
                ...slot,
                state: "justBooked",
                label: `${effect.service} · ${salon.clientName}`,
              }
            : slot,
        ),
        alerts: [
          alert("booked", `Cita nueva · ${effect.slot} · ${effect.service}`),
          ...state.alerts,
        ],
        unseenAgendaUpdates: state.unseenAgendaUpdates + 1,
        // El pedido de email llega recién acá: después del momento en que se
        // entendió el producto, no antes.
        outroVisible: true,
      };

    case "appointment.moved":
      return {
        ...state,
        agenda: state.agenda.map((slot) => {
          if (slot.time === effect.from) {
            return { ...slot, state: "free", label: undefined };
          }
          if (slot.time === effect.to) {
            return {
              ...slot,
              state: "justBooked",
              label: `${state.context.bookedService ?? "Corte"} · ${salon.clientName}`,
            };
          }
          return slot;
        }),
        alerts: [
          alert("moved", `Cita movida · ${effect.from} → ${effect.to}`),
          ...state.alerts,
        ],
        unseenAgendaUpdates: state.unseenAgendaUpdates + 1,
      };

    case "appointment.cancelled":
      return {
        ...state,
        agenda: state.agenda.map((slot) =>
          slot.time === effect.slot
            ? { ...slot, state: "free", label: undefined }
            : slot,
        ),
        alerts: [
          alert("cancelled", `Cita cancelada · ${effect.slot} · horario liberado`),
          ...state.alerts,
        ],
        unseenAgendaUpdates: state.unseenAgendaUpdates + 1,
      };

    case "handoff":
      return {
        ...state,
        alerts: [
          alert("handoff", `Requiere tu atención · «${effect.reason.trim()}»`),
          ...state.alerts,
        ],
        unseenAgendaUpdates: state.unseenAgendaUpdates + 1,
      };
  }
}

export function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "USER_MESSAGE": {
      const clock = state.clock + 1;
      return {
        ...state,
        clock,
        seq: state.seq + 1,
        suggestions: [],
        messages: [
          ...state.messages,
          {
            id: `m-${state.seq}`,
            sender: "client",
            text: action.text,
            time: formatClock(clock),
          },
        ],
      };
    }

    case "BOT_MESSAGE": {
      const clock = state.clock + 1;
      return {
        ...state,
        clock,
        seq: state.seq + 1,
        typing: false,
        messages: [
          ...state.messages,
          {
            id: `m-${state.seq}`,
            sender: "polaria",
            text: action.text,
            time: formatClock(clock),
            card: action.card,
          },
        ],
      };
    }

    case "TYPING":
      return { ...state, typing: action.on };

    case "APPLY_EFFECTS":
      return action.effects.reduce(
        (acc, effect, index) => applyEffect(acc, effect, state.seq + index),
        { ...state, seq: state.seq + action.effects.length },
      );

    case "SET_SUGGESTIONS":
      return { ...state, suggestions: action.suggestions };

    case "PATCH_CONTEXT":
      return { ...state, context: { ...state.context, ...action.patch } };

    case "SET_PHASE":
      return { ...state, phase: action.phase };

    case "SEEN_AGENDA":
      return { ...state, unseenAgendaUpdates: 0 };

    case "RESET":
      return createInitialState();
  }
}

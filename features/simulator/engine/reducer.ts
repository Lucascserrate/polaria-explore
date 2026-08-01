import type {
  BarberId,
  ChatMessage,
  Effect,
  Interactive,
  OwnerAlert,
  SimContext,
  SimPhase,
  SimState,
} from "@/features/simulator/types";
import {
  barberById,
  barbers,
  initialAgendas,
  salon,
} from "@/features/simulator/data/salon";
import { initialContext } from "@/features/simulator/engine/graph";
import { openingSuggestions } from "@/features/simulator/data/suggestions";

/** Única fuente de verdad del simulador. La UI sólo lee de acá. */

export type SimAction =
  | { type: "USER_MESSAGE"; text: string }
  | { type: "TYPING"; on: boolean }
  | {
      type: "BOT_MESSAGE";
      text: string;
      card?: ChatMessage["card"];
      interactive?: Interactive;
    }
  | { type: "APPLY_EFFECTS"; effects: Effect[] }
  | { type: "SET_SUGGESTIONS"; suggestions: string[] }
  | { type: "PATCH_CONTEXT"; patch: Partial<SimContext> }
  | { type: "SET_PHASE"; phase: SimPhase }
  | { type: "SET_ACTIVE_BARBER"; barberId: BarberId }
  | { type: "SEEN_AGENDA" }
  | { type: "RESET" };

export function formatClock(minutes: number) {
  const total = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function cloneAgendas() {
  return Object.fromEntries(
    Object.entries(initialAgendas).map(([id, slots]) => [
      id,
      slots.map((slot) => ({ ...slot })),
    ]),
  ) as Record<BarberId, SimState["agendas"][string]>;
}

export function createInitialState(): SimState {
  return {
    phase: "idle",
    messages: [],
    typing: false,
    agendas: cloneAgendas(),
    activeBarberId: barbers[0].id,
    alerts: [],
    context: { ...initialContext },
    suggestions: openingSuggestions,
    clock: salon.startClock,
    seq: 0,
    unseenAgendaUpdates: 0,
    outroVisible: false,
  };
}

/** Reemplaza un hueco en la agenda de un profesional. */
function patchSlot(
  state: SimState,
  barberId: BarberId,
  time: string,
  patch: Partial<SimState["agendas"][string][number]>,
): SimState["agendas"] {
  return {
    ...state.agendas,
    [barberId]: (state.agendas[barberId] ?? []).map((slot) =>
      slot.time === time ? { ...slot, ...patch } : slot,
    ),
  };
}

function applyEffect(state: SimState, effect: Effect, seq: number): SimState {
  const time = formatClock(state.clock);
  const alert = (
    kind: OwnerAlert["kind"],
    text: string,
    barberId?: BarberId,
  ): OwnerAlert => ({ id: `alert-${seq}`, kind, text, time, barberId });

  switch (effect.type) {
    case "barber.focus":
      return { ...state, activeBarberId: effect.barberId };

    case "appointment.created":
      return {
        ...state,
        agendas: patchSlot(state, effect.barberId, effect.slot, {
          state: "justBooked",
          label: `${effect.service} · ${salon.clientName}`,
        }),
        activeBarberId: effect.barberId,
        alerts: [
          alert(
            "booked",
            `Cita nueva · ${effect.slot} · ${effect.service} · ${barberById(effect.barberId).name}`,
            effect.barberId,
          ),
          ...state.alerts,
        ],
        unseenAgendaUpdates: state.unseenAgendaUpdates + 1,
        // El pedido de contacto llega recién acá: después del momento en que
        // se entendió el producto, no antes.
        outroVisible: true,
      };

    case "appointment.moved": {
      const freed = patchSlot(state, effect.barberId, effect.from, {
        state: "free",
        label: undefined,
      });
      return {
        ...state,
        agendas: {
          ...freed,
          [effect.barberId]: (freed[effect.barberId] ?? []).map((slot) =>
            slot.time === effect.to
              ? {
                  ...slot,
                  state: "justBooked",
                  label: `${state.context.bookedService ?? "Corte"} · ${salon.clientName}`,
                }
              : slot,
          ),
        },
        activeBarberId: effect.barberId,
        alerts: [
          alert(
            "moved",
            `Cita movida · ${effect.from} → ${effect.to} · ${barberById(effect.barberId).name}`,
            effect.barberId,
          ),
          ...state.alerts,
        ],
        unseenAgendaUpdates: state.unseenAgendaUpdates + 1,
      };
    }

    case "appointment.cancelled":
      return {
        ...state,
        agendas: patchSlot(state, effect.barberId, effect.slot, {
          state: "free",
          label: undefined,
        }),
        alerts: [
          alert(
            "cancelled",
            `Cita cancelada · ${effect.slot} · horario liberado`,
            effect.barberId,
          ),
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
        // Una vez que se respondió, las opciones anteriores quedan gastadas.
        messages: [
          ...state.messages.map((message) =>
            message.interactive && !message.actionsResolved
              ? { ...message, actionsResolved: true }
              : message,
          ),
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
            interactive: action.interactive,
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

    case "SET_ACTIVE_BARBER":
      return { ...state, activeBarberId: action.barberId };

    case "SEEN_AGENDA":
      return { ...state, unseenAgendaUpdates: 0 };

    case "RESET":
      return createInitialState();
  }
}

import type { OutgoingMessage, SimContext, Turn } from "@/features/simulator/types";
import { matchIntent, matchSlotChoice } from "@/features/simulator/engine/matcher";
import type { IntentId } from "@/features/simulator/engine/intents";
import {
  alternativeSlots,
  defaultOfferedSlots,
  formatPrice,
  salon,
} from "@/features/simulator/data/salon";
import {
  afterBookingSuggestions,
  browsingSuggestions,
  openingSuggestions,
  slotSuggestions,
} from "@/features/simulator/data/suggestions";

/**
 * Grafo de conversación.
 *
 * Las transiciones se calculan a partir del contexto en vez de estar cableadas,
 * que es lo que permite que "quiero cambiar mi cita" se comporte distinto según
 * haya o no una cita previa. Sin eso, la demo se nota guionada al segundo turno.
 */

/** El tiempo de "escribiendo…" crece con el largo del mensaje, con techo. */
function msg(text: string, extra?: Partial<OutgoingMessage>): OutgoingMessage {
  return {
    text,
    typingMs: Math.min(1500, 420 + text.length * 11),
    ...extra,
  };
}

const serviceLabels = salon.services.map((s) => `${s.label} — ${formatPrice(s.price)}`);

function bookingTurn(slot: string, ctx: SimContext): Turn {
  const service = ctx.pendingService ?? "Corte";
  const price =
    salon.services.find((s) => s.label === service)?.price ?? salon.services[0].price;

  if (ctx.movingAppointment && ctx.bookedSlot) {
    return {
      messages: [
        msg(`Listo, la moví a las ${slot}.`),
        msg("Martín va a ver el cambio apenas abra. No tenés que avisarle nada.", {
          card: {
            service,
            day: salon.targetDay,
            time: slot,
            price: formatPrice(price),
            staff: salon.owner,
          },
        }),
      ],
      effects: [{ type: "appointment.moved", from: ctx.bookedSlot, to: slot }],
      suggests: afterBookingSuggestions,
      context: {
        bookedSlot: slot,
        offeredSlots: [],
        movingAppointment: false,
      },
    };
  }

  return {
    messages: [
      msg("Listo, te agendé 👇", {
        card: {
          service,
          day: salon.targetDay,
          time: slot,
          price: formatPrice(price),
          staff: salon.owner,
        },
      }),
      msg(
        `Te va a llegar un recordatorio una hora antes. Si te surge algo, escribime y lo movemos.`,
      ),
    ],
    effects: [{ type: "appointment.created", slot, service }],
    suggests: afterBookingSuggestions,
    context: {
      hasAppointment: true,
      bookedSlot: slot,
      bookedService: service,
      offeredSlots: [],
      pendingService: null,
    },
  };
}

function offerSlotsTurn(): Turn {
  return {
    messages: [
      msg(`Para ${salon.targetDay} me quedan dos horarios:`),
      msg(
        `${defaultOfferedSlots.join("  ·  ")}\n\n¿Cuál te queda mejor?`,
      ),
    ],
    suggests: slotSuggestions(defaultOfferedSlots),
    context: {
      offeredSlots: defaultOfferedSlots,
      pendingService: "Corte",
      movingAppointment: false,
    },
  };
}

/** El fallback. Nunca es un error: es la derivación a humano, que es una función real. */
function handoffTurn(reason: string, opener?: string): Turn {
  return {
    messages: [
      msg(opener ?? "Uy, eso mejor te lo confirma Martín directamente."),
      msg(`Le paso tu mensaje y te responde apenas pueda 👍`),
    ],
    effects: [{ type: "handoff", reason }],
    suggests: browsingSuggestions,
    context: { offeredSlots: [] },
  };
}

const resolvers: Record<IntentId, (ctx: SimContext, input: string) => Turn> = {
  saludo: (ctx) => ({
    messages: [
      msg(`¡Hola! Soy Polaria, contesto por ${salon.name} 👋`),
      msg(
        ctx.greeted
          ? "¿En qué más te ayudo?"
          : `Hoy es ${salon.today} y la barbería está cerrada, pero te puedo dejar la cita agendada ahora mismo. ¿Qué necesitás?`,
      ),
    ],
    suggests: openingSuggestions,
    context: { greeted: true },
  }),

  disponibilidad: () => offerSlotsTurn(),

  precio: () => ({
    messages: [
      msg("Estos son los precios:"),
      msg(`${serviceLabels.join("\n")}\n\n¿Te agendo alguno?`),
    ],
    suggests: ["¿Tienen cita para mañana?", "Corte + barba", "¿Atienden niños?"],
  }),

  servicios: () => ({
    messages: [
      msg("Hacemos corte, barba, corte + barba y corte de niño."),
      msg(`${serviceLabels.join("\n")}`),
    ],
    suggests: ["¿Tienen cita para mañana?", "¿Cuánto cuesta un corte?"],
  }),

  horario: () => ({
    messages: [
      msg(`${salon.hours}. ${salon.closedNote}`),
      // La frase que explica el producto entero.
      msg("Yo contesto a cualquier hora, así que podés dejar tu cita lista ahora."),
    ],
    suggests: openingSuggestions,
  }),

  ubicacion: () => ({
    messages: [
      msg("Estamos en Av. Las Américas 480, a media cuadra del segundo anillo."),
      msg("Cuando confirmes la cita te mando la ubicación exacta por acá."),
    ],
    suggests: browsingSuggestions,
  }),

  cambiar_cita: (ctx) => {
    if (!ctx.hasAppointment) {
      return {
        messages: [
          msg("No encuentro ninguna cita a tu nombre."),
          msg("¿Querés que te agende una?"),
        ],
        suggests: openingSuggestions,
      };
    }

    const options = alternativeSlots.filter((s) => s !== ctx.bookedSlot);

    return {
      messages: [
        msg(
          `Tenés ${ctx.bookedService ?? "Corte"} ${salon.targetDay} a las ${ctx.bookedSlot}.`,
        ),
        msg(`Me quedan libres ${options.join(" y ")}. ¿A cuál la muevo?`),
      ],
      suggests: slotSuggestions(options),
      context: { offeredSlots: options, movingAppointment: true },
    };
  },

  cancelar: (ctx) => {
    if (!ctx.hasAppointment || !ctx.bookedSlot) {
      return {
        messages: [msg("No tengo ninguna cita a tu nombre para cancelar.")],
        suggests: openingSuggestions,
      };
    }

    return {
      messages: [
        msg(`Listo, cancelé tu cita de ${salon.targetDay} a las ${ctx.bookedSlot}.`),
        msg("Ya le avisé a Martín y el horario quedó libre para otra persona."),
      ],
      effects: [{ type: "appointment.cancelled", slot: ctx.bookedSlot }],
      suggests: openingSuggestions,
      context: {
        hasAppointment: false,
        bookedSlot: null,
        bookedService: null,
        offeredSlots: [],
      },
    };
  },

  confirmar: () => ({
    messages: [msg("Perfecto 👍")],
    suggests: afterBookingSuggestions,
  }),

  agradecer: () => ({
    messages: [msg("¡De nada! Cualquier cosa me escribís, estoy siempre acá.")],
    suggests: afterBookingSuggestions,
  }),

  ninos: () => ({
    messages: [
      msg(`Sí, atendemos niños. Corte niño — ${formatPrice(40)}.`),
      msg("¿Te agendo uno?"),
    ],
    suggests: ["¿Tienen cita para mañana?", "¿Cuánto cuesta un corte?"],
  }),

  pago: () => ({
    messages: [msg("Se puede pagar en efectivo, por QR o transferencia. Tarjeta todavía no.")],
    suggests: browsingSuggestions,
  }),

  // Casos que Polaria sí reconoce pero deliberadamente no responde sola.
  domicilio: (_ctx, input) =>
    handoffTurn(input, "El servicio a domicilio lo coordina Martín en persona."),

  humano: (_ctx, input) =>
    handoffTurn(input, "Dale, le paso tu mensaje a Martín ahora mismo."),
};

/**
 * Punto de entrada del motor: dado lo que escribió la persona y el contexto
 * actual, devuelve el turno completo de Polaria.
 */
export function resolveTurn(input: string, ctx: SimContext): Turn {
  // Si Polaria ofreció horarios, elegir uno tiene prioridad sobre cualquier
  // intención: "las 5" no es una consulta, es la respuesta a la pregunta previa.
  if (ctx.offeredSlots.length > 0) {
    const slot = matchSlotChoice(input, ctx.offeredSlots);
    if (slot) return bookingTurn(slot, ctx);
  }

  const match = matchIntent(input);

  // Un "dale" suelto mientras hay horarios sobre la mesa toma el primero.
  if (match?.id === "confirmar" && ctx.offeredSlots.length > 0) {
    return bookingTurn(ctx.offeredSlots[0], ctx);
  }

  if (!match) return handoffTurn(input);

  return resolvers[match.id](ctx, input);
}

export const initialContext: SimContext = {
  greeted: false,
  hasAppointment: false,
  bookedSlot: null,
  bookedService: null,
  offeredSlots: [],
  pendingService: null,
  movingAppointment: false,
};

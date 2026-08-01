import type {
	AgendaSlot,
	BarberId,
	ChatAction,
	OutgoingMessage,
	SimContext,
	Turn,
} from '@/features/simulator/types';
import {
	matchIntent,
	matchSlotChoice,
} from '@/features/simulator/engine/matcher';
import type { IntentId } from '@/features/simulator/engine/intents';
import {
	ANY_BARBER,
	MAX_OFFERED_SLOTS,
	barberById,
	barbers,
	firstBarberFreeAt,
	formatPrice,
	freeSlotsAnyBarber,
	freeSlotsOf,
	salon,
	serviceByKey,
} from '@/features/simulator/data/salon';
import {
	afterBookingSuggestions,
	browsingSuggestions,
	openingSuggestions,
} from '@/features/simulator/data/suggestions';
import {
	conversationalTypingMs,
	flowTypingMs,
} from '@/features/simulator/data/pacing';

/**
 * Grafo de conversación.
 *
 * Tiene dos caminos que conviven:
 *
 * 1. **Reserva guiada** — el flujo real del producto sobre mensajes
 *    interactivos de WhatsApp: menú → servicio → profesional → horario. Es el
 *    diferencial, así que es el camino por defecto.
 * 2. **Conversación libre** — lenguaje natural para todo lo demás, con
 *    derivación a humano cuando algo se sale del libreto.
 *
 * Las transiciones se calculan a partir del contexto y de la agenda real de
 * cada profesional, no están cableadas. Por eso los horarios que se ofrecen
 * cambian según a quién se elija.
 */

type Agendas = Record<BarberId, AgendaSlot[]>;

/** Mensaje conversacional: el tiempo de tipeo crece con el largo del texto. */
function msg(text: string, extra?: Partial<OutgoingMessage>): OutgoingMessage {
	return { text, typingMs: conversationalTypingMs(text.length), ...extra };
}

/** Paso de flujo guiado: se siente instantáneo, igual que un Flow real. */
function flowMsg(
	text: string,
	extra?: Partial<OutgoingMessage>,
): OutgoingMessage {
	return { text, typingMs: flowTypingMs(text.length), ...extra };
}

// ---------------------------------------------------------------------------
// Pasos del flujo guiado
// ---------------------------------------------------------------------------

const menuActions: ChatAction[] = [
	{ id: 'menu:reservar', label: 'Reservar una cita' },
	{ id: 'menu:precios', label: 'Ver precios' },
	{ id: 'menu:horarios', label: 'Horarios' },
];

function menuTurn(greeted: boolean): Turn {
	return {
		messages: [
			flowMsg(`¡Hola! Soy Polaria, contesto por ${salon.name} 👋`),
			flowMsg(
				greeted
					? '¿En qué más te ayudo?'
					: `Hoy es ${salon.today} y está cerrado, pero te puedo dejar la cita agendada ahora. ¿Qué querés hacer?`,
				{ interactive: { kind: 'buttons', actions: menuActions } },
			),
		],
		suggests: [],
		context: { greeted: true, flowStep: 'menu' },
	};
}

function serviceTurn(): Turn {
	const actions: ChatAction[] = salon.services.map((service) => ({
		id: `service:${service.key}`,
		label: service.label,
		description: `${formatPrice(service.price)} · ${service.minutes} min`,
	}));

	return {
		messages: [
			flowMsg('Perfecto. ¿Qué servicio necesitás?', {
				interactive: { kind: 'list', title: 'Servicios', actions },
			}),
		],
		suggests: [],
		context: { flowStep: 'service', movingAppointment: false },
	};
}

/**
 * Elección de profesional. Cada fila muestra cuántos huecos le quedan: el
 * visitante ve que la disponibilidad difiere antes incluso de elegir.
 */
function barberTurn(agendas: Agendas, serviceKey: string): Turn {
	const actions: ChatAction[] = barbers.map((barber) => {
		const count = freeSlotsOf(agendas, barber.id).length;
		return {
			id: `barber:${barber.id}`,
			label: barber.name,
			description: `${barber.role} · ${count} ${count === 1 ? 'horario libre' : 'horarios libres'}`,
		};
	});

	actions.push({
		id: `barber:${ANY_BARBER}`,
		label: 'Sin preferencia',
		description: `El primero que tenga lugar · ${freeSlotsAnyBarber(agendas).length} horarios`,
	});

	const service = serviceByKey(serviceKey);

	return {
		messages: [
			flowMsg(
				`${service.label}, anotado. ¿Tenés algún barbero de preferencia?`,
				{
					interactive: { kind: 'list', title: 'Profesionales', actions },
				},
			),
		],
		suggests: [],
		context: { flowStep: 'barber', selectedServiceKey: serviceKey },
	};
}

/** Horarios del profesional elegido. Es el momento en que la agenda importa. */
function slotTurn(agendas: Agendas, selection: BarberId | 'any'): Turn {
	const isAny = selection === ANY_BARBER;
	const available = isAny
		? freeSlotsAnyBarber(agendas)
		: freeSlotsOf(agendas, selection);
	const offered = available.slice(0, MAX_OFFERED_SLOTS);

	if (offered.length === 0) {
		return {
			messages: [
				flowMsg(
					isAny
						? `No queda ningún horario libre ${salon.targetDay}.`
						: `${barberById(selection).name} no tiene horarios libres ${salon.targetDay}.`,
				),
				flowMsg('¿Querés que busque con otro profesional?', {
					interactive: {
						kind: 'buttons',
						actions: [
							{ id: 'menu:reservar', label: 'Ver otros profesionales' },
							{ id: `barber:${ANY_BARBER}`, label: 'Sin preferencia' },
						],
					},
				}),
			],
			suggests: [],
			context: { flowStep: 'barber' },
		};
	}

	const who = isAny ? 'en total' : `con ${barberById(selection).name}`;

	return {
		messages: [
			flowMsg(`Estos son los horarios libres ${who} para ${salon.targetDay}:`, {
				interactive: {
					kind: 'buttons',
					actions: offered.map((time) => ({ id: `slot:${time}`, label: time })),
				},
			}),
		],
		// El panel derecho se mueve a la agenda de esa persona: el visitante ve
		// que los horarios ofrecidos son exactamente los huecos de ese profesional.
		effects: isAny ? [] : [{ type: 'barber.focus', barberId: selection }],
		suggests: [],
		context: {
			flowStep: 'slot',
			selectedBarberId: selection,
			offeredSlots: offered,
		},
	};
}

function bookingTurn(agendas: Agendas, slot: string, ctx: SimContext): Turn {
	const selection = ctx.selectedBarberId ?? ANY_BARBER;
	const barberId =
		selection === ANY_BARBER ? firstBarberFreeAt(agendas, slot) : selection;
	const barber = barberById(barberId);
	const service = serviceByKey(ctx.selectedServiceKey);

	const card = {
		service: service.label,
		day: salon.targetDay,
		time: slot,
		price: formatPrice(service.price),
		staff: barber.name,
	};

	if (ctx.movingAppointment && ctx.bookedSlot) {
		return {
			messages: [
				flowMsg(`Listo, la moví a las ${slot}.`, { card }),
				msg(
					'Martín va a ver el cambio apenas abra. No tenés que avisarle nada.',
				),
			],
			effects: [
				{ type: 'appointment.moved', from: ctx.bookedSlot, to: slot, barberId },
				{ type: 'barber.focus', barberId },
			],
			suggests: afterBookingSuggestions,
			context: {
				bookedSlot: slot,
				offeredSlots: [],
				movingAppointment: false,
				flowStep: null,
			},
		};
	}

	return {
		messages: [
			flowMsg(
				selection === ANY_BARBER
					? `Listo, te agendé con ${barber.name}, que tiene ese horario libre 👇`
					: 'Listo, te agendé 👇',
				{ card },
			),
			msg(
				'Te mando un recordatorio una hora antes. Si te surge algo, escribime.',
			),
		],
		effects: [
			{ type: 'appointment.created', slot, service: service.label, barberId },
			{ type: 'barber.focus', barberId },
		],
		suggests: afterBookingSuggestions,
		context: {
			hasAppointment: true,
			bookedSlot: slot,
			bookedService: service.label,
			bookedBarberId: barberId,
			offeredSlots: [],
			flowStep: null,
		},
	};
}

/** El fallback. Nunca es un error: es la derivación a humano. */
function handoffTurn(reason: string, opener?: string): Turn {
	return {
		messages: [
			msg(opener ?? 'Uy, eso mejor te lo confirma Martín directamente.'),
			msg('Le paso tu mensaje y te responde apenas pueda 👍'),
		],
		effects: [{ type: 'handoff', reason }],
		suggests: browsingSuggestions,
		context: { flowStep: null, offeredSlots: [] },
	};
}

/** Botón para volver al flujo desde una respuesta conversacional. */
const backToBooking: ChatAction[] = [
	{ id: 'menu:reservar', label: 'Reservar una cita' },
];

// ---------------------------------------------------------------------------
// Conversación libre
// ---------------------------------------------------------------------------

const serviceLines = salon.services.map(
	(s) => `${s.label} — ${formatPrice(s.price)}`,
);

const resolvers: Record<
	IntentId,
	(ctx: SimContext, input: string, agendas: Agendas) => Turn
> = {
	saludo: (ctx) => menuTurn(ctx.greeted),

	disponibilidad: () => serviceTurn(),

	precio: () => ({
		messages: [
			msg('Estos son los precios:'),
			flowMsg(serviceLines.join('\n'), {
				interactive: { kind: 'buttons', actions: backToBooking },
			}),
		],
		suggests: [],
	}),

	servicios: () => ({
		messages: [
			msg('Hacemos corte, barba, corte + barba y corte de niño.'),
			flowMsg(serviceLines.join('\n'), {
				interactive: { kind: 'buttons', actions: backToBooking },
			}),
		],
		suggests: [],
	}),

	horario: () => ({
		messages: [
			msg(`${salon.hours}. ${salon.closedNote}`),
			// La frase que explica el producto entero.
			flowMsg(
				'Yo contesto a cualquier hora, así que podés dejar tu cita lista ahora.',
				{
					interactive: { kind: 'buttons', actions: backToBooking },
				},
			),
		],
		suggests: [],
	}),

	ubicacion: () => ({
		messages: [
			msg(
				'Estamos en Av. Las Américas 480, a media cuadra del segundo anillo.',
			),
			flowMsg(
				'Cuando confirmes la cita te mando la ubicación exacta por acá.',
				{
					interactive: { kind: 'buttons', actions: backToBooking },
				},
			),
		],
		suggests: [],
	}),

	cambiar_cita: (ctx, _input, agendas) => {
		if (!ctx.hasAppointment || !ctx.bookedBarberId) {
			return {
				messages: [
					msg('No encuentro ninguna cita a tu nombre.'),
					flowMsg('¿Querés que te agende una?', {
						interactive: { kind: 'buttons', actions: backToBooking },
					}),
				],
				suggests: [],
			};
		}

		const options = freeSlotsOf(agendas, ctx.bookedBarberId).slice(
			0,
			MAX_OFFERED_SLOTS,
		);
		const barber = barberById(ctx.bookedBarberId);

		if (options.length === 0) {
			return {
				messages: [
					msg(`A ${barber.name} no le queda otro hueco ${salon.targetDay}.`),
					flowMsg('¿Probamos con otro profesional?', {
						interactive: { kind: 'buttons', actions: backToBooking },
					}),
				],
				suggests: [],
			};
		}

		return {
			messages: [
				msg(
					`Tenés ${ctx.bookedService ?? 'Corte'} con ${barber.name} ${salon.targetDay} a las ${ctx.bookedSlot}.`,
				),
				flowMsg('¿A qué horario la muevo?', {
					interactive: {
						kind: 'buttons',
						actions: options.map((time) => ({
							id: `slot:${time}`,
							label: time,
						})),
					},
				}),
			],
			effects: [{ type: 'barber.focus', barberId: ctx.bookedBarberId }],
			suggests: [],
			context: {
				flowStep: 'slot',
				offeredSlots: options,
				movingAppointment: true,
				selectedBarberId: ctx.bookedBarberId,
			},
		};
	},

	cancelar: (ctx) => {
		if (!ctx.hasAppointment || !ctx.bookedSlot || !ctx.bookedBarberId) {
			return {
				messages: [msg('No tengo ninguna cita a tu nombre para cancelar.')],
				suggests: openingSuggestions,
			};
		}

		return {
			messages: [
				msg(
					`Listo, cancelé tu cita de ${salon.targetDay} a las ${ctx.bookedSlot}.`,
				),
				msg('Ya le avisé a Martín y el horario quedó libre para otra persona.'),
			],
			effects: [
				{
					type: 'appointment.cancelled',
					slot: ctx.bookedSlot,
					barberId: ctx.bookedBarberId,
				},
			],
			suggests: openingSuggestions,
			context: {
				hasAppointment: false,
				bookedSlot: null,
				bookedService: null,
				bookedBarberId: null,
				offeredSlots: [],
				flowStep: null,
			},
		};
	},

	confirmar: () => ({
		messages: [msg('Perfecto 👍')],
		suggests: afterBookingSuggestions,
	}),

	agradecer: () => ({
		messages: [msg('¡De nada! Cualquier cosa me escribís, estoy siempre acá.')],
		suggests: afterBookingSuggestions,
	}),

	ninos: () => ({
		messages: [
			msg(`Sí, atendemos niños. Corte niño — ${formatPrice(40)}.`),
			flowMsg('¿Te agendo uno?', {
				interactive: { kind: 'buttons', actions: backToBooking },
			}),
		],
		suggests: [],
	}),

	pago: () => ({
		messages: [
			msg(
				'Se puede pagar en efectivo, por QR o transferencia. Tarjeta todavía no.',
			),
		],
		suggests: browsingSuggestions,
	}),

	// Casos que Polaria reconoce pero deliberadamente no responde sola.
	domicilio: (_ctx, input) =>
		handoffTurn(
			input,
			'El servicio a domicilio lo coordina Martín en persona.',
		),

	humano: (_ctx, input) =>
		handoffTurn(input, 'Dale, le paso tu mensaje a Martín ahora mismo.'),
};

// ---------------------------------------------------------------------------
// Entrada del motor
// ---------------------------------------------------------------------------

/**
 * Separa `"slot:14:30"` en `["slot", "14:30"]`.
 *
 * Hay que cortar por el PRIMER separador: los horarios llevan dos puntos, así
 * que un `split(":")` devolvería "14" y la reserva se agendaría en un hueco
 * inexistente.
 */
function parseActionId(actionId: string): [string, string] {
	const index = actionId.indexOf(':');
	return index === -1
		? [actionId, '']
		: [actionId.slice(0, index), actionId.slice(index + 1)];
}

function handleAction(
	actionId: string,
	ctx: SimContext,
	agendas: Agendas,
): Turn | null {
	const [scope, value] = parseActionId(actionId);

	switch (scope) {
		case 'menu':
			if (value === 'reservar') return serviceTurn();
			if (value === 'precios') return resolvers.precio(ctx, '', agendas);
			if (value === 'horarios') return resolvers.horario(ctx, '', agendas);
			return null;

		case 'service':
			return barberTurn(agendas, value);

		case 'barber':
			return slotTurn(agendas, value);

		case 'slot':
			return bookingTurn(agendas, value, ctx);

		default:
			return null;
	}
}

/** Busca una opción del paso actual dentro de texto escrito a mano. */
function matchActionByText(
	input: string,
	actions: ChatAction[],
): string | null {
	const normalized = input
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '');
	for (const action of actions) {
		const label = action.label
			.toLowerCase()
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '');
		if (normalized.includes(label)) return action.id;
	}
	return null;
}

/**
 * Punto de entrada del motor.
 *
 * `actionId` llega cuando la persona tocó una opción; en ese caso la
 * transición es determinista. Si escribió a mano, se intenta primero
 * interpretarlo dentro del paso actual del flujo y después como conversación.
 */
export function resolveTurn(
	input: string,
	ctx: SimContext,
	agendas: Agendas,
	actionId?: string,
): Turn {
	if (actionId) {
		const turn = handleAction(actionId, ctx, agendas);
		if (turn) return turn;
	}

	// Dentro del flujo, la respuesta al paso actual tiene prioridad sobre
	// cualquier intención: "las 5" no es una consulta, es una elección.
	if (ctx.flowStep === 'slot' && ctx.offeredSlots.length > 0) {
		const slot = matchSlotChoice(input, ctx.offeredSlots);
		if (slot) return bookingTurn(agendas, slot, ctx);
	}

	if (ctx.flowStep === 'service') {
		const match = matchActionByText(
			input,
			salon.services.map((s) => ({ id: `service:${s.key}`, label: s.label })),
		);
		if (match) return barberTurn(agendas, parseActionId(match)[1]);
	}

	if (ctx.flowStep === 'barber') {
		const options: ChatAction[] = [
			...barbers.map((b) => ({ id: `barber:${b.id}`, label: b.name })),
			{ id: `barber:${ANY_BARBER}`, label: 'sin preferencia' },
			{ id: `barber:${ANY_BARBER}`, label: 'cualquiera' },
			{ id: `barber:${ANY_BARBER}`, label: 'me da igual' },
		];
		const match = matchActionByText(input, options);
		if (match) return slotTurn(agendas, parseActionId(match)[1]);
	}

	const intent = matchIntent(input);

	// Un "dale" suelto mientras hay horarios sobre la mesa toma el primero.
	if (
		intent?.id === 'confirmar' &&
		ctx.flowStep === 'slot' &&
		ctx.offeredSlots[0]
	) {
		return bookingTurn(agendas, ctx.offeredSlots[0], ctx);
	}

	if (!intent) return handoffTurn(input);

	return resolvers[intent.id](ctx, input, agendas);
}

export const initialContext: SimContext = {
	greeted: false,
	hasAppointment: false,
	bookedSlot: null,
	bookedService: null,
	bookedBarberId: null,
	offeredSlots: [],
	flowStep: null,
	selectedServiceKey: null,
	selectedBarberId: null,
	movingAppointment: false,
};

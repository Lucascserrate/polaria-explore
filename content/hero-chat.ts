/**
 * El guion de la conversación del hero.
 *
 * Es el mismo camino que recorre el producto real: menú → servicio →
 * profesional → horario → confirmación. La demo del hero no razona ni acepta
 * texto libre (eso es `features/simulator`): reproduce este guion, y por eso
 * puede ser un guion y no un motor.
 *
 * Cambiar de rubro es editar este archivo. No hay nada de barbería en la UI.
 *
 * Sin `Date.now()`: las horas son literales del guion para que el render del
 * servidor y el del cliente coincidan.
 */

export type ChatOption = {
	label: string;
	/** Valor secundario de la fila: precio, duración, lo que aporte contexto. */
	meta?: string;
};

export type CardRow = { label: string; value: string };

/**
 * Lo que WhatsApp llama mensajes interactivos. Es el diferencial de la reserva
 * guiada: el cliente toca, no escribe. Si esto se dibujara como texto plano,
 * la demo dejaría de demostrar justamente lo que hay que demostrar.
 */
export type Attachment =
	| { kind: 'buttons'; items: readonly ChatOption[] }
	| { kind: 'list'; title: string; items: readonly ChatOption[] }
	| { kind: 'slots'; title: string; items: readonly ChatOption[] }
	| {
			kind: 'card';
			/** "review" = resumen antes de confirmar. "done" = turno agendado. */
			tone: 'review' | 'done';
			title: string;
			rows: readonly CardRow[];
			items?: readonly ChatOption[];
	  };

export type ChatStep = {
	from: 'client' | 'polaria';
	text: string;
	time: string;
	attach?: Attachment;
	/**
	 * Qué opción toca el cliente y con qué queda respondido el mensaje.
	 * `index` apunta a `attach.items`. Sin `pick`, el mensaje no espera respuesta.
	 */
	pick?: { index: number; reply: string; time: string };
};

export const heroChat = {
	/**
	 * El cliente le escribe al negocio, no a "Polaria": el número es del salón y
	 * Polaria es quien contesta. La cabecera lo dice en ese orden.
	 */
	contact: {
		name: 'Tu negocio',
		status: 'en línea',
		answeredBy: 'responde Polaria',
	},
	dayPill: 'Hoy',
	composerPlaceholder: 'Escribí un mensaje',

	steps: [
		{
			from: 'client',
			text: 'Buenas tardes, quiero agendar un corte.',
			time: '16:02',
		},
		{
			from: 'polaria',
			text: 'Hola Pedro 👋 ¿En qué puedo ayudarte?',
			time: '16:02',
			attach: {
				kind: 'buttons',
				items: [{ label: 'Agendar una cita' }, { label: 'Hablar con alguien' }],
			},
			pick: { index: 0, reply: 'Agendar una cita', time: '16:02' },
		},
		{
			from: 'polaria',
			text: '¿Qué servicio te gustaría agendar?',
			time: '16:03',
			attach: {
				kind: 'list',
				title: 'Servicios',
				items: [
					{ label: 'Barba', meta: 'Bs 60' },
					{ label: 'Corte', meta: 'Bs 100' },
					{ label: 'Decoloración', meta: 'Bs 120' },
					{ label: 'Perfilado de cejas', meta: 'Bs 50' },
				],
			},
			pick: { index: 1, reply: 'Corte · Bs 100', time: '16:03' },
		},
		{
			from: 'polaria',
			text: '¿Tenés algún profesional de preferencia?',
			time: '16:03',
			attach: {
				kind: 'buttons',
				items: [
					{ label: 'Fabián' },
					{ label: 'Marco' },
					{ label: 'Ernesto' },
					{ label: 'Sin preferencia' },
				],
			},
			pick: { index: 0, reply: 'Fabián', time: '16:04' },
		},
		{
			from: 'polaria',
			text: 'Estos son los horarios disponibles para Fabián:',
			time: '16:04',
			attach: {
				kind: 'slots',
				title: 'Mañana',
				items: [
					{ label: '10:00' },
					{ label: '11:30' },
					{ label: '14:00' },
					{ label: '16:30' },
					{ label: '18:00' },
				],
			},
			pick: { index: 3, reply: '16:30', time: '16:04' },
		},
		{
			from: 'polaria',
			text: 'Revisá tu turno antes de confirmarlo.',
			time: '16:05',
			attach: {
				kind: 'card',
				tone: 'review',
				title: 'Tu turno',
				rows: [
					{ label: 'Servicio', value: 'Corte' },
					{ label: 'Profesional', value: 'Fabián' },
					{ label: 'Fecha', value: 'Mañana' },
					{ label: 'Hora', value: '16:30' },
					{ label: 'Precio', value: 'Bs 100' },
				],
				items: [{ label: 'Confirmar' }, { label: 'Cancelar' }],
			},
			pick: { index: 0, reply: 'Confirmar', time: '16:05' },
		},
		{
			from: 'polaria',
			text: '¡Listo! Tu turno quedó agendado 🎉 Te escribo un recordatorio un día antes.',
			time: '16:05',
			attach: {
				kind: 'card',
				tone: 'done',
				title: 'Corte',
				rows: [
					{ label: 'Profesional', value: 'Fabián' },
					{ label: 'Cuándo', value: 'Mañana · 16:30' },
					{ label: 'Precio', value: 'Bs 100' },
				],
			},
		},
	] satisfies readonly ChatStep[],
} as const;

/**
 * Índice del paso que confirma la cita. La agenda que acompaña al teléfono
 * enciende el horario recién reservado cuando el guion llega acá, así que el
 * dato vive junto al guion y no repetido en la UI.
 */
export const BOOKING_STEP = heroChat.steps.length - 1;

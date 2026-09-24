/**
 * El texto de la cuenta de quien reserva.
 *
 * Aparte de `content/booking.ts` porque es de otro dominio: la reserva es del
 * negocio, la cuenta es de la persona y la acompaña de un negocio a otro. Mismo
 * registro que el resto del sitio: le habla al cliente, no a un negocio.
 */
export const account = {
	nav: {
		label: 'Tu cuenta',
		home: 'Polaria, ir al inicio',
	},

	forBusiness: 'Para negocios',
	menu: {
		open: 'Abrir el menú de tu cuenta',
	},
	login: 'Acceder',

	bar: {
		label: 'Tu cuenta',
		logout: 'Cerrar sesión',
	},

	/**
	 * El historial: la lista de turnos de la cuenta y el turno abierto.
	 *
	 * "Próximas" y "Anteriores" y no "Próximas" y "Pasadas": lo que hay abajo
	 * incluye turnos cancelados de mañana, que no pasaron. "Anteriores" dice
	 * "esto ya no es lo que viene" sin prometer que ocurrió.
	 */
	history: {
		title: 'Historial',
		/** El nombre de la sección en el menú de la cuenta. */
		menu: 'Historial',
		upcoming: 'Próximas',
		past: 'Anteriores',
		/** Sin turnos de ningún tipo: la cuenta recién creada. */
		empty: {
			title: 'Todavía no tenés turnos',
			body: 'Cuando reserves, acá vas a poder ver el detalle, cómo llegar y gestionar cada turno.',
			cta: 'Buscar un negocio',
		},
		/** Con próximas pero sin anteriores, y al revés. */
		noUpcoming: 'No tenés turnos por delante.',
		noPast: 'Acá van a aparecer los turnos que ya pasaron.',
		/** El lado derecho en escritorio, antes de elegir uno. */
		pick: 'Elegí un turno para ver el detalle.',
	},

	/** El día suelto, para donde no entra la frase entera. */
	day: {
		today: 'Hoy',
		tomorrow: 'Mañana',
	},

	appointment: {
		back: 'Volver al historial',
		/**
		 * Cuándo es, como encabezado.
		 *
		 * "Hoy" y "mañana" se escriben así porque es como se lo dice alguien a sí
		 * mismo; para el resto la fecha completa, que es lo que hay que anotar. El
		 * día y la hora van juntos en una sola frase y no en dos líneas: lo que se
		 * busca al abrir esto es "cuándo tengo que estar ahí".
		 */
		when: {
			today: (time: string) => `Hoy a las ${time}`,
			tomorrow: (time: string) => `Mañana a las ${time}`,
			onDay: (day: string, time: string) => `${day} a las ${time}`,
		},
		/** Cuánto dura estar ahí. Ver `durationMinutes`. */
		duration: (text: string) => `${text} de duración`,
		summary: 'Resumen',
		total: 'Total',
		/** Cuando algún servicio se cotiza y el total no se puede escribir. */
		quotedTotal: 'A confirmar en el local',
		/** Debajo del nombre del servicio, cuando se sabe quién atiende. */
		with: (staff: string) => `Con ${staff}`,
		actions: {
			label: 'Qué podés hacer con este turno',
			directions: 'Cómo llegar',
			place: 'Ver lugar',
		},
		/**
		 * "Dónde es" y no el "Dónde estamos" de la página del negocio: acá no habla
		 * el local sino Polaria, y el turno puede ser de cualquiera de ellos.
		 */
		location: {
			title: 'Dónde es',
			directions: 'Abrir en el mapa',
		},
		note: 'Información importante',
		/**
		 * Mover el turno de horario.
		 *
		 * "Cambiar el horario" y no "reagendar": es la misma cita con otra hora, y
		 * el texto tiene que decir exactamente eso para que nadie tema perder el
		 * turno al tocarlo. Lo que **no** cambia —los servicios y quién atiende— se
		 * dice de frente, porque es la primera pregunta de quien reservó con
		 * alguien en particular.
		 */
		reschedule: {
			action: 'Cambiar el horario',
			title: 'Cambiar el horario',
			keeps: 'Se mantienen los mismos servicios y la misma persona que te atiende. Para cambiar eso, cancelá y reservá de nuevo.',
			current: (when: string) => `Ahora es ${when}.`,
			pickDay: 'Elegí el día',
			pickTime: 'Elegí la hora',
			noSlots: 'No quedan horarios ese día. Probá con otro.',
			loading: 'Buscando horarios…',
			confirm: (when: string) => `Mover a ${when}`,
			pending: 'Moviendo…',
			failed: 'No pudimos mover el turno. Probá de nuevo.',
			back: 'Volver al turno',
			/** Ningún día disponible en el próximo mes. */
			noDays:
				'No encontramos días con lugar en el próximo mes. Escribile al negocio.',
		},

		/**
		 * Cancelar, en dos toques.
		 *
		 * No pregunta "¿estás seguro?" sino que dice qué pasa: el horario queda
		 * libre para otra persona y recuperarlo no depende de nosotros. Es la
		 * información que hace falta para decidir, y "seguro" no la da.
		 */
		cancel: {
			action: 'Cancelar turno',
			question: '¿Cancelamos este turno?',
			warning:
				'El horario queda libre para otra persona, así que puede que no lo encuentres si cambiás de idea.',
			confirm: 'Sí, cancelar',
			dismiss: 'No, dejarlo',
			pending: 'Cancelando…',
			failed: 'No pudimos cancelarlo. Probá de nuevo.',
		},
		status: {
			pending: 'Pendiente',
			confirmed: 'Confirmada',
			cancelled: 'Cancelada',
			completed: 'Atendida',
		},
	},
};

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
		status: {
			pending: 'Pendiente',
			confirmed: 'Confirmada',
			cancelled: 'Cancelada',
			completed: 'Atendida',
		},
	},
};

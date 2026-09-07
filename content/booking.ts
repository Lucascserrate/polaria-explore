/**
 * Todo el texto visible de la página pública de reservas.
 *
 * La regla del proyecto —el copy vive en `content/`— vale también acá, y en
 * esta página vale doble: es la única del sitio que no le habla a un negocio
 * sino a **su cliente**, y ese registro es fácil de perder si cada componente
 * escribe lo suyo. Nada de "gestioná", "optimizá" ni "plataforma": alguien que
 * quiere cortarse el pelo el sábado no vino a leer sobre software.
 *
 * Tampoco hay una sola mención a Polaria en el cuerpo de la página. El negocio
 * es el que recibe al cliente; nosotros somos la línea del pie.
 */
export const booking = {
	/** Lo primero que se lee, arriba de todo. */
	header: {
		servicesCount: (count: number) =>
			count === 1 ? '1 servicio disponible' : `${count} servicios disponibles`,
		directions: 'Cómo llegar',
	},

	/**
	 * Estado del negocio ahora mismo.
	 *
	 * Tres formas y no una: "abre mañana a las 9:00" y "abre el sábado a las
	 * 9:00" son la misma información, pero la primera se entiende sin mirar el
	 * calendario. Nombrar el día cuando falta más de uno es lo que evita el
	 * "abre en 3 días" que obliga a hacer la cuenta.
	 */
	status: {
		open: (closesAt: string) => `Abierto hasta las ${closesAt}`,
		closedToday: (time: string) => `Cerrado · abre hoy a las ${time}`,
		closedTomorrow: (time: string) => `Cerrado · abre mañana a las ${time}`,
		closedOn: (day: string, time: string) =>
			`Cerrado · abre el ${day} a las ${time}`,
		/** Sin horario cargado. No se inventa una apertura que nadie prometió. */
		unknown: 'Consultá los horarios',
	},

	gallery: {
		seeAll: 'Ver todas las imágenes',
		open: 'Ver la foto más grande',
		close: 'Cerrar',
		previous: 'Foto anterior',
		next: 'Foto siguiente',
		counter: (current: number, total: number) => `${current}/${total}`,
		photoAlt: (name: string, index: number, total: number) =>
			`Foto ${index} de ${total} de ${name}`,
	},

	services: {
		title: 'Servicios',
		empty:
			'Este negocio todavía no publicó sus servicios. Volvé a intentar más tarde.',
		book: 'Reservar',
		bookNow: 'Reservar ahora',
	},

	team: {
		title: 'Equipo',
		photoAlt: (name: string) => name,
	},

	schedule: {
		title: 'Horarios',
		closed: 'Cerrado',
		/** El día de hoy se marca para no obligar a contar las filas. */
		today: 'Hoy',
	},

	location: {
		title: 'Dónde estamos',
		directions: 'Cómo llegar',
		/**
		 * El texto alternativo del mapa.
		 *
		 * Nombra el negocio y no "mapa de la zona": a quien lo escucha en un lector
		 * de pantalla no le sirve saber que hay una imagen, y la dirección escrita
		 * —que es el dato— está justo debajo.
		 */
		mapAlt: (name: string) => `Ubicación de ${name} en el mapa`,
		credits: [
			{ label: '© Mapbox', href: 'https://www.mapbox.com/about/maps/' },
			{
				label: '© OpenStreetMap',
				href: 'https://www.openstreetmap.org/copyright',
			},
		],
		/** Sin dirección cargada no hay sección: un título vacío es peor que nada. */
	},

	/** El flujo de reserva, paso por paso. */
	flow: {
		close: 'Cerrar',
		back: 'Volver',

		service: {
			title: 'Elegí un servicio',
		},

		staff: {
			title: 'Elegí un profesional',
			any: 'Cualquier profesional',
			anyHint: 'Más horarios disponibles',
			empty:
				'Este servicio todavía no tiene un profesional asignado. Probá con otro o escribile al negocio.',
		},

		slot: {
			title: 'Elegí fecha y hora',
			loading: 'Buscando horarios…',
			/**
			 * Un día sin cupo no es un error: es información. Por eso el texto empuja
			 * a la acción que resuelve —probar otro día— en lugar de disculparse.
			 */
			empty: 'No quedan horarios este día. Probá con otra fecha.',
			noDays:
				'No hay días con atención en las próximas semanas. Escribile al negocio para coordinar.',
		},

		/**
		 * El último paso, cuando hay que identificarse.
		 *
		 * Se pide cuenta y no nombre y teléfono a mano, y el texto tiene que
		 * explicar por qué en una línea: quien llega hasta acá quiere un turno, no
		 * registrarse. Lo que se le ofrece a cambio es no volver a escribir sus
		 * datos nunca más, en este negocio ni en ningún otro de Polaria.
		 */
		identity: {
			title: 'Confirmá quién sos',
			/** Lo que se gana iniciando sesión, dicho antes de pedirlo. */
			why: 'Entrá con Google y no vuelvas a escribir tus datos: quedan guardados para la próxima, acá y en cualquier negocio de Polaria.',
			google: 'Continuar con Google',
			/** No es un requisito de Polaria: es cómo se avisa de un turno. */
			whatsappNote:
				'También podés reservar escribiéndole al negocio por WhatsApp.',
		},

		/** Pedir el teléfono, lo único que Google no da. */
		phoneStep: {
			title: 'Añadir teléfono',
			subtitle: 'Es a donde te llega la confirmación y el recordatorio.',
			label: 'Número de teléfono',
			submit: 'Continuar',
			saving: 'Guardando…',
		},

		details: {
			title: 'Tus datos',
			/** El resumen de la cuenta, ya con todo listo para confirmar. */
			bookingAs: 'Reservás como',
			name: 'Tu nombre',
			namePlaceholder: 'Cómo te anotamos',
			phone: 'WhatsApp',
			phonePlaceholder: '70123456',
			/** Se dice para qué se pide el número. Nadie lo deja "porque sí". */
			phoneHint: 'Te mandamos la confirmación y el recordatorio a este número.',
			submit: 'Confirmar reserva',
			submitting: 'Reservando…',
		},

		summary: {
			/** Lo elegido, siempre a la vista mientras se completa el resto. */
			with: (staffName: string) => `Con ${staffName}`,
			anyStaff: 'Cualquier profesional',
		},

		done: {
			title: '¡Listo, tu turno quedó reservado!',
			subtitle: (name: string) =>
				`Te esperamos en ${name}. Si no vas a poder venir, avisale al negocio así le libera el lugar a otra persona.`,
			close: 'Entendido',
		},

		errors: {
			/** El 409: el horario se ocupó mientras el cliente completaba sus datos. */
			slotTaken:
				'Ese horario se acaba de ocupar. Elegí otro y lo intentamos de nuevo.',
			generic: 'No pudimos completar la reserva. Probá de nuevo en un momento.',
			nameRequired: 'Escribí tu nombre.',
			phoneRequired: 'Escribí tu número de WhatsApp.',
		},
	},

	/**
	 * Lo único que nombra a Polaria en toda la página, y va abajo del todo.
	 *
	 * No es publicidad puesta de contrabando en el local de otro: es la firma que
	 * explica quién opera la reserva, del tamaño que le corresponde.
	 */
	footer: {
		poweredBy: 'Reservas con',
		product: 'Polaria',
	},
} as const;

/** Días de la semana, empezando por domingo para que el índice sea `getDay()`. */
export const dayNames = [
	'domingo',
	'lunes',
	'martes',
	'miércoles',
	'jueves',
	'viernes',
	'sábado',
] as const;

/** La tabla de horarios se lee de lunes a domingo, no de domingo a sábado. */
export const weekOrder = [1, 2, 3, 4, 5, 6, 0] as const;

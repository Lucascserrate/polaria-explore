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

		back: 'Volver',
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
	portfolio: {
		title: 'Portfolio',
		/** Cuántos trabajos hay, al lado del título. */
		count: (total: number) => String(total),
		open: 'Ver el trabajo más grande',
		/** En la última baldosa, cuando quedan trabajos sin mostrar. */
		more: (hidden: number) => `+${hidden}`,
		photoAlt: (name: string, index: number, total: number) =>
			`Trabajo ${index} de ${total} de ${name}`,
	},
	share: {
		imageAlt: 'La foto de portada del negocio',
	},

	services: {
		title: 'Servicios',
		allCategories: 'Todos',
		empty:
			'Este negocio todavía no publicó sus servicios. Volvé a intentar más tarde.',
		book: 'Reservar',
		bookNow: 'Reservar ahora',
		/**
		 * Lo que se lee donde iría el precio de un servicio que no lo tiene.
		 *
		 * Hay rubros que no pueden publicarlo: una coloración depende del largo y
		 * del estado del pelo. El negocio no lo esconde, lo cotiza cuando ve a la
		 * persona, y eso es lo que hay que decir: un hueco se lee como un error de
		 * la página, y un "Bs 0" como un regalo.
		 *
		 * Es la misma frase que el panel y que los mensajes de WhatsApp
		 * (`quoted-price.ts` en el backend): el mismo servicio no puede decir una
		 * cosa acá y otra en el chat.
		 */
		quotedPrice: 'Requiere diagnóstico',
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

		/**
		 * El título de la pestaña mientras se reserva.
		 *
		 * **El nombre del negocio primero**, porque una pestaña muestra cuatro
		 * palabras y la que importa es dónde está reservando: quien llega acá
		 * suele tener abiertas la barbería, el mapa y el chat donde le pasaron el
		 * enlace. "Reservar" va detrás y sólo para distinguirla de la pestaña de
		 * la página del negocio, que lleva el nombre a secas.
		 *
		 * No dice el paso. El paso cambia cuatro veces en un minuto y la pestaña
		 * no es una barra de progreso; además el título quedaría distinto en cada
		 * dirección del mismo formulario.
		 */
		metaTitle: (business: string) => `${business} · Reservar`,

		/**
		 * Los nombres de los pasos, para las migas de arriba.
		 *
		 * Sustantivos y no órdenes —"Profesional", no "Elegí un profesional"—:
		 * arriba son un mapa de dónde está la persona, y el título grande de la
		 * pantalla es el que pide algo. Las dos cosas en imperativo se leerían como
		 * dos instrucciones distintas para el mismo paso.
		 */
		steps: {
			label: 'Pasos de la reserva',
			service: 'Servicio',
			staff: 'Profesional',
			slot: 'Hora',
			confirm: 'Confirmar',
		},

		/**
		 * El título de la pantalla en cada paso. Es lo que se pide, en imperativo.
		 *
		 * Están juntos y no dentro de cada paso porque ahora los dibuja la pantalla
		 * y no cada componente: un solo lugar donde ver que los cuatro se leen como
		 * una misma voz.
		 */
		titles: {
			service: 'Elegí tus servicios',
			staff: 'Elegí un profesional',
			/**
			 * El paso de repartir. El título nombra el reparto y no repite
			 * "profesional": se llega acá desde una fila que ya dijo esa palabra.
			 */
			staffPerService: 'Elegí quién hace cada uno',
			slot: 'Elegí fecha y hora',
			confirm: 'Confirmá tu reserva',
		},

		/**
		 * La barra de abajo: lo que se lleva y el botón para seguir.
		 *
		 * Existe desde que elegir servicios dejó de ser un toque. En una lista de
		 * marcar, el botón **es** la única señal de que se puede marcar más de uno:
		 * sin él, la primera fila avanzaría sola y nadie descubriría que se puede
		 * sumar la barba al corte.
		 *
		 * Dice el total y lo que dura porque son las dos cosas que cambian al
		 * agregar algo, y las dos que alguien quiere saber antes de seguir: cuánto
		 * sale y cuánto tiempo se va a quedar.
		 */
		bar: {
			/** "1 servicio · 45 min". El precio va aparte, con su propio formato. */
			summary: (count: number, duration: string) =>
				`${count === 1 ? '1 servicio' : `${count} servicios`} · ${duration}`,
			continue: 'Continuar',
			/** Con nada marcado el botón no se puede apretar, y se dice por qué. */
			empty: 'Elegí al menos un servicio',
		},

		service: {
			title: 'Elegí tus servicios',
			/** El `aria-label` de cada fila: lo que pasa al tocarla. */
			add: (name: string) => `Agregar ${name}`,
			remove: (name: string) => `Quitar ${name}`,
			/** Desde los otros pasos, para volver a la lista. */
			edit: 'Agregar o quitar servicios',
			/**
			 * Al llegar al tope. Dice qué hacer —sacar uno— en lugar de disculparse,
			 * y no nombra el número: quien llegó acá ya sabe cuántos marcó.
			 */
			full: 'Llegaste al máximo de servicios por reserva. Sacá alguno para cambiarlo.',
		},

		staff: {
			title: 'Elegí un profesional',
			any: 'Cualquier profesional',
			anyHint: 'Más horarios disponibles',
			/**
			 * La fila que abre el paso de repartir. Sólo aparece con más de un
			 * servicio: con uno solo diría exactamente lo mismo que la lista de abajo.
			 */
			perService: 'Elegir profesional por servicio',
			perServiceHint: 'Uno distinto para cada cosa',
			empty:
				'Este servicio todavía no tiene un profesional asignado. Probá con otro o escribile al negocio.',
			/**
			 * Nadie hace todo lo elegido.
			 *
			 * No es un error ni un callejón: la reserva existe igual, repartida. Por
			 * eso el texto dice qué hacer en vez de disculparse, y la fila de repartir
			 * queda como única salida.
			 */
			noneShared:
				'Ningún profesional hace todos los servicios que elegiste. Podés repartirlos entre varios.',
		},

		/** Repartir la reserva: un profesional por servicio. */
		staffPerService: {
			title: 'Elegí quién hace cada uno',
			/** La píldora de cada tarjeta, que abre la hoja. */
			label: (service: string) => `Elegir profesional para ${service}`,
			/**
			 * Bajo el nombre del servicio, dentro de la hoja.
			 *
			 * Dice para qué es la lista sin repetir el nombre del servicio, que ya
			 * está de título dos líneas arriba.
			 */
			dialogHint: 'Elegí quién te lo hace',
			/** Un servicio que nadie del equipo hace: no hay a quién elegir. */
			empty: 'Nadie tiene asignado este servicio.',
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
		 * Entrar con Google es un atajo, no un requisito.
		 *
		 * Se ofrece **debajo** del formulario y no antes: pedir una cuenta para
		 * reservar un corte pierde clientes, y más todavía cuando el login de
		 * Google falla —pasa— y la única salida era abandonar. Lo que se gana se
		 * dice igual, porque para quien vuelve seguido es un gasto de menos.
		 */
		identity: {
			or: 'o',
			why: 'Entrá con Google y no vuelvas a escribir tus datos: quedan guardados para la próxima, acá y en cualquier negocio de Polaria.',
			google: 'Continuar con Google',
		},

		/**
		 * El aviso de que ya hay un turno sacado con este mismo negocio.
		 *
		 * **Informa, no interrumpe.** Nadie tiene por qué justificar un segundo
		 * turno —se cortan el pelo dos hermanos, se reserva para el mes que viene—,
		 * así que el texto no pregunta ni pide confirmar: dice lo que hay y deja la
		 * pantalla como estaba. Lo que evita es la reserva repetida por olvido, que
		 * es un problema de memoria y se resuelve mostrando el turno, no poniendo
		 * una puerta.
		 *
		 * Por eso tampoco hay un botón. "Ver mi turno" no tiene a dónde ir hasta
		 * que exista la pantalla de turnos de la cuenta, y el detalle —servicio,
		 * día, hora y profesional— es justamente lo que ese botón iría a mostrar:
		 * está acá, en el aviso.
		 *
		 * El título nombra al negocio porque la cuenta reserva en muchos: "ya tenés
		 * un turno" a secas, en la página de una barbería, se puede leer como un
		 * turno en cualquier otro lado.
		 */
		existing: {
			title: (business: string, count: number) =>
				count === 1
					? `Ya tenés un turno en ${business}`
					: `Ya tenés ${count} turnos en ${business}`,
			/**
			 * Se dice que puede seguir, y en pasado del hecho: es la respuesta a la
			 * pregunta que el aviso acaba de despertar —"¿entonces no puedo sacar
			 * otro?"— y contestarla ahí ahorra tener que probar.
			 */
			hint: 'Podés sacar otro turno igual, si querés.',
			/** El aviso es un complemento de la pantalla, no su encabezado. */
			label: 'Turnos que ya tenés con este negocio',
		},

		/** Pedir el teléfono, lo único que Google no da. */
		phoneStep: {
			title: 'Añadir teléfono',
			subtitle: 'Es a donde te llega la confirmación y el recordatorio.',
			label: 'Número de teléfono',
			submit: 'Continuar',
			saving: 'Guardando…',
			/** Cuando cerró el diálogo sin dar el número y quiere confirmar. */
			missing:
				'Necesitamos tu número para mandarte la confirmación y el recordatorio.',
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
			total: 'Total',
			/** Lo elegido, siempre a la vista mientras se completa el resto. */
			with: (staffName: string) => `Con ${staffName}`,
			anyStaff: 'Cualquier profesional',
			/**
			 * Cuánto dura la visita entera.
			 *
			 * Aparece recién con dos servicios: con uno, la duración ya está en su
			 * propia fila y repetirla abajo sería decir dos veces el mismo número.
			 */
			duration: 'Duración',
			/**
			 * El total cuando alguno de los servicios se cotiza.
			 *
			 * No se suma lo que sí tiene precio: un número que ignora al servicio sin
			 * importe se lee como lo que se va a pagar, y no lo es.
			 */
			quotedTotal: 'A confirmar en el local',
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

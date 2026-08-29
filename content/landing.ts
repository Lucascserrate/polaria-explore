/**
 * Copy de la landing — PROVISIONAL.
 *
 * Esta primera versión existe para poder juzgar estructura, ritmo y dirección
 * visual, no para vender. Los textos son cortos y literales a propósito: si un
 * bloque sólo se sostiene con una frase brillante, el bloque está mal.
 *
 * Cuando el copy se trabaje en serio, este archivo se parte en uno por sección
 * (`content/hero.ts`, `content/rubros.ts`, …) como manda la convención del
 * proyecto. Mientras sea borrador, tenerlo junto hace que reescribir la página
 * entera sea abrir un archivo.
 *
 * Nada de cifras de tracción inventadas. Todavía no hay clientes, y la landing
 * es el sitio que Meta revisa: un "+10.000 negocios" falso es exactamente lo
 * que hunde una solicitud.
 */

export const landing = {
	hero: {
		title: 'El asistente que atiende tu WhatsApp y agenda por vos',
		lead: 'Polaria responde cada mensaje al instante, toma la reserva y la deja en tu agenda. Tus clientes no instalan nada.',
		primary: 'Probar por WhatsApp',
		secondary: 'Ver cómo funciona',
		note: 'Se abre WhatsApp. Escribile como te escribiría un cliente.',
		shotAlt: 'Panel de Polaria mostrando las analíticas del negocio.',
	},

	/**
	 * La banda negra bajo el hero.
	 *
	 * En la referencia son cifras de tracción. Nosotros todavía no las tenemos,
	 * así que este bloque dice lo que sí es verificable hoy. Cuando haya números
	 * reales —negocios, citas agendadas— este es su lugar.
	 */
	proof: [
		{ value: '24/7', label: 'Contesta también cuando el local está cerrado' },
		{ value: 'Sin apps', label: 'Tu cliente reserva en el WhatsApp que ya usa' },
		{ value: 'Tu número', label: 'El mismo con el que te escriben hoy' },
		{ value: '15 min', label: 'Lo que tarda dejarlo configurado' },
	],

	verticals: {
		title: 'Una plataforma, cualquier negocio con agenda',
		lead: 'Si tu día se organiza en turnos, Polaria encaja.',
		items: [
			'Barberías',
			'Salones de belleza',
			'Spas',
			'Salones de uñas',
			'Clínicas',
			'Consultorios',
			'Medicina estética',
			'Dentistas',
		],
	},

	overview: {
		title: 'Todo lo que necesitas para llenar la agenda',
		lead: 'Tres cosas que pasan solas mientras vos atendés.',
		columns: [
			{
				title: 'Atiende',
				body: 'Responde precios, horarios y ubicación en segundos, a cualquier hora. Cuando hace falta una persona, te pasa la conversación.',
			},
			{
				title: 'Agenda',
				body: 'Ofrece los horarios libres de cada profesional, confirma la cita y la deja anotada. El panel se actualiza solo.',
			},
			{
				title: 'Recuerda',
				body: 'Avisa a tu cliente el día antes y una hora antes. Menos ausencias, sin que escribas un mensaje.',
			},
		],
	},

	/**
	 * Las capturas son recortes de las tomas de `scripts/capture.mjs`, encuadrados
	 * a la zona con información. El panel entero, a media columna, es sobre todo
	 * espacio en blanco: se ve "una app gris" en vez de leerse lo que hace.
	 */
	features: [
		{
			title: 'Contesta sola, pero vos seguís mandando',
			body: 'Polaria se enciende y se apaga con un interruptor. Los horarios de atención, los servicios y los recordatorios se cambian desde el panel, sin pedirle nada a nadie.',
			bullets: [
				'Un interruptor para activarla o dejarla en silencio',
				'Horarios, servicios y precios en un solo lugar',
				'Podés entrar en la conversación cuando quieras',
			],
			image: {
				src: '/product/configuracion-detalle.png',
				width: 1410,
				height: 970,
				alt: 'Configuración de Polaria: el interruptor que la activa, los horarios de atención y la cuenta de WhatsApp.',
			},
		},
		{
			title: 'Nadie se olvida de su turno',
			body: 'Los recordatorios salen solos, el día antes y una hora antes. Podés ver exactamente cómo le va a llegar el mensaje a tu cliente antes de activarlos.',
			bullets: [
				'24 horas antes y 1 hora antes',
				'Se previsualiza como lo verá tu cliente',
				'Se apagan cuando no los necesitás',
			],
			image: {
				src: '/product/recordatorios-detalle.png',
				width: 1410,
				height: 790,
				alt: 'Pantalla de recordatorios con los avisos de 24 horas y 1 hora antes.',
			},
		},
	],

	/** La conversación del teléfono del hero. Estática: acá no hay que demostrar
	 *  velocidad, hay que mostrar de qué se trata. */
	conversation: {
		contact: 'Studio Norte',
		status: 'en línea',
		messages: [
			{ from: 'client', text: 'Hola, ¿tenés turno para mañana?' },
			{ from: 'polaria', text: 'Hola 👋 Mañana me quedan estos horarios:' },
			{ from: 'polaria', slots: ['10:00', '12:30', '16:30'] },
			{ from: 'client', text: '16:30' },
			{
				from: 'polaria',
				text: 'Listo, te esperamos mañana a las 16:30. Te aviso un día antes.',
			},
		],
	},

	finalCta: {
		title: 'Probala escribiéndole',
		lead: 'Es un número real atendido por Polaria. Preguntale lo que le preguntaría un cliente tuyo.',
		primary: 'Probar por WhatsApp',
	},

	footer: {
		blurb: 'El asistente de reservas por WhatsApp para negocios que trabajan con citas.',
		producto: 'Producto',
		legal: 'Legal',
		disclaimer:
			'Polaria es un producto independiente. No está afiliado, patrocinado ni respaldado por Meta Platforms, Inc. ni por Google LLC. WhatsApp y Google Calendar son marcas de sus respectivos titulares.',
	},
} as const;

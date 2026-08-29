/**
 * Identidad del sitio.
 *
 * IMPORTANTE (revisión de Meta): los datos de contacto y la razón social deben
 * ser reales y verificables antes de enviar la solicitud de WhatsApp Business
 * API. Los valores marcados con TODO son provisionales.
 */
export const site = {
	name: 'Polaria',
	// TODO: reemplazar por el dominio definitivo antes de publicar.
	url: 'https://polaria.app',
	tagline: 'Tu WhatsApp, contestado.',
	description:
		'Polaria contesta los mensajes de tus clientes en WhatsApp y agenda las citas por vos. Pensado para peluquerías y barberías.',

	// TODO: correo real con el dominio del sitio. Meta lo verifica.
	contactEmail: 'hola@polaria.app',
	phoneNumber: '+591 76286578',

	// TODO: completar con la razón social y domicilio reales.
	legal: {
		entity: 'Polaria',
		country: 'Bolivia',
		city: 'Santa Cruz de la Sierra',
	},

	locale: 'es-BO',
	currency: 'Bs',
} as const;

/**
 * Navegación de la landing.
 *
 * Tres anclas y un botón. La referencia tiene menús desplegables porque tiene
 * cincuenta páginas; nosotros tenemos una, y un menú para tres enlaces es
 * interfaz de más.
 */
export const nav = [
	{ label: 'Para quién es', href: '#rubros' },
	{ label: 'Qué hace', href: '#producto' },
	{ label: 'Cómo empieza', href: '#empezar' },
] as const;

/** Enlaces del pie. Privacy y Terms son requisito de la revisión de Meta. */
export const footerLinks = {
	producto: [
		{ label: 'Para quién es', href: '#rubros' },
		{ label: 'Qué hace', href: '#producto' },
		{ label: 'Cómo empieza', href: '#empezar' },
	],
	legal: [
		{ label: 'Política de privacidad', href: '/privacy' },
		{ label: 'Términos del servicio', href: '/terms' },
	],
} as const;

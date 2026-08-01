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

/** Enlaces del footer. Privacy y Terms son requisito de la revisión de Meta. */
export const footerLinks = {
	producto: [
		{ label: 'Cómo funciona', href: '#como-funciona' },
		{ label: 'Integraciones', href: '#integraciones' },
		{ label: 'Preguntas frecuentes', href: '#faq' },
	],
	legal: [
		{ label: 'Política de privacidad', href: '/privacy' },
		{ label: 'Términos del servicio', href: '/terms' },
	],
} as const;

/**
 * Anclas de navegación. Centralizadas para que el nav, los CTA y el scroll
 * programático no se desincronicen si se reordena la página.
 */
export const sectionIds = {
	simulador: 'simulador',
	control: 'control',
	comoFunciona: 'como-funciona',
	beneficios: 'beneficios',
	integraciones: 'integraciones',
	accesoAnticipado: 'acceso-anticipado',
	faq: 'faq',
} as const;

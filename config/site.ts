/**
 * Identidad del sitio.
 *
 * IMPORTANTE (revisión de Meta): los datos de contacto y la razón social deben
 * ser reales y verificables antes de enviar la solicitud de WhatsApp Business
 * API. Los valores marcados con TODO son provisionales.
 */
export const site = {
	name: 'Polaria',
	url: 'https://polariahq.com',

	/**
	 * La landing, que vive en otro repositorio (`polaria-landing`) y en otro
	 * dominio. Acá se usa una sola vez —la firma al pie de la página de
	 * reserva— y por eso es una URL absoluta y no un `/`: desde este sitio,
	 * "Polaria" es un enlace hacia afuera.
	 */
	landingUrl: 'https://business.polariahq.com',

	tagline: 'Tu WhatsApp, contestado.',
	description:
		'Polaria contesta los mensajes de tus clientes en WhatsApp y agenda las citas por vos. Pensado para peluquerías y barberías.',

	// TODO: correo real con el dominio del sitio. Meta lo verifica.
	contactEmail: 'hola@polariahq.com',
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

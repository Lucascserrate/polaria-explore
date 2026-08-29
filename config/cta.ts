/**
 * El CTA de la landing: escribirle a Polaria por WhatsApp.
 *
 * Hay un número real donde cualquiera puede probar el asistente, así que el
 * botón principal no manda a un formulario ni a una demo grabada: manda a la
 * conversación. Si el número cambia, se cambia acá y en ningún otro lado.
 */
export const whatsapp = {
	// Formato internacional, sin signos ni espacios.
	number: '59176286578',
	greeting: 'Hola Polaria, quiero probarte',
} as const;

export function whatsappUrl() {
	return `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.greeting)}`;
}

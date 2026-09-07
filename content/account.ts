/**
 * El texto de la cuenta de quien reserva.
 *
 * Aparte de `content/booking.ts` porque es de otro dominio: la reserva es del
 * negocio, la cuenta es de la persona y la acompaña de un negocio a otro. Mismo
 * registro que el resto del sitio: le habla al cliente, no a un negocio.
 */
export const account = {
	bar: {
		/**
		 * Quién está en sesión. Sólo el nombre, sin "hola" ni "bienvenido".
		 *
		 * La barra existe para dos cosas: que se vea que la sesión está abierta y
		 * poder cerrarla. Un saludo la convertiría en una tarjeta de bienvenida
		 * arriba de la página de un negocio, que no es de Polaria para saludar.
		 */
		label: 'Tu cuenta',
		logout: 'Cerrar sesión',
	},
};

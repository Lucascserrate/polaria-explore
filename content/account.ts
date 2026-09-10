/**
 * El texto de la cuenta de quien reserva.
 *
 * Aparte de `content/booking.ts` porque es de otro dominio: la reserva es del
 * negocio, la cuenta es de la persona y la acompaña de un negocio a otro. Mismo
 * registro que el resto del sitio: le habla al cliente, no a un negocio.
 */
export const account = {
	/** La barra de arriba, que es la del marketplace y no la de la landing. */
	nav: {
		label: 'Tu cuenta',
		/** Para el lector de pantalla: el logo es un enlace, no un adorno. */
		home: 'Polaria, ir al inicio',
	},

	/**
	 * El único enlace del sitio que le habla al dueño de un negocio, y sale del
	 * dominio: va a `business.polariahq.com`.
	 *
	 * Está en dos lugares y no en cualquiera. En la barra **de la raíz**, donde
	 * es legítimo —quien entra por la puerta del marketplace puede ser un
	 * negocio, y ahí no hay una reserva empezada que interrumpir— y dentro del
	 * menú de la cuenta, detrás de un clic, que es como llega a las páginas de
	 * reserva. Arriba de la reserva de una barbería no va: sería publicidad de
	 * un tercero metida en el local de otro. Ver `Navbar` y `AGENTS.md`.
	 */
	forBusiness: 'Para negocios',

	/**
	 * El menú que cuelga del avatar.
	 *
	 * Corto a propósito: sólo lo que existe. La referencia que lo inspiró tiene
	 * historial, billetera, mensajes, favoritos y formularios; ninguno tiene a
	 * dónde llevar todavía, y un menú de enlaces muertos es peor que uno corto.
	 */
	menu: {
		/** Para el lector de pantalla: el avatar es el botón que abre el menú. */
		open: 'Abrir el menú de tu cuenta',
	},

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

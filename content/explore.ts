/**
 * El buscador del marketplace.
 *
 * Todo el texto visible de `/explore`, incluido el que no se ve: el título de
 * la pestaña y el encabezado que sólo leen los lectores de pantalla.
 *
 * Quien llega acá es un cliente buscando dónde reservar, no un negocio
 * buscando software. Por eso no hay nada que le hable al dueño de un local: ni
 * "publicá tu negocio", ni "probá Polaria". Polaria aparece como el lugar donde
 * están estos negocios, que es lo que es.
 */
export const explore = {
	title: 'Negocios para reservar',
	metaTitle: 'Explorar negocios',
	metaDescription:
		'Mirá los negocios que toman turnos con Polaria y reservá el tuyo.',

	/**
	 * Cuántos hay. Es el único lugar donde la pantalla dice el tamaño de la
	 * lista, y sirve para saber si el rubro que se tocó dejó algo afuera.
	 */
	count: (total: number) => (total === 1 ? '1 negocio' : `${total} negocios`),

	/**
	 * Lo mismo, pero cuando el mapa está recortando la lista.
	 *
	 * Decirlo importa: si no, quien arrastró el mapa ve bajar el número sin
	 * entender por qué y piensa que se perdieron negocios. "En esta zona" explica
	 * de dónde sale el recorte y, de paso, que alejando el mapa vuelven.
	 */
	countInArea: (total: number) =>
		total === 1 ? '1 negocio en esta zona' : `${total} negocios en esta zona`,

	/** El rubro sin elegir: la lista completa. */
	allTypes: 'Todos',

	back: 'Volver',

	map: {
		show: 'Mostrar mapa',
		hide: 'Ocultar mapa',
		/**
		 * El botón redondo que flota sobre el mapa en el teléfono.
		 *
		 * Ahí el mapa ocupa la pantalla entera y el botón es sólo un icono, así
		 * que este texto no se lee: lo anuncia el lector de pantalla. Dice a
		 * dónde lleva —la lista— y no qué esconde, porque tocarlo es volver.
		 */
		backToList: 'Ver la lista',

		pinLabel: (name: string) => `Ver ${name}`,

		closePreview: 'Cerrar',
	},
	empty: {
		filtered: 'No hay negocios de ese rubro por ahora.',
		all: 'Todavía no hay negocios para mostrar.',

		/** El mapa quedó sobre un lugar donde no hay ninguno. Se sale alejándolo. */
		area: 'No hay negocios en esta zona. Probá alejando el mapa.',
	},
} as const;

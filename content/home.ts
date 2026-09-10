/**
 * La raíz del sitio: la entrada al marketplace.
 *
 * Dejó de ser un cartel. Acá vive la barra de búsqueda —un titular, un campo y
 * los rubros que hay—, y de acá se sale a `/explore`, que es la pantalla de
 * resultados. La raíz pregunta; `/explore` contesta.
 *
 * Quien llega es el cliente de un negocio, no un negocio buscando software:
 * el copy no vende nada, no promete un tamaño que no tenemos —"los mejores
 * establecimientos del mundo" con veinte barberías cargadas es una mentira que
 * se nota en la primera pantalla de resultados— y no habla de Polaria como
 * producto. Lo único que le habla al dueño de un negocio es el botón "Para
 * negocios" de la barra, que está en `content/account.ts` y sale del dominio.
 */
export const home = {
	/*
	 * El título de la pestaña. El layout raíz le agrega " · Polaria".
	 *
	 * No dice "cerca de vos" ni "en tu ciudad": todavía no hay nada que filtre
	 * por zona, y una promesa de cercanía se cobra en la primera pantalla de
	 * resultados.
	 */
	metaTitle: 'Reservá tu turno',
	metaDescription:
		'Buscá por rubro y reservá en barberías, peluquerías, spa y más. Sin llamar y sin esperar la respuesta.',

	/**
	 * El titular.
	 *
	 * Dice qué se hace acá y no qué es esto. "El marketplace de las citas" le
	 * explica el modelo de negocio a alguien que sólo quiere cortarse el pelo.
	 */
	title: 'Reservá tu próxima cita',
	/*
	 * No dice "por WhatsApp": acá se reserva en la web, y contar por dónde le
	 * llegan los mensajes al negocio es explicarle el producto a quien sólo
	 * quiere cortarse el pelo.
	 */
	subtitle: 'Elegí un rubro y mirá los negocios que toman turnos con Polaria.',

	/**
	 * El campo de búsqueda.
	 *
	 * Todavía no busca por zona ni por fecha, y por eso no hay dos casilleros
	 * más apagados al lado: un "Ubicación actual" que no filtra nada es peor que
	 * no tenerlo. Cuando existan, entran acá.
	 */
	search: {
		/** El campo no lleva rótulo a la vista: lo dice el titular de arriba. */
		label: 'Qué estás buscando',
		placeholder: 'Todos los negocios',
		submit: 'Buscar',

		/** Lo que se despliega. Sólo lo lee un lector de pantalla. */
		optionsLabel: 'Rubros y negocios',

		groups: {
			types: 'Rubros',
			businesses: 'Negocios',
		},

		/** La primera opción de la lista: no elegir nada y ver todo. */
		all: 'Todos los negocios',

		/**
		 * Lo que se escribió no se parece a ningún rubro ni a ningún negocio.
		 *
		 * Dice qué se buscó —así se ve el error de tipeo— y deja la salida a la
		 * lista completa, que es la única respuesta honesta: acá no hay un
		 * buscador que pueda encontrar algo más que esto.
		 */
		noMatches: (query: string) => `No encontramos nada para “${query}”.`,
		noMatchesAction: 'Ver todos los negocios',
	},

	/**
	 * Los rubros, otra vez, debajo del campo.
	 *
	 * No es una repetición gratuita: son la única parte de esta pantalla que
	 * funciona sin JavaScript —el panel del campo abre con un `useState`— y son
	 * lo que hace que la página no sea un titular flotando sobre nada. Los mismos
	 * que ofrece el campo, en el mismo orden, porque salen de la misma lista.
	 */
	shortcuts: {
		label: 'Rubros',
		all: 'Ver todos',
	},
} as const;

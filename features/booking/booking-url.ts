/**
 * La dirección del flujo de reserva y los nombres de sus parámetros.
 *
 * Vive en un archivo propio, sin `'use client'`, porque lo usan los dos lados:
 * el hook del flujo para leer y escribir la URL, y los botones de la página del
 * negocio —que son componentes de servidor— para enlazar hacia acá.
 *
 * Que lo elegido viaje en la URL es lo que hace que el flujo sobreviva a un
 * viaje a Google. Ver `useBookingFlow`.
 */

/**
 * Los nombres de los parámetros, en castellano.
 *
 * Se leen en la barra de direcciones de un cliente, así que se escriben como el
 * resto de la página. Y están en un solo lugar porque dos copias de
 * `'servicios'` son un enlace roto esperando.
 */
export const BOOKING_PARAM = {
	/**
	 * Los servicios de la reserva, separados por coma y **en orden de atención**.
	 *
	 * En plural desde que una reserva puede llevar más de uno. El orden es el que
	 * el cliente ve en el resumen y el que el backend encadena, así que la lista
	 * no se reordena en ninguna capa.
	 */
	services: 'servicios',
	/**
	 * Quién atiende. Ver `ANY_STAFF`.
	 *
	 * Un solo valor vale para toda la reserva —un id, o `cualquiera`—; una lista
	 * separada por coma es uno por servicio, alineada con `servicios`, y cada
	 * posición puede ser un id o `cualquiera`.
	 */
	staff: 'profesionales',
	/**
	 * Qué lista se está completando ahora mismo: `servicios` o `profesionales`.
	 *
	 * Es el único dato del flujo que no es una elección sino un estado de la
	 * pantalla, y existe porque hay dos pasos donde elegir dejó de ser un toque.
	 * En los dos, "tengo algo marcado" y "terminé" son cosas distintas: sin esto,
	 * tocar el primer servicio saltaría al paso siguiente antes de poder agregar
	 * el segundo, y asignar el último profesional cambiaría la pantalla debajo del
	 * dedo mientras todavía se estaba revisando el primero.
	 *
	 * **No es un `?paso=`.** No dice en qué paso está la reserva —eso se sigue
	 * derivando de lo elegido— y no puede contradecir a los datos: con la lista
	 * vacía el paso es el mismo con esto o sin esto, y con algo elegido sólo
	 * significa "seguí mostrándome la lista".
	 */
	picking: 'eligiendo',
	date: 'fecha',
	slot: 'hora',
} as const;

/**
 * El filtro de categoría de la página del negocio.
 *
 * No está en `BOOKING_PARAM` porque no es del flujo de reserva: vive en la
 * página de antes y no viaja con lo elegido. Comparte el archivo porque el
 * motivo es el mismo —un nombre de parámetro escrito dos veces es un enlace
 * roto esperando— y porque lo leen la página y la lista.
 */
export const CATEGORY_PARAM = 'categoria';

/** `/royal-barber`, con una categoría preseleccionada si se pide. */
export function profileHref(slug: string, categoryId?: string): string {
	const base = `/${encodeURIComponent(slug)}`;

	return categoryId
		? `${base}?${CATEGORY_PARAM}=${encodeURIComponent(categoryId)}`
		: base;
}

/**
 * "Cualquier profesional" tiene que poder escribirse en la URL.
 *
 * `null` significa dos cosas distintas —no eligió, o eligió que le da igual— y
 * un parámetro ausente sólo puede representar una. Con este centinela el paso
 * queda resuelto y no se vuelve a preguntar.
 *
 * Vale suelto —"cualquiera para toda la reserva"— y también **en una posición**
 * de la lista, que es lo que permite repartir sin obligar a elegir a alguien
 * para cada servicio. Sin eso, la pantalla de repartir necesitaría representar
 * "todavía no elegí", y una lista a medio llenar es exactamente el estado que no
 * se puede escribir en la URL sin inventar un tercer centinela.
 *
 * El backend lo acepta con este mismo nombre. Ver `ANY_STAFF` allá.
 */
export const ANY_STAFF = 'cualquiera';

/** Los dos valores de `eligiendo`. Ver `BOOKING_PARAM.picking`. */
export const PICKING_SERVICES = 'servicios';
export const PICKING_STAFF = 'profesionales';

/**
 * `/royal-barber/reservar`, con un servicio ya marcado si se sabe cuál.
 *
 * Entrar desde un servicio concreto **abre el paso de servicios con ése
 * tildado**, y no se lo saltea: es la única forma de que alguien descubra que
 * puede sumar otro. El costo es un toque —"Continuar"— para quien sólo quería
 * ése, y es el toque que paga que la lista exista.
 */
export function bookingHref(slug: string, serviceId?: string): string {
	const base = `/${encodeURIComponent(slug)}/reservar`;
	if (!serviceId) return base;

	const query = new URLSearchParams({
		[BOOKING_PARAM.services]: serviceId,
		[BOOKING_PARAM.picking]: PICKING_SERVICES,
	});

	return `${base}?${query}`;
}

/**
 * Una lista de ids escrita en la URL (`a,b,c`).
 *
 * Vacía cuando el parámetro no está o viene con basura, que para el flujo es lo
 * mismo: nadie eligió nada.
 */
export function readIds(raw: string | null): string[] {
	if (!raw) return [];

	return raw
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
}

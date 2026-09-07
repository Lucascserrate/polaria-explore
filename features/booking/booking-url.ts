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
 * `'servicio'` son un enlace roto esperando.
 */
export const BOOKING_PARAM = {
	service: 'servicio',
	staff: 'profesional',
	date: 'fecha',
	slot: 'hora',
} as const;

/**
 * "Cualquier profesional" tiene que poder escribirse en la URL.
 *
 * `null` significa dos cosas distintas —no eligió, o eligió que le da igual— y
 * un parámetro ausente sólo puede representar una. Con este centinela el paso
 * queda resuelto y no se vuelve a preguntar.
 */
export const ANY_STAFF = 'cualquiera';

/** `/royal-barber/reservar`, con el servicio ya elegido si se sabe cuál. */
export function bookingHref(slug: string, serviceId?: string): string {
	const base = `/${encodeURIComponent(slug)}/reservar`;

	return serviceId
		? `${base}?${BOOKING_PARAM.service}=${encodeURIComponent(serviceId)}`
		: base;
}

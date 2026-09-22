/**
 * Lo que una reserva tiene elegido antes de preguntar horarios: qué servicios y,
 * si ya se decidió, con quién cada uno.
 *
 * Vive en un archivo propio —sin `'use client'`, sin `server-only`— porque lo
 * usan las cinco capas que hay entre el navegador y la API: el flujo, los
 * servicios del navegador, los pasamanos de `app/api/booking/`, los servicios
 * del servidor y las claves de React Query. Escribir `serviceIds` de cinco
 * formas distintas es una lista desalineada esperando.
 */

/**
 * Cuántos servicios entran en una misma reserva.
 *
 * Es el mismo número que valida la API (`MAX_SERVICES_PER_BOOKING`), escrito acá
 * porque son dos despliegues y el sitio no puede importar del backend. Está
 * duplicado a propósito y con este comentario: sin él, el sexto servicio se
 * marcaría, se vería en el resumen y recién moriría en un 400 al pedir horarios.
 *
 * El tope no es una regla de producto sino de lo que cuesta una consulta: cada
 * servicio suma un tramo que revisar en cada horario candidato. Cinco
 * encadenados son media jornada.
 */
export const MAX_SERVICES_PER_BOOKING = 5;

export type BookingSelection = {
	/**
	 * Los servicios, **en orden de atención**: el primero arranca en el horario
	 * elegido y los demás van uno detrás del otro.
	 *
	 * El orden no es cosmético. Es el que el cliente vio en el resumen y el que el
	 * backend usa para encadenar los tramos, así que reordenarlo en cualquier capa
	 * cambiaría a qué hora empieza cada cosa.
	 */
	serviceIds: string[];
	/**
	 * Los profesionales, **uno por servicio y en el mismo orden**.
	 *
	 * Ausente es "cualquier profesional": lo resuelve el servidor, y uno solo para
	 * toda la reserva. Presente, tiene que tener tantos ids como servicios;
	 * repetir el mismo en todas las posiciones es como se pide "esta persona para
	 * todo".
	 */
	staffIds?: string[];
};

/**
 * La selección tal como viaja en una URL: `serviceIds=a,b&staffIds=x,y`.
 *
 * Coma y no un parámetro repetido porque estas direcciones las lee gente —la del
 * flujo se comparte por chat— y `a,b` se entiende de un vistazo.
 */
export function selectionQuery(selection: BookingSelection): URLSearchParams {
	const query = new URLSearchParams({
		serviceIds: selection.serviceIds.join(','),
	});

	if (selection.staffIds?.length) {
		query.set('staffIds', selection.staffIds.join(','));
	}

	return query;
}

/**
 * La selección leída de una URL, o `null` si no hay ni un servicio.
 *
 * `null` y no una selección vacía: sin servicios no hay nada que preguntar, y
 * quien llama tiene que poder distinguir eso de "todavía no llegó la respuesta".
 */
export function readSelection(
	query: URLSearchParams,
): BookingSelection | null {
	const serviceIds = splitIds(query.get('serviceIds'));
	if (serviceIds.length === 0) return null;

	const staffIds = splitIds(query.get('staffIds'));

	return staffIds.length > 0 ? { serviceIds, staffIds } : { serviceIds };
}

export function splitIds(raw: string | null | undefined): string[] {
	if (!raw) return [];

	return raw
		.split(',')
		.map((part) => part.trim())
		.filter(Boolean);
}

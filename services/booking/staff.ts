import type { PublicBookingStaff } from './types';
import { bookingPath, getJson } from './request';
import { selectionQuery } from './selection';

/**
 * Servicio: quién puede atender los servicios elegidos.
 *
 * Trae las dos listas —quién puede con todo y quién con cada uno— porque el
 * paso de profesional ofrece las dos cosas: un profesional para la reserva
 * entera, o uno por servicio. Ver `PublicBookingStaff`.
 *
 * Que `shared` devuelva uno solo es normal —el barbero que trabaja solo— y no
 * es un caso borde: el flujo se saltea el paso cuando eso pasa.
 */
export function fetchStaff(
	slug: string,
	serviceIds: string[],
	signal?: AbortSignal,
): Promise<PublicBookingStaff> {
	const query = selectionQuery({ serviceIds });
	return getJson(`${bookingPath(slug)}/staff?${query}`, signal);
}

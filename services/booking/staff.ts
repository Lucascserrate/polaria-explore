import type { PublicStaff } from './types';
import { bookingPath, getJson } from './request';

/**
 * Servicio: los profesionales que hacen un servicio.
 *
 * Devolver uno solo es normal —el barbero que trabaja solo— y no es un caso
 * borde: el flujo se saltea el paso cuando eso pasa.
 */
export function fetchStaff(
	slug: string,
	serviceId: string,
	signal?: AbortSignal,
): Promise<PublicStaff[]> {
	const query = new URLSearchParams({ serviceId });
	return getJson(`${bookingPath(slug)}/staff?${query}`, signal);
}

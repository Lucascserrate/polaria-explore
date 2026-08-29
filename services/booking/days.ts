import { bookingPath, getJson } from './request';

/**
 * Servicio: los días en que el negocio atiende, de hoy en adelante.
 *
 * Ojo con lo que **no** dice esta lista: son los días con atención, no los días
 * con cupo. El backend mira los horarios del negocio, no la agenda, así que un
 * lunes con todo tomado sigue apareciendo. De ahí que el flujo pruebe varios
 * antes de mostrar el primero (ver `slots.ts`).
 */
export function fetchDays(
	slug: string,
	params: { serviceId: string; staffId?: string },
	signal?: AbortSignal,
): Promise<string[]> {
	const query = new URLSearchParams({ serviceId: params.serviceId });
	if (params.staffId) query.set('staffId', params.staffId);

	return getJson(`${bookingPath(slug)}/days?${query}`, signal);
}

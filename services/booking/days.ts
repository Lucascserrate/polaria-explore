import { bookingPath, getJson } from './request';
import { selectionQuery, type BookingSelection } from './selection';

/**
 * Servicio: los días en que el negocio atiende, de hoy en adelante.
 *
 * Ojo con lo que **no** dice esta lista: son los días con atención, no los días
 * con cupo. El backend mira los horarios del negocio, no la agenda, así que un
 * lunes con todo tomado sigue apareciendo. De ahí que el flujo pruebe varios
 * antes de mostrar el primero (ver `slots.ts`).
 *
 * Con varios servicios pide cobertura para **todos**: un día en el que trabaja
 * el barbero pero no la colorista no es un día en el que se pueda reservar corte
 * y color, y ofrecerlo llevaría al "no quedan horarios" que este filtro existe
 * para evitar.
 */
export function fetchDays(
	slug: string,
	selection: BookingSelection,
	signal?: AbortSignal,
): Promise<string[]> {
	return getJson(
		`${bookingPath(slug)}/days?${selectionQuery(selection)}`,
		signal,
	);
}

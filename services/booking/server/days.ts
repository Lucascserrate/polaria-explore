import 'server-only';

import { selectionQuery, type BookingSelection } from '../selection';
import { businessPath, request } from './request';

/** Servicio: los días que el negocio atiende, de hoy en adelante. */
export function getServiceableDays(
	slug: string,
	params: BookingSelection & { days?: number },
): Promise<string[]> {
	const { days, ...selection } = params;

	const query = selectionQuery(selection);
	if (days) query.set('days', String(days));

	return request<string[]>(`${businessPath(slug)}/days?${query}`);
}

import 'server-only';

import { businessPath, request } from './request';

/** Servicio: los días que el negocio atiende, de hoy en adelante. */
export function getServiceableDays(
	slug: string,
	params: { serviceId: string; staffId?: string; days?: number },
): Promise<string[]> {
	const query = new URLSearchParams({ serviceId: params.serviceId });
	if (params.staffId) query.set('staffId', params.staffId);
	if (params.days) query.set('days', String(params.days));

	return request<string[]>(`${businessPath(slug)}/days?${query}`);
}

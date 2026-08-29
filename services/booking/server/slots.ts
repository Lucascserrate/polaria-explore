import 'server-only';

import type { PublicSlot } from '../types';
import { businessPath, request } from './request';

/** Servicio: los horarios libres de un servicio en una fecha. */
export function getSlots(
	slug: string,
	params: { serviceId: string; date: string; staffId?: string },
): Promise<PublicSlot[]> {
	const query = new URLSearchParams({
		serviceId: params.serviceId,
		date: params.date,
	});
	if (params.staffId) query.set('staffId', params.staffId);

	return request<PublicSlot[]>(`${businessPath(slug)}/slots?${query}`);
}

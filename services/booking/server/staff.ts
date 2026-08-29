import 'server-only';

import type { PublicStaff } from '../types';
import { businessPath, request } from './request';

/** Servicio: los profesionales que hacen un servicio. */
export function getStaffForService(
	slug: string,
	serviceId: string,
): Promise<PublicStaff[]> {
	const query = new URLSearchParams({ serviceId });
	return request<PublicStaff[]>(`${businessPath(slug)}/staff?${query}`);
}

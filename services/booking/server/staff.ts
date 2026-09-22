import 'server-only';

import type { PublicBookingStaff } from '../types';
import { selectionQuery } from '../selection';
import { businessPath, request } from './request';

/** Servicio: quién puede atender los servicios elegidos. Ver `PublicBookingStaff`. */
export function getStaffForServices(
	slug: string,
	serviceIds: string[],
): Promise<PublicBookingStaff> {
	const query = selectionQuery({ serviceIds });
	return request<PublicBookingStaff>(`${businessPath(slug)}/staff?${query}`);
}

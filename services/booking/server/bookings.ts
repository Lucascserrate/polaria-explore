import 'server-only';

import type {
	CreateBookingInput,
	PublicBookingConfirmation,
} from '../types';
import { businessPath, request } from './request';

/** Servicio: crear la cita. La disponibilidad la revalida el backend. */
export function createBooking(
	slug: string,
	input: CreateBookingInput,
): Promise<PublicBookingConfirmation> {
	return request<PublicBookingConfirmation>(`${businessPath(slug)}/bookings`, {
		method: 'POST',
		body: JSON.stringify(input),
	});
}

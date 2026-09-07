import 'server-only';

import type {
	CreateBookingInput,
	PublicBookingConfirmation,
} from '../types';
import { businessPath, request } from './request';

/**
 * Servicio: crear la cita. La disponibilidad la revalida el backend.
 *
 * `cookie` lleva la sesión de quien reserva, cuando la hay. Con sesión, el
 * nombre y el teléfono los toma la API de la cuenta e ignora lo que vaya en el
 * cuerpo: así una reserva hecha desde una cuenta no puede quedar a nombre de
 * otra persona.
 */
export function createBooking(
	slug: string,
	input: CreateBookingInput,
	cookie?: string,
): Promise<PublicBookingConfirmation> {
	return request<PublicBookingConfirmation>(`${businessPath(slug)}/bookings`, {
		method: 'POST',
		body: JSON.stringify(input),
		cookie,
	});
}

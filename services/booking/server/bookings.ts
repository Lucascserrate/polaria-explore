import 'server-only';

import type {
	CreateBookingInput,
	PublicBookingConfirmation,
} from '../types';
import { businessPath, requestWithCookies } from './request';

/**
 * Servicio: crear la cita. La disponibilidad la revalida el backend.
 *
 * `cookie` lleva la sesión de quien reserva, cuando la hay. Con sesión, el
 * nombre y el teléfono los toma la API de la cuenta e ignora lo que vaya en el
 * cuerpo: así una reserva hecha desde una cuenta no puede quedar a nombre de
 * otra persona.
 *
 * Devuelve también las cookies que puso la API, y **hay que reenviarlas al
 * navegador**: sin sesión, ahí viene la prueba de que este navegador creó el
 * turno, que es lo único que después permite pasárselo a la cuenta. Ver
 * `requestWithCookies`.
 */
export function createBooking(
	slug: string,
	input: CreateBookingInput,
	cookie?: string,
): Promise<{ data: PublicBookingConfirmation; setCookie: string[] }> {
	return requestWithCookies<PublicBookingConfirmation>(
		`${businessPath(slug)}/bookings`,
		{
			method: 'POST',
			body: JSON.stringify(input),
			cookie,
		},
	);
}

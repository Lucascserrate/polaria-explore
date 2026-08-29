import type {
	CreateBookingInput,
	PublicBookingConfirmation,
} from './types';
import { bookingPath, postJson } from './request';

/**
 * Servicio: crear la reserva.
 *
 * Es la única escritura de toda la página pública. Puede fallar con 409 —el
 * horario se ocupó entre que se mostró la lista y el cliente tocó "Confirmar"—
 * y eso no es un error del formulario sino la carrera normal de una agenda
 * compartida: `BookingRequestError.isSlotTaken` lo distingue para que la
 * pantalla ofrezca otro horario en lugar de un mensaje de error.
 */
export function createBooking(
	slug: string,
	input: CreateBookingInput,
): Promise<PublicBookingConfirmation> {
	return postJson(`${bookingPath(slug)}/bookings`, input);
}

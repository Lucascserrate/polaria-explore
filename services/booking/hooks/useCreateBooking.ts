'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateBookingInput } from '../types';
import { createBooking } from '../bookings';
import { bookingKeys } from '../keys';

/**
 * Confirmar la reserva.
 *
 * Pase lo que pase, después de intentar reservar las listas de horarios que
 * tenemos en memoria quedan viejas: si salió bien, porque el turno que acabamos
 * de tomar ya no está libre; si falló con 409, porque lo tomó otro. Por eso la
 * invalidación va en `onSettled` y no en `onSuccess`.
 *
 * Sin reintentos. Reintentar un POST que crea una cita es arriesgarse a crear
 * dos: la petición pudo haber llegado igual y ser la respuesta la que se
 * perdió. Un error acá se le muestra al cliente y decide él.
 */
export function useCreateBooking(slug: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateBookingInput) => createBooking(slug, input),
		retry: false,
		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: bookingKeys.slots(slug) });
		},
	});
}

import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { BookingApiError, request } from '@/services/booking/server/request';
import type {
	CustomerAppointment,
	CustomerAppointmentDetail,
} from '../types';
import { CUSTOMER_COOKIE } from './session';

/**
 * Los turnos vigentes que la cuenta ya tiene, resueltos **en el servidor**
 * durante el render.
 *
 * Existe para que la pantalla de reserva pueda avisar "ya tenés un turno acá"
 * antes de que la persona empiece a sacar otro. Se pide acá y no desde el
 * navegador por lo mismo que la sesión: el HTML tiene que llegar con el aviso
 * puesto, porque un cartel que aparece después de que ya se eligió un servicio
 * llega tarde para lo único que sirve.
 *
 * **Sin cookie no sale la petición.** Es lo que deja intacto el camino de quien
 * reserva sin cuenta: no se le pide nada, no se le agrega una espera, y la
 * pantalla es exactamente la de antes. Detectar el turno de un visitante
 * anónimo es otro problema —habría que identificarlo por teléfono, que es un
 * identificador y no una credencial— y no se resuelve acá.
 *
 * Devuelve `[]` si la API no contesta, igual que la sesión devuelve `null`: esto
 * es contexto que mejora la pantalla, no un dato del que dependa reservar, así
 * que un error de red tiene que costar el aviso y nada más.
 */
export const getCustomerAppointments = cache(
	async (businessSlug?: string): Promise<CustomerAppointment[]> => {
		try {
			return await ask<CustomerAppointment[]>('', businessSlug);
		} catch {
			return [];
		}
	},
);

/**
 * Las dos listas del historial: lo que viene y lo que ya no.
 *
 * **Acá los errores no se tragan**, y es la diferencia con el aviso de arriba.
 * En la pantalla de reserva, una API caída cuesta un cartel; en el historial
 * costaría decirle a alguien "no tenés turnos" cuando sí los tiene, que es la
 * única frase que esta pantalla no puede equivocar. Que reviente y se vea la
 * pantalla de error es preferible a una lista vacía que miente.
 *
 * Se piden las dos a la vez porque son dos consultas independientes y la
 * pantalla no puede dibujarse hasta tener las dos: en serie, la de abajo
 * empezaría recién cuando termina la de arriba.
 */
export const getAccountAppointments = cache(
	async (): Promise<{
		upcoming: CustomerAppointment[];
		past: CustomerAppointment[];
	}> => {
		const [upcoming, past] = await Promise.all([
			ask<CustomerAppointment[]>(''),
			ask<CustomerAppointment[]>('/past'),
		]);

		return { upcoming, past };
	},
);

/**
 * Un turno de la cuenta, con el desglose.
 *
 * El 404 de la API es también el de esta página, y no una pantalla de error: la
 * API contesta 404 tanto para un turno que no existe como para uno que es de
 * otra cuenta —no los distingue a propósito—, así que acá los dos casos son lo
 * mismo que escribir mal una dirección.
 */
export const getAccountAppointment = cache(
	async (id: string): Promise<CustomerAppointmentDetail> => {
		try {
			return await ask<CustomerAppointmentDetail>(
				`/${encodeURIComponent(id)}`,
			);
		} catch (error) {
			if (error instanceof BookingApiError && error.status === 404) notFound();
			throw error;
		}
	},
);

/**
 * La petición a `/customer/me/appointments`, con la cookie de sesión.
 *
 * **Sin cookie no sale la petición**, y eso es lo que deja intacto el camino de
 * quien reserva sin cuenta: no se le pide nada y no se le agrega una espera. Un
 * 401 acá sería lo mismo con más latencia.
 */
async function ask<T>(path: string, businessSlug?: string): Promise<T> {
	const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
	if (!token) throw new BookingApiError(401, 'Sin sesión de cliente.');

	const query = businessSlug
		? `?business=${encodeURIComponent(businessSlug)}`
		: '';

	return request<T>(`/customer/me/appointments${path}${query}`, {
		cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}`,
	});
}

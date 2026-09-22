import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { request } from '@/services/booking/server/request';
import type { CustomerAppointment } from '../types';
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
		const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
		if (!token) return [];

		const query = businessSlug
			? `?business=${encodeURIComponent(businessSlug)}`
			: '';

		try {
			return await request<CustomerAppointment[]>(
				`/customer/me/appointments${query}`,
				{ cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}` },
			);
		} catch {
			return [];
		}
	},
);

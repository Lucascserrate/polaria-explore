import 'server-only';

import { BUSINESS_PROFILE_REVALIDATE_SECONDS } from '@/config/api';
import type { PublicBusinessProfile } from '../types';
import { BookingApiError, businessPath, request } from './request';

/**
 * Servicio: el perfil del negocio.
 *
 * Es lo único que se pide en el servidor durante el render, así que no pasa por
 * React Query: cuando el HTML llega al navegador, el dato ya está en la página.
 *
 * Devuelve `null` cuando el slug no existe, para que la página responda un 404
 * de verdad en lugar de una pantalla de error: la URL la escribe gente a mano.
 */
export async function getBusinessProfile(
	slug: string,
): Promise<PublicBusinessProfile | null> {
	try {
		return await request<PublicBusinessProfile>(businessPath(slug), {
			revalidate: BUSINESS_PROFILE_REVALIDATE_SECONDS,
		});
	} catch (error) {
		if (error instanceof BookingApiError && error.status === 404) return null;
		throw error;
	}
}

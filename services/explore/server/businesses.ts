import 'server-only';

import { request } from '@/services/booking/server/request';
import type { PublicBusinessDirectory, PublicBusinessSummary } from '../types';

/**
 * Cuánto vive el listado.
 *
 * Cinco minutos, como el equipo y los días de atención de la reserva: lo que
 * cambia acá es qué negocios existen y qué foto tienen, y ninguna de las dos
 * cosas engaña a nadie con cinco minutos de atraso. El dato que no se cachea
 * nunca —el horario libre— no aparece en esta página.
 */
export const DIRECTORY_REVALIDATE_SECONDS = 60 * 5;

/**
 * Servicio: los negocios publicados.
 *
 * Se pide en el servidor durante el render y no pasa por React Query, igual que
 * el perfil del negocio: cuando el HTML llega, las tarjetas ya están en la
 * página. El día que el buscador filtre por zona sin recargar, ahí sí va a
 * hacer falta un hook.
 *
 * **No atrapa el error.** Si la API está caída, la página falla y se ve una
 * pantalla de error; devolver una lista vacía convertiría una caída en "no hay
 * ningún negocio", que es mentira y además se ve idéntico a la verdad.
 */
export async function listBusinesses(): Promise<PublicBusinessSummary[]> {
	const directory = await request<PublicBusinessDirectory>(
		'/public/businesses',
		{ revalidate: DIRECTORY_REVALIDATE_SECONDS },
	);

	return directory.businesses;
}

'use client';

import { skipToken, useQuery } from '@tanstack/react-query';
import { bookingKeys } from '../keys';
import { fetchStaff } from '../staff';

/**
 * Quiénes hacen el servicio elegido.
 *
 * Con `serviceId` en `null` la consulta queda apagada: el paso puede estar
 * montado antes de que haya un servicio elegido.
 *
 * Cinco minutos de frescura. El equipo de un negocio no cambia mientras alguien
 * reserva, y volver atrás para cambiar de servicio y regresar no debería costar
 * una espera.
 */
const STALE_TIME = 5 * 60 * 1000;

export function useStaff(slug: string, serviceId: string | null) {
	return useQuery({
		queryKey: bookingKeys.staff(slug, serviceId),
		queryFn: serviceId
			? ({ signal }) => fetchStaff(slug, serviceId, signal)
			: skipToken,
		staleTime: STALE_TIME,
	});
}

'use client';

import { skipToken, useQuery } from '@tanstack/react-query';
import { bookingKeys } from '../keys';
import { fetchStaff } from '../staff';

/**
 * Quiénes pueden atender lo elegido: los que pueden con todo y los de cada
 * servicio.
 *
 * Una sola consulta para los dos pasos de profesional —el de "uno para toda la
 * reserva" y el de elegirlo servicio por servicio— porque son la misma pregunta
 * con dos recortes, y la pantalla ofrece las dos cosas a la vez. Pedirlas por
 * separado dejaría que una llegue y la otra no. Ver `PublicBookingStaff`.
 *
 * Sin servicios la consulta queda apagada: el paso puede estar montado antes de
 * que haya alguno elegido.
 *
 * Cinco minutos de frescura. El equipo de un negocio no cambia mientras alguien
 * reserva, y volver atrás para agregar un servicio y regresar no debería costar
 * una espera.
 */
const STALE_TIME = 5 * 60 * 1000;

export function useStaff(slug: string, serviceIds: string[] | null) {
	const chosen = serviceIds && serviceIds.length > 0 ? serviceIds : null;

	return useQuery({
		queryKey: bookingKeys.staff(slug, chosen),
		queryFn: chosen
			? ({ signal }) => fetchStaff(slug, chosen, signal)
			: skipToken,
		staleTime: STALE_TIME,
	});
}

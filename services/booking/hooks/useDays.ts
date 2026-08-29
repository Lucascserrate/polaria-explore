'use client';

import { skipToken, useQuery } from '@tanstack/react-query';
import { fetchDays } from '../days';
import { bookingKeys } from '../keys';

/**
 * Los días en que el negocio atiende.
 *
 * Cinco minutos de frescura, igual que el equipo y por el mismo motivo: esto
 * sale de los horarios del negocio, no de la agenda. Lo que sí cambia mientras
 * alguien mira la pantalla son los horarios de cada día, y ésos no se cachean
 * (ver `useSlots`).
 */
const STALE_TIME = 5 * 60 * 1000;

export type DaysParams = { serviceId: string; staffId?: string };

export function useDays(slug: string, params: DaysParams | null) {
	return useQuery({
		queryKey: bookingKeys.days(slug, params),
		queryFn: params ? ({ signal }) => fetchDays(slug, params, signal) : skipToken,
		staleTime: STALE_TIME,
	});
}

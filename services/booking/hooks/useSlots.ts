'use client';

import { skipToken, useQuery } from '@tanstack/react-query';
import { bookingKeys } from '../keys';
import { fetchFirstDayWithSlots, type SlotsParams } from '../slots';

/**
 * Los horarios a mostrar: el primer día con cupo de los candidatos, y su lista.
 *
 * **Este es el único dato de la página que no se cachea, y es a propósito.**
 * `staleTime: 0` y `gcTime: 0` significan que nunca se muestra una lista
 * guardada: en cuanto el paso se desmonta, la entrada se tira. Un negocio
 * abierto o un precio pueden llegar con un minuto de atraso sin que nadie se
 * perjudique; un turno que ya se ocupó, no —el cliente completa el formulario y
 * pierde el turno al confirmar.
 *
 * Un solo reintento: si la primera falla, la segunda contesta o se muestra el
 * error. Encadenar tres con espera exponencial deja a alguien mirando un
 * esqueleto sin saber que ya hubo un problema.
 */
export type SlotsQueryParams = SlotsParams & { candidates: readonly string[] };

export function useSlots(slug: string, params: SlotsQueryParams | null) {
	return useQuery({
		queryKey: bookingKeys.slots(slug, params),
		queryFn: params
			? ({ signal }) => fetchFirstDayWithSlots(slug, params, signal)
			: skipToken,
		staleTime: 0,
		gcTime: 0,
		retry: 1,
	});
}

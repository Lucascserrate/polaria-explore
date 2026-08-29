import type { SlotsParams } from './slots';

/**
 * Las claves de React Query, todas en un archivo.
 *
 * Una clave es la identidad de un dato en la caché: dos consultas con la misma
 * clave son el mismo dato, y dos con claves distintas no se pisan nunca. Eso es
 * lo que reemplaza al `AbortController` que antes había que llevar a mano —si
 * alguien toca tres días seguidos del selector, cada día tiene su entrada y la
 * respuesta de uno no puede escribir sobre la del otro.
 *
 * Aceptan `null` porque los pasos del flujo se montan antes de tener con qué
 * consultar: la consulta queda apagada, pero la clave tiene que existir igual.
 *
 * Están juntas para poder invalidar por prefijo: `bookingKeys.slots(slug)`
 * alcanza todas las listas de horarios de ese negocio.
 */

export const bookingKeys = {
	business: (slug: string) => ['booking', slug] as const,

	staff: (slug: string, serviceId: string | null) =>
		[...bookingKeys.business(slug), 'staff', serviceId] as const,

	days: (slug: string, params: { serviceId: string; staffId?: string } | null) =>
		[
			...bookingKeys.business(slug),
			'days',
			params?.serviceId ?? null,
			params?.staffId ?? 'any',
		] as const,

	/**
	 * Los horarios de una tanda de días candidatos.
	 *
	 * La lista de candidatos entra en la clave y no sólo el día que termina
	 * mostrándose: preguntar "el primero con cupo entre lunes, martes y
	 * miércoles" es una pregunta distinta de "los horarios del lunes", aunque
	 * las dos contesten el lunes.
	 *
	 * Sin argumentos devuelve el prefijo, que es lo que se invalida cuando una
	 * reserva se crea y todas las listas de ese negocio quedan viejas.
	 */
	slots: (
		slug: string,
		params?: (SlotsParams & { candidates: readonly string[] }) | null,
	) =>
		params
			? ([
					...bookingKeys.business(slug),
					'slots',
					params.serviceId,
					params.staffId ?? 'any',
					params.candidates,
				] as const)
			: ([...bookingKeys.business(slug), 'slots'] as const),
};

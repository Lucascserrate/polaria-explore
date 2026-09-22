import type { PublicSlot } from './types';
import { bookingPath, getJson } from './request';
import { selectionQuery, type BookingSelection } from './selection';

export type SlotsParams = BookingSelection;

/**
 * Servicio: los horarios libres de un día.
 *
 * Con varios servicios el horario es el del **bloque entero** —la suma de las
 * duraciones, encadenadas— y no el de cada uno: lo que se elige es a qué hora
 * empieza la visita.
 */
export function fetchSlots(
	slug: string,
	params: SlotsParams & { date: string },
	signal?: AbortSignal,
): Promise<PublicSlot[]> {
	const { date, ...selection } = params;

	const query = selectionQuery(selection);
	query.set('date', date);

	return getJson(`${bookingPath(slug)}/slots?${query}`, signal);
}

/**
 * Servicio: el primer día de la lista que tenga horarios, con sus horarios.
 *
 * Son varias peticiones detrás de una sola respuesta, y por eso vive acá y no
 * en el hook: quien llama pregunta una cosa —"¿cuándo puede venir?"— y el
 * número de viajes al servidor es un detalle del transporte.
 *
 * **Por qué hace falta.** `fetchDays` devuelve los días con atención, no los
 * días con cupo. Sin esto, abrir la reserva en una barbería llena empieza con
 * un "no quedan horarios" aunque haya turnos el martes, que es la peor primera
 * pantalla posible.
 *
 * Con un solo candidato —el cliente tocó un día concreto— hace exactamente una
 * petición y contesta ese día, esté vacío o no. Decirle que el día que eligió
 * está completo es la respuesta correcta, no un problema que haya que esquivar.
 */
export async function fetchFirstDayWithSlots(
	slug: string,
	params: SlotsParams & { candidates: readonly string[] },
	signal?: AbortSignal,
): Promise<{ date: string | null; slots: PublicSlot[] }> {
	const { candidates, ...rest } = params;
	if (candidates.length === 0) return { date: null, slots: [] };

	for (const date of candidates) {
		const slots = await fetchSlots(slug, { ...rest, date }, signal);
		if (slots.length > 0) return { date, slots };
	}

	// Ninguno tenía cupo: se muestra el primero vacío, que es el que el cliente
	// esperaba ver.
	return { date: candidates[0], slots: [] };
}

import 'server-only';

import type { PublicSlot } from '../types';
import { selectionQuery, type BookingSelection } from '../selection';
import { businessPath, request } from './request';

/** Servicio: los horarios libres de una reserva en una fecha. */
export function getSlots(
	slug: string,
	params: BookingSelection & { date: string },
): Promise<PublicSlot[]> {
	const { date, ...selection } = params;

	const query = selectionQuery(selection);
	query.set('date', date);

	return request<PublicSlot[]>(`${businessPath(slug)}/slots?${query}`);
}

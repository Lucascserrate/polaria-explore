import { request, toErrorResponse } from '@/services/booking/server/request';
import {
	CUSTOMER_COOKIE,
	readCustomerCookie,
} from '@/services/customer/server/session';
import type { CustomerAppointmentDetail } from '@/services/customer/types';

/**
 * Mueve el turno a otro horario.
 *
 * Devuelve los errores de la API con su texto, que es lo que la pantalla
 * muestra: el que importa es el del horario que se ocupó entre que se listó y
 * se confirmó, y está escrito para el cliente final.
 */
export async function POST(
	httpRequest: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const token = readCustomerCookie(httpRequest.headers.get('cookie'));
	if (!token) {
		return Response.json({ message: 'Iniciá sesión primero.' }, { status: 401 });
	}

	const { id } = await params;
	const body = (await httpRequest.json().catch(() => null)) as {
		startTime?: unknown;
	} | null;

	const startTime =
		typeof body?.startTime === 'string' ? body.startTime.trim() : '';

	if (!startTime) {
		return Response.json({ message: 'Falta el horario.' }, { status: 400 });
	}

	try {
		return Response.json(
			await request<CustomerAppointmentDetail>(
				`/customer/me/appointments/${encodeURIComponent(id)}/reschedule`,
				{
					method: 'POST',
					body: JSON.stringify({ startTime }),
					cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}`,
				},
			),
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}

import { request, toErrorResponse } from '@/services/booking/server/request';
import {
	CUSTOMER_COOKIE,
	readCustomerCookie,
} from '@/services/customer/server/session';
import type { PublicSlot } from '@/services/booking/types';

/**
 * Los horarios de un día para mover este turno.
 *
 * El único parámetro es la fecha. Todo lo demás —los servicios, el profesional
 * y la exclusión del propio turno— lo resuelve la API a partir del id de la URL.
 */
export async function GET(
	httpRequest: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const token = readCustomerCookie(httpRequest.headers.get('cookie'));
	if (!token) {
		return Response.json({ message: 'Iniciá sesión primero.' }, { status: 401 });
	}

	const { id } = await params;
	const date = new URL(httpRequest.url).searchParams.get('date') ?? '';

	if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
		return Response.json({ message: 'Falta el día.' }, { status: 400 });
	}

	try {
		return Response.json(
			await request<PublicSlot[]>(
				`/customer/me/appointments/${encodeURIComponent(id)}/slots?date=${date}`,
				{ cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}` },
			),
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}

import { request, toErrorResponse } from '@/services/booking/server/request';
import {
	CUSTOMER_COOKIE,
	readCustomerCookie,
} from '@/services/customer/server/session';

/**
 * Los días a los que se puede mover este turno.
 *
 * Pasamanos: reenvía la cookie de sesión y devuelve lo que contesta la API.
 * **No lleva parámetros** y eso es lo que lo hace seguro: qué servicios se
 * buscan, con quién y qué cita no cuenta como ocupada salen del turno que
 * nombra la URL, no de lo que mande el navegador.
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

	try {
		return Response.json(
			await request<string[]>(
				`/customer/me/appointments/${encodeURIComponent(id)}/days`,
				{ cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}` },
			),
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}

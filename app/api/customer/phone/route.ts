import { request, toErrorResponse } from '@/services/booking/server/request';
import {
	CUSTOMER_COOKIE,
	readCustomerCookie,
} from '@/services/customer/server/session';
import type { CustomerSession } from '@/services/customer/types';

/**
 * Guarda el teléfono en la cuenta de quien está reservando.
 *
 * Es el único dato que Google no da y por eso se pide una vez, después de
 * iniciar sesión. Pasamanos como los de `app/api/booking/`: reenvía la cookie
 * de sesión y devuelve lo que contesta la API, incluido su mensaje de error
 * —"ese número no parece válido"—, que está escrito para el cliente final.
 *
 * La validación de verdad es del backend, que normaliza el número al mismo
 * formato con el que WhatsApp guarda a esa persona. Acá no se toca: si este
 * pasamanos "arreglara" el número, habría dos reglas distintas para el mismo
 * dato y el cliente terminaría duplicado en el negocio.
 */
export async function PATCH(httpRequest: Request) {
	const token = readCustomerCookie(httpRequest.headers.get('cookie'));
	if (!token) {
		return Response.json({ message: 'Iniciá sesión primero.' }, { status: 401 });
	}

	const body = (await httpRequest.json().catch(() => null)) as {
		phone?: unknown;
		timezone?: unknown;
	} | null;

	const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
	const timezone = typeof body?.timezone === 'string' ? body.timezone : '';

	if (!phone || !timezone) {
		return Response.json({ message: 'Falta el número.' }, { status: 400 });
	}

	try {
		return Response.json(
			await request<CustomerSession>('/customer/me/phone', {
				method: 'PATCH',
				body: JSON.stringify({ phone, timezone }),
				cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}`,
			}),
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}

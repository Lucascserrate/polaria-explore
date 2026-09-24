import { request, toErrorResponse } from '@/services/booking/server/request';
import {
	CUSTOMER_COOKIE,
	readCustomerCookie,
} from '@/services/customer/server/session';
import type { CustomerAppointmentDetail } from '@/services/customer/types';

/**
 * Cancela un turno de la cuenta.
 *
 * Pasamanos como los de `app/api/booking/`: reenvía la cookie de sesión y
 * devuelve lo que contesta la API, **incluidos sus errores con su texto**. Los
 * dos que importan están escritos para el cliente final y dicen cosas
 * distintas: un 404 es un turno que no existe o que no es suyo, y un 409 es uno
 * que ya empezó. La pantalla los muestra tal cual en lugar de traducirlos, que
 * es como terminan existiendo dos redacciones del mismo problema.
 *
 * **Acá no se decide nada.** Si esto comprobara por su cuenta que el turno
 * todavía no empezó, habría dos relojes —el del navegador que pidió y el del
 * servidor que escribe— y el que manda es el de la base. La única regla vive en
 * `cancelByCustomerAccount`.
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

	try {
		return Response.json(
			await request<CustomerAppointmentDetail>(
				`/customer/me/appointments/${encodeURIComponent(id)}/cancel`,
				{
					method: 'POST',
					cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}`,
				},
			),
		);
	} catch (error) {
		return toErrorResponse(error);
	}
}

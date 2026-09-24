import { redirect } from 'next/navigation';
import { request } from '@/services/booking/server/request';
import {
	CUSTOMER_COOKIE,
	readCustomerCookie,
} from '@/services/customer/server/session';

/**
 * La puerta del enlace que manda WhatsApp: adopta los turnos y lleva al primero.
 *
 * Existe porque un turno sacado por WhatsApp nace sin cuenta, así que el
 * historial se lo daría por inexistente justo a quien vino a verlo. El token
 * del enlace no abre nada por su cuenta: lo único que puede hacer es que, una
 * vez iniciada la sesión, esos turnos pasen a la cuenta de quien entró. Ver
 * `signForLink`.
 *
 * **Es un route handler y no una página**, y por eso no dibuja nada: lo que
 * hace es redirigir, y una pantalla intermedia que dice "un momento" mientras
 * decide a dónde ir es una pantalla de más en el camino de alguien que ya sabe
 * qué quiere ver.
 *
 * Sin sesión manda a iniciarla y vuelve **acá**, con el token intacto, para
 * terminar el trabajo a la vuelta. El token viaja en la URL de ida y de vuelta
 * porque es lo único que puede atravesar un login de Google; una vez adoptado
 * el turno, deja de servir para nada.
 */
export async function GET(httpRequest: Request) {
	const token = new URL(httpRequest.url).searchParams.get('t') ?? '';

	// Sin token no hay nada que adoptar: queda el historial, que pide sesión.
	if (!token) redirect('/historial');

	const session = readCustomerCookie(httpRequest.headers.get('cookie'));
	if (!session) {
		const back = `/historial/abrir?t=${encodeURIComponent(token)}`;
		redirect(`/api/customer/login?returnTo=${encodeURIComponent(back)}`);
	}

	let ids: string[] = [];
	try {
		const claimed = await request<{ appointmentIds: string[] }>(
			'/customer/me/appointments/claim',
			{
				method: 'POST',
				body: JSON.stringify({ token }),
				cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(session)}`,
			},
		);
		ids = claimed.appointmentIds;
	} catch {
		/*
		 * Un token vencido o de un turno que mientras tanto tomó otra cuenta no
		 * es un error que valga una pantalla: la persona igual quiere ver sus
		 * turnos, y el historial le va a mostrar los que sí son suyos.
		 */
	}

	redirect(ids[0] ? `/historial/${ids[0]}` : '/historial');
}

import { POLARIA_API_URL } from '@/config/api';
import { request as apiRequest } from '@/services/booking/server/request';
import { customerCookieHeader } from '@/services/customer/server/session';
import type { CustomerAppointmentDetail } from '@/services/customer/types';

/**
 * Cierra la sesión de quien reserva.
 *
 * Es un `POST` y llega desde un `<form>`, no desde un `fetch`: así el botón
 * funciona sin una línea de JavaScript, que es la regla de este sitio. Un `GET`
 * habría sido más fácil todavía y está mal —un enlace que cierra sesión lo
 * puede disparar cualquier cosa que precargue direcciones, incluido el propio
 * navegador—.
 *
 * Lo que hace es reenviar la cookie a la API y **copiar sus `Set-Cookie`** de
 * vuelta al navegador. Ese reenvío es el punto: la cookie la emitió la API con
 * su dominio, y sólo ella sabe con qué dominio borrarla. Si este pasamanos
 * intentara borrarla por su cuenta, en producción —donde la cookie es de
 * `.polariahq.com`— quedaría viva y la sesión no se cerraría.
 */
export async function POST(request: Request) {
	const cookie = customerCookieHeader(request.headers.get('cookie'));

	/*
	 * El destino se resuelve **antes** de cerrar la sesión: desde el historial
	 * hay que preguntarle a la API de qué negocio es el turno, y después del
	 * logout esa pregunta ya no tiene quién la conteste.
	 */
	const location = await destination(request, cookie);

	const response = await fetch(`${POLARIA_API_URL}/customer/auth/logout`, {
		method: 'POST',
		headers: cookie ? { Cookie: cookie } : undefined,
		cache: 'no-store',
	}).catch(() => null);

	const headers = new Headers({ Location: location });

	/*
	 * `getSetCookie` devuelve las cookies una por una. Con `get('set-cookie')`
	 * llegarían pegadas en un solo texto y el navegador descartaría todas menos
	 * la primera.
	 */
	for (const value of response?.headers.getSetCookie() ?? []) {
		headers.append('Set-Cookie', value);
	}

	/*
	 * 303 y no 302: obliga al navegador a pedir el destino con `GET`. Con un 302,
	 * algunos navegadores repiten el `POST` en la página de destino.
	 */
	return new Response(null, { status: 303, headers });
}

/**
 * A dónde volver después de cerrar sesión.
 *
 * **En general, a la página desde la que se cerró**: quien estaba mirando una
 * barbería sigue en la barbería, ahora sin cuenta.
 *
 * **El historial es la excepción**, porque sin sesión no es una página: es la
 * lista de turnos de alguien que ya no está. Volver ahí sería aterrizar en una
 * pantalla que no tiene nada para mostrar. Desde un turno abierto
 * —`/historial/<id>` y lo que cuelga, como `…/cambiar`— se vuelve al negocio de
 * ese turno, que es lo más parecido a "donde estaba"; desde la lista, o si el
 * turno no se puede leer, a la raíz.
 */
async function destination(
	request: Request,
	cookie: string | undefined,
): Promise<string> {
	const back = sameOriginReferer(request);
	if (!back) return '/';

	const history = back.pathname.match(/^\/historial(?:\/([^/]+))?(?:\/|$)/);
	if (!history) return back.toString();

	const id = history[1];
	if (!id || !cookie) return '/';

	const slug = await appointmentBusinessSlug(id, cookie);
	return slug ? `/${encodeURIComponent(slug)}` : '/';
}

/**
 * De qué negocio es un turno de la cuenta, o `null` si no se puede saber.
 *
 * Nunca rompe: cerrar sesión tiene que funcionar aunque la API no conteste, y
 * lo peor que puede pasar acá es volver a la raíz en vez de al negocio.
 */
async function appointmentBusinessSlug(
	id: string,
	cookie: string,
): Promise<string | null> {
	try {
		const appointment = await apiRequest<CustomerAppointmentDetail>(
			`/customer/me/appointments/${encodeURIComponent(id)}`,
			{ cookie },
		);
		return appointment.business.slug ?? null;
	} catch {
		return null;
	}
}

/**
 * El `Referer`, **sólo si es de este sitio**. Un destino que venga de afuera
 * es un redirect abierto, y da igual que lo dispare un formulario propio: el
 * resultado es el mismo enlace que parece nuestro y termina en otra parte.
 */
function sameOriginReferer(request: Request): URL | null {
	const origin = new URL(request.url).origin;
	const referer = request.headers.get('referer');

	if (!referer) return null;

	try {
		const url = new URL(referer);
		return url.origin === origin ? url : null;
	} catch {
		return null;
	}
}

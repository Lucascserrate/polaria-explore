import { POLARIA_API_URL } from '@/config/api';
import { customerCookieHeader } from '@/services/customer/server/session';

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

	const response = await fetch(`${POLARIA_API_URL}/customer/auth/logout`, {
		method: 'POST',
		headers: cookie ? { Cookie: cookie } : undefined,
		cache: 'no-store',
	}).catch(() => null);

	const headers = new Headers({ Location: safeReturnTo(request) });

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
 * A dónde volver: la página desde la que se cerró sesión.
 *
 * Se usa el `Referer` **sólo si es de este sitio**; si no, la raíz. Un destino
 * que venga de afuera es un redirect abierto, y da igual que lo dispare un
 * formulario propio: el resultado es el mismo enlace que parece nuestro y
 * termina en otra parte.
 */
function safeReturnTo(request: Request): string {
	const origin = new URL(request.url).origin;
	const referer = request.headers.get('referer');

	if (!referer) return '/';

	try {
		return new URL(referer).origin === origin ? referer : '/';
	} catch {
		return '/';
	}
}

import { POLARIA_API_URL } from '@/config/api';

/**
 * Manda a iniciar sesión con Google.
 *
 * Existe para que el botón del sitio no tenga que conocer la dirección de la
 * API. La regla del repositorio es que el navegador nunca habla con la API, y
 * un `<a href="https://api.polariahq.com/...">` la escribiría en el HTML; con
 * este salto, el enlace es del propio sitio y el dominio de la API sigue
 * viviendo en una variable de un solo despliegue.
 *
 * A dónde volver se puede decir de dos formas y las dos terminan en el mismo
 * lugar:
 *
 * - Con `returnTo`, que es lo que hace el atajo del flujo de reserva: ahí la
 *   dirección incluye los parámetros del paso —servicio, profesional, horario—
 *   y al volver la reserva sigue donde estaba.
 * - Sin nada, que es lo que hace el botón "Acceder" de la barra. Entonces se
 *   usa el `Referer`, igual que el pasamanos de cerrar sesión. Es lo que
 *   permite que ese botón sea un enlace estático y que la barra siga siendo un
 *   componente de servidor: sin esto habría que leer `window.location` en el
 *   navegador, y entrar a la cuenta dependería de que el JavaScript corra.
 *
 * **Los dos destinos se validan contra el origen de esta petición**, y es la
 * primera de dos defensas contra el redirect abierto —la otra la hace la API,
 * que valida el destino contra su propio dominio—: sin esto, un enlace que dice
 * "iniciá sesión en Polaria" podría terminar en un sitio ajeno después de un
 * login legítimo, que es exactamente como se ve un engaño creíble. Que el
 * `Referer` lo ponga el navegador y no un parámetro no lo hace confiable: lo
 * elige quien armó la página de la que se viene.
 */
export function GET(request: Request) {
	const url = new URL(request.url);
	const asked = url.searchParams.get('returnTo');

	const returnTo = asked
		? new URL(relative(asked), url.origin)
		: sameOrigin(request.headers.get('referer'), url.origin);

	const target = new URL(`${POLARIA_API_URL}/customer/auth/google`);
	target.searchParams.set('returnTo', returnTo.toString());

	return Response.redirect(target.toString(), 302);
}

/**
 * Deja pasar sólo una ruta de este sitio.
 *
 * `//otro-dominio` lo lee el navegador como una dirección absoluta, así que no
 * alcanza con exigir que empiece con `/`.
 */
function relative(raw: string): string {
	return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
}

/** El `Referer` si es de este sitio; la raíz en cualquier otro caso. */
function sameOrigin(referer: string | null, origin: string): URL {
	const root = new URL('/', origin);
	if (!referer) return root;

	try {
		const url = new URL(referer);
		return url.origin === origin ? url : root;
	} catch {
		return root;
	}
}

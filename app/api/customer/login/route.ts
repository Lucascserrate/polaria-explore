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
 * El `returnTo` se acepta **solo relativo** y se convierte en absoluto con el
 * origen de esta petición. Es la primera de dos defensas contra el redirect
 * abierto —la otra la hace la API, que valida el destino contra su propio
 * dominio—: sin esto, un enlace que dice "iniciá sesión en Polaria" podría
 * terminar en un sitio ajeno después de un login legítimo, que es exactamente
 * como se ve un engaño creíble.
 */
export function GET(request: Request) {
	const url = new URL(request.url);
	const raw = url.searchParams.get('returnTo') ?? '/';

	// `//otro-dominio` lo lee el navegador como una dirección absoluta, así que
	// no alcanza con exigir que empiece con `/`.
	const relative = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';
	const returnTo = new URL(relative, url.origin).toString();

	const target = new URL(`${POLARIA_API_URL}/customer/auth/google`);
	target.searchParams.set('returnTo', returnTo);

	return Response.redirect(target.toString(), 302);
}

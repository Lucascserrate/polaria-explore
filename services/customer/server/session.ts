import 'server-only';

import { cookies } from 'next/headers';
import { request } from '@/services/booking/server/request';
import type { CustomerSession } from '../types';

/**
 * La cookie que emite la API al volver de Google. Su nombre lo fija el backend
 * (`CUSTOMER_COOKIE`); acá solo se lee.
 */
export const CUSTOMER_COOKIE = 'customerToken';

/**
 * Quién está en sesión, resuelto **en el servidor** durante el render.
 *
 * Se pide acá y no desde el navegador por lo mismo que el perfil del negocio:
 * cuando el HTML llega, la página ya sabe si mostrar el botón de Google o el
 * resumen de la reserva. Pedirlo después dejaría un parpadeo justo en el paso
 * donde el cliente está por confirmar, que es el peor lugar para uno.
 *
 * Devuelve `null` sin sesión, y también si la API no contesta: en las dos
 * situaciones lo correcto es ofrecer iniciar sesión. Un error de red acá no
 * puede volverse una pantalla de error, porque el resto de la página —los
 * servicios, los horarios— no depende de esto.
 */
export async function getCustomerSession(): Promise<CustomerSession | null> {
	const token = (await cookies()).get(CUSTOMER_COOKIE)?.value;
	if (!token) return null;

	try {
		return await request<CustomerSession | null>('/customer/me', {
			cookie: `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}`,
		});
	} catch {
		return null;
	}
}

/**
 * Saca del encabezado `Cookie` solo la de sesión de cliente.
 *
 * Se reenvía esa y no el encabezado completo a propósito: en el mismo dominio
 * pueden convivir otras cookies —las del panel, por ejemplo— y mandárselas
 * todas a la API le daría, en la petición de un cliente, credenciales que no
 * son suyas.
 *
 * Vive acá porque la usan los dos pasamanos que hablan por un cliente: el que
 * guarda el teléfono y el que crea la reserva.
 */
export function readCustomerCookie(header: string | null): string | null {
	if (!header) return null;

	for (const part of header.split(';')) {
		const [name, ...value] = part.trim().split('=');
		if (name === CUSTOMER_COOKIE) return decodeURIComponent(value.join('='));
	}

	return null;
}

/** El encabezado listo para reenviar, o `undefined` si no hay sesión. */
export function customerCookieHeader(
	header: string | null,
): string | undefined {
	const token = readCustomerCookie(header);
	return token
		? `${CUSTOMER_COOKIE}=${encodeURIComponent(token)}`
		: undefined;
}

/**
 * El transporte de los servicios del navegador.
 *
 * Todo lo que sale del navegador va a la propia landing —`/api/booking/...`—
 * y nunca a la API de Polaria: del otro lado de estas URLs están los route
 * handlers, que reenvían desde el servidor. Por eso acá no hay ninguna URL
 * configurable ni ninguna clave.
 *
 * Los servicios de este directorio no hacen nada más que armar la URL y llamar
 * a estas dos funciones. Si aparece lógica de reservas en `services/booking/`,
 * está en el lugar equivocado: eso es del backend.
 */

export class BookingRequestError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
		this.name = 'BookingRequestError';
	}

	/** El horario se ocupó mientras el cliente completaba el formulario. */
	get isSlotTaken(): boolean {
		return this.status === 409;
	}
}

/** Raíz de los route handlers para un negocio. */
export const bookingPath = (slug: string) =>
	`/api/booking/${encodeURIComponent(slug)}`;

/**
 * GET con `AbortSignal`.
 *
 * El signal lo provee React Query: cuando cambia la clave de una consulta
 * —alguien toca tres días seguidos del selector antes de decidirse— la petición
 * anterior se cancela sola.
 */
export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
	const response = await fetch(url, { signal });
	if (!response.ok) throw await toError(response);
	return (await response.json()) as T;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	if (!response.ok) throw await toError(response);
	return (await response.json()) as T;
}

async function toError(response: Response): Promise<BookingRequestError> {
	const body = (await response.json().catch(() => null)) as {
		message?: string;
	} | null;

	return new BookingRequestError(
		response.status,
		body?.message ?? 'No pudimos completar la operación.',
	);
}

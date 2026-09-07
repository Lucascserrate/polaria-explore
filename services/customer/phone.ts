import type { CustomerSession } from './types';

/**
 * Guarda el teléfono de la cuenta. Transporte del navegador hacia
 * `app/api/customer/phone`.
 *
 * Como el resto de `services/`, el navegador no habla con la API de Polaria: le
 * habla a este sitio, que reenvía. Devuelve la sesión ya actualizada para que la
 * pantalla siga sin volver a preguntar.
 */
export async function saveCustomerPhone(input: {
	phone: string;
	/** Zona del negocio: es de donde sale el prefijo si el número viene local. */
	timezone: string;
}): Promise<CustomerSession> {
	const response = await fetch('/api/customer/phone', {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(input),
	});

	if (!response.ok) {
		// El mensaje viene de la API y está escrito para el cliente final
		// —"ese número no parece válido"—, así que se muestra tal cual.
		throw new Error(await readMessage(response));
	}

	return (await response.json()) as CustomerSession;
}

async function readMessage(response: Response): Promise<string> {
	try {
		const body = (await response.json()) as { message?: unknown };
		if (typeof body.message === 'string') return body.message;
	} catch {
		// Cuerpo vacío o no-JSON: cae al genérico.
	}

	return 'No pudimos guardar el número. Probá de nuevo.';
}

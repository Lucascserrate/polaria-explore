import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { account } from '@/content/account';
import { HistoryScreen } from '@/features/account/screen/HistoryScreen';
import {
	getAccountAppointment,
	getAccountAppointments,
} from '@/services/customer/server/appointments';
import { getCustomerSession } from '@/services/customer/server/session';

export const metadata: Metadata = {
	title: account.history.title,
	/* Los turnos de una persona no son algo que deba indexar un buscador. */
	robots: { index: false, follow: false },
};

/**
 * El historial de la cuenta: todos los turnos, de todos los negocios.
 *
 * Cuelga de la raíz y no de `/[businessSlug]` porque lo que lista son los turnos
 * de **una persona**: la misma cuenta reserva en cualquier negocio de Polaria, y
 * una dirección que empiece en un negocio diría que los turnos son de ese local.
 *
 * **Pide sesión.** Es lo que separa esta pantalla del resto del sitio, que se
 * puede usar entero sin cuenta: acá no hay forma honesta de saber de quién son
 * los turnos sin una credencial, y un teléfono es un identificador y no una
 * credencial. Quien llega sin sesión va a iniciarla y vuelve exactamente acá.
 */
export default async function HistoryPage() {
	const session = await getCustomerSession();
	if (!session) {
		redirect(`/api/customer/login?returnTo=${encodeURIComponent('/historial')}`);
	}

	const { upcoming, past } = await getAccountAppointments();

	/*
	 * En escritorio el panel de la derecha abre con el primer turno, que es el
	 * que alguien viene a ver; en el teléfono ese panel está escondido y este
	 * pedido no se usa. Se paga igual porque el ancho de la pantalla lo sabe el
	 * navegador y no el servidor, y es un turno, no una lista.
	 */
	const first = upcoming[0] ?? past[0];
	const selected = first ? await getAccountAppointment(first.id) : null;

	return (
		<HistoryScreen
			upcoming={upcoming}
			past={past}
			selected={selected}
			focus="list"
		/>
	);
}

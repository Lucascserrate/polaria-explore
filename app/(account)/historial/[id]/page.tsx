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
	robots: { index: false, follow: false },
};

/**
 * Un turno abierto.
 *
 * Es la misma pantalla que `/historial` con el otro lado adelante: en el
 * teléfono se ve el turno y la lista queda atrás, y en escritorio se ven los dos
 * con este marcado en la lista. Ver `HistoryScreen`.
 *
 * **Es una dirección de verdad y no un paso del flujo**, y ahí está lo que
 * resuelve: el comprobante de una reserva dejó de ser algo que se pierde al
 * recargar. Es también la dirección a la que va a llevar el enlace que se mande
 * por WhatsApp, y el destino natural del historial.
 *
 * Un id que no existe —o que es de otra cuenta— es un 404, no una pantalla de
 * error: la API no distingue los dos casos a propósito, así que acá los dos son
 * lo mismo que escribir mal una dirección. Ver `getAccountAppointment`.
 */
export default async function AppointmentPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const session = await getCustomerSession();
	if (!session) {
		redirect(
			`/api/customer/login?returnTo=${encodeURIComponent(`/historial/${id}`)}`,
		);
	}

	/*
	 * El turno y las dos listas a la vez: en escritorio la lista se dibuja al
	 * lado, y pedirla después de tener el turno agregaría un viaje a una pantalla
	 * que ya tiene todo lo que necesita.
	 */
	const [selected, { upcoming, past }] = await Promise.all([
		getAccountAppointment(id),
		getAccountAppointments(),
	]);

	return (
		<HistoryScreen
			upcoming={upcoming}
			past={past}
			selected={selected}
			focus="detail"
		/>
	);
}

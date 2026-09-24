import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { account } from '@/content/account';
import { RescheduleScreen } from '@/features/account/screen/RescheduleScreen';
import { getAccountAppointment } from '@/services/customer/server/appointments';
import { getCustomerSession } from '@/services/customer/server/session';

export const metadata: Metadata = {
	title: account.appointment.reschedule.title,
	robots: { index: false, follow: false },
};

/**
 * Cambiar el horario de un turno.
 *
 * Ruta propia y no un estado de la pantalla del turno: elegir día y hora es una
 * tarea con su propio ir y venir, y con dirección propia el botón de atrás del
 * teléfono hace lo que se espera —volver al turno— sin programar nada.
 *
 * Un turno que ya no se puede mover no llega hasta acá desde la pantalla
 * anterior, pero sí escribiendo la dirección: el rechazo lo da la API en el
 * primer pedido, y lo que se ve es que no hay días ni horarios. La regla vive
 * allá, no en esta ruta. Ver `movable`.
 */
export default async function ReschedulePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const session = await getCustomerSession();
	if (!session) {
		redirect(
			`/api/customer/login?returnTo=${encodeURIComponent(`/historial/${id}/cambiar`)}`,
		);
	}

	const appointment = await getAccountAppointment(id);

	return <RescheduleScreen appointment={appointment} />;
}

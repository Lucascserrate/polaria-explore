import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatTime } from '@/features/booking/format';
import { formatDay } from '../format';
import { StatusChip } from './StatusChip';
import type { CustomerAppointment } from '@/services/customer/types';

/**
 * Un turno en la lista del historial.
 *
 * **Es un enlace, no un botón.** Abrir un turno cambia de página: tiene que
 * andar sin JavaScript, poder abrirse en otra pestaña y dejar el botón de atrás
 * funcionando. En escritorio el mismo enlace cambia el panel de la derecha
 * porque las dos pantallas son la misma ruta con dos formas.
 *
 * **Sin foto, y es a propósito.** La foto del local ya está en el turno abierto,
 * que es donde sirve como confirmación; en la lista es la misma imagen repetida
 * turno tras turno —casi siempre del mismo negocio— y cada tarjeta ocupaba el
 * triple de lo que dice. Lo que se recorre acá es el día y la hora.
 */
export function AppointmentCard({
	appointment,
	selected = false,
}: {
	appointment: CustomerAppointment;
	/** En escritorio, el que se está mirando a la derecha. */
	selected?: boolean;
}) {
	const { business } = appointment;

	return (
		<Link
			href={`/historial/${appointment.id}`}
			aria-current={selected ? 'true' : undefined}
			className={cn(
				'block rounded-2xl bg-white ring-1 ring-paper-300',
				'outline-offset-2 transition-shadow hover:shadow-md',
				/*
				 * Marcado sólo desde `lg`: es "éste es el que estás viendo al lado", y
				 * en el teléfono no hay nada al lado. Ahí el recuadro se leería como
				 * que ese turno está elegido, que no significa nada en una lista.
				 */
				selected && 'lg:ring-2 lg:ring-ink-950',
			)}
		>
			<div className="min-w-0 space-y-1.5 px-4 py-3">
				<p className="truncate font-semibold">{business.name}</p>

				{/*
				 * El día y la hora en una línea, con la misma tipografía tabular que el
				 * resto del sitio: una lista de turnos se recorre por la hora, y las
				 * cifras de ancho variable la hacen zigzaguear.
				 */}
				<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-600">
					<span className="first-letter:uppercase">
						{formatDay(appointment.startTime, business.timezone).label}
					</span>
					<span aria-hidden="true">·</span>
					<span className="tabular-nums">
						{formatTime(appointment.startTime, business.timezone)}
					</span>
				</p>

				<p className="truncate text-sm text-ink-500">
					{appointment.serviceName}
				</p>

				<StatusChip status={appointment.status} />
			</div>
		</Link>
	);
}

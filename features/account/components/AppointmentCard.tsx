import Image from 'next/image';
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
 * La foto es lo que hace reconocible al local antes de leer el nombre, en una
 * lista que mezcla negocios; **reconocerlo no pide verlo grande.** En el
 * teléfono va arriba como una franja baja, y en escritorio, donde la lista es
 * una columna angosta al lado del turno, pasa a la izquierda como miniatura. Con
 * la foto a lo ancho y en 16:7, cada tarjeta medía media pantalla y la lista
 * mostraba dos turnos por vez. El negocio que no subió
 * fotos no deja un hueco gris —la tarjeta se dibuja sin la franja—, porque una
 * imagen rota se lee como un error de la página y no como un local sin fotos.
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
				'flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-paper-300 lg:flex-row',
				'outline-offset-2 transition-shadow hover:shadow-md',
				/*
				 * Marcado sólo desde `lg`: es "éste es el que estás viendo al lado", y
				 * en el teléfono no hay nada al lado. Ahí el recuadro se leería como
				 * que ese turno está elegido, que no significa nada en una lista.
				 */
				selected && 'lg:ring-2 lg:ring-ink-950',
			)}
		>
			{business.photoUrl && (
				/*
				 * En la fila de escritorio la altura la pone el texto: `aspect-auto`
				 * deja que la miniatura se estire a lo que mida la tarjeta.
				 */
				<div className="relative aspect-[4/1] shrink-0 bg-paper-200 lg:aspect-auto lg:w-28">
					<Image
						src={business.photoUrl}
						alt=""
						fill
						sizes="(min-width: 1024px) 7rem, 100vw"
						className="object-cover"
					/>
				</div>
			)}

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

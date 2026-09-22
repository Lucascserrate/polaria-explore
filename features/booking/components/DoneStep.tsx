'use client';

import { booking } from '@/content/booking';
import { Button } from '@/components/ui/button';
import { formatDuration, formatLongDate, formatTime } from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import type { PublicBusinessProfile } from '@/services/booking/types';

/**
 * El turno ya está hecho: lo que queda es el comprobante.
 *
 * Repite los servicios, el día y la hora en lugar de un "listo" a secas: es lo
 * que alguien mira para saber si tiene que anotarlo, y lo que busca en la
 * pantalla antes de cerrarla.
 *
 * **Con varios servicios cada uno lleva su hora de inicio**, y no sólo la del
 * bloque. Es el dato que cambia la tarde de alguien: el corte a las 16:30 y la
 * barba a las 17:30 se leen distinto de "un turno a las 16:30 que dura dos
 * horas", sobre todo cuando los atiende gente distinta.
 */
export function DoneStep({
	profile,
	state,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
}) {
	const { confirmation } = state;
	if (!confirmation) return null;

	const several = confirmation.services.length > 1;

	return (
		<div className="space-y-6 text-center">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold">{booking.flow.done.title}</h1>
				<p className="text-ink-600">
					{booking.flow.done.subtitle(profile.name)}
				</p>
			</div>

			<div className="space-y-4 rounded-2xl bg-paper-200 px-5 py-5 text-left">
				{/*
				 * El día va una sola vez y arriba de todo: los servicios de una reserva
				 * son del mismo día por construcción —van encadenados—, así que
				 * repetirlo en cada uno sería escribir tres veces la misma fecha.
				 */}
				<p className="font-medium text-ink-700 first-letter:uppercase">
					{formatLongDate(confirmation.startTime, profile.timezone)}
				</p>

				<div className="space-y-3">
					{confirmation.services.map((service) => (
						<div key={service.serviceId} className="flex items-start gap-3">
							<span className="w-14 shrink-0 font-medium tabular-nums">
								{formatTime(service.startTime, profile.timezone)}
							</span>
							<span className="min-w-0">
								<span className="block font-medium">{service.name}</span>
								{service.staffName && (
									<span className="block text-sm text-ink-500">
										{booking.flow.summary.with(service.staffName)}
									</span>
								)}
							</span>
						</div>
					))}
				</div>

				{/*
				 * Cuánto dura todo, sólo cuando son varios: con uno, la hora de inicio y
				 * el nombre del servicio ya lo dicen.
				 */}
				{several && (
					<p className="border-t border-paper-300 pt-3 text-sm text-ink-600">
						{booking.flow.summary.duration}:{' '}
						<span className="tabular-nums">
							{formatDuration(confirmation.durationMinutes)}
						</span>
					</p>
				)}
			</div>

			{/*
			 * Terminar es volver a la página del negocio, no cerrar una ventana: el
			 * flujo es una pantalla con dirección propia, así que dejar al cliente
			 * acá con el turno hecho sería dejarlo en una calle sin salida.
			 */}
			<Button
				size="lg"
				className="w-full"
				href={`/${encodeURIComponent(profile.slug)}`}
			>
				{booking.flow.done.close}
			</Button>
		</div>
	);
}

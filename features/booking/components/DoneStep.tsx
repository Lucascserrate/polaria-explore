'use client';

import { booking } from '@/content/booking';
import { Button } from '@/components/ui/button';
import { formatLongDate, formatTime } from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import type { PublicBusinessProfile } from '@/services/booking/types';

/**
 * El turno ya está hecho: lo que queda es el comprobante.
 *
 * Repite el servicio, el día y la hora en lugar de un "listo" a secas: es lo
 * que alguien mira para saber si tiene que anotarlo, y lo que busca en la
 * pantalla antes de cerrarla.
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

	return (
		<div className="space-y-6 text-center">
			<div className="space-y-2">
				<h1 className="text-3xl font-semibold">{booking.flow.done.title}</h1>
				<p className="text-ink-600">
					{booking.flow.done.subtitle(profile.name)}
				</p>
			</div>

			<div className="space-y-1 rounded-2xl bg-paper-200 px-5 py-5 text-left">
				<p className="font-medium">{confirmation.serviceName}</p>
				<p className="text-ink-700 first-letter:uppercase">
					{formatLongDate(confirmation.startTime, profile.timezone)} ·{' '}
					<span className="tabular-nums">
						{formatTime(confirmation.startTime, profile.timezone)}
					</span>
				</p>
				{confirmation.staffName && (
					<p className="text-sm text-ink-500">
						{booking.flow.summary.with(confirmation.staffName)}
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

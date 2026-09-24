'use client';

import { booking } from '@/content/booking';
import { Button } from '@/components/ui/button';
import { formatDuration, formatLongDate, formatTime } from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import type { PublicBusinessProfile } from '@/services/booking/types';

/**
 * El turno ya está hecho, y quien lo hizo no tiene cuenta.
 *
 * **Con cuenta esta pantalla casi no se ve**: el flujo navega al turno en el
 * historial, que es una dirección de verdad —se guarda, se vuelve a abrir y
 * desde ahí se gestiona—, y acá sólo queda un cartel mientras esa página carga.
 * Ver `useBookingFlow`.
 *
 * Sin cuenta no hay a dónde llevar a nadie: ese turno todavía no es de ninguna
 * cuenta y el historial lo daría por inexistente. Entonces esto sigue siendo lo
 * que era —el comprobante— y agrega el ofrecimiento de iniciar sesión, que es lo
 * que convierte un turno suelto en uno que se puede gestionar. Al volver de
 * Google el turno se vincula solo; ver `BookingClaimService`.
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
	const { confirmation, session } = state;
	if (!confirmation) return null;

	/*
	 * Con sesión esto dura lo que tarde la navegación. Se dibuja algo y no una
	 * pantalla en blanco: un instante vacío después de tocar "Confirmar" se lee
	 * como que algo falló, justo en el momento en que hay que tranquilizar.
	 */
	if (session) {
		return (
			<p className="py-12 text-center text-ink-600">
				{booking.flow.done.opening}
			</p>
		);
	}

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

			{confirmation.note && (
				<div className="space-y-2 rounded-2xl bg-paper-200 px-5 py-5 text-left">
					<p className="font-medium">{booking.flow.done.note}</p>
					<p className="whitespace-pre-line text-sm text-ink-700">
						{confirmation.note}
					</p>
				</div>
			)}

			{/*
			 * El ofrecimiento va arriba de la salida y con el botón lleno: es lo que
			 * esta pantalla propone. `returnTo` apunta al turno, así que iniciar
			 * sesión termina justo donde se lo va a poder gestionar, y no de vuelta
			 * en una página de reserva que ya no hace falta.
			 */}
			<div className="space-y-3 rounded-2xl px-5 py-5 text-left ring-1 ring-paper-300 ring-inset">
				<p className="font-medium">{booking.flow.done.signIn.title}</p>
				<p className="text-sm text-ink-600">{booking.flow.done.signIn.body}</p>

				<Button
					size="lg"
					className="w-full"
					href={`/api/customer/login?returnTo=${encodeURIComponent(
						`/historial/${confirmation.id}`,
					)}`}
				>
					{booking.flow.done.signIn.cta}
				</Button>
			</div>

			{/*
			 * Terminar es volver a la página del negocio, no cerrar una ventana: el
			 * flujo es una pantalla con dirección propia, así que dejar al cliente
			 * acá con el turno hecho sería dejarlo en una calle sin salida.
			 */}
			<Button
				variant="secondary"
				size="lg"
				className="w-full"
				href={`/${encodeURIComponent(profile.slug)}`}
			>
				{booking.flow.done.close}
			</Button>
		</div>
	);
}

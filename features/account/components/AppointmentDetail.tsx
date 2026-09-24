import Image from 'next/image';
import Link from 'next/link';
import { CalendarSync, Navigation, Store } from 'lucide-react';
import { account } from '@/content/account';
import {
	formatDuration,
	formatPrice,
	formatServicePrice,
	formatTime,
} from '@/features/booking/format';
import { directionsUrl } from '@/features/booking/location';
import { formatWhen } from '../format';
import { ActionItemContent, actionItemClasses } from './ActionItem';
import { CancelAppointment } from './CancelAppointment';
import { StatusChip } from './StatusChip';
import type { CustomerAppointmentDetail } from '@/services/customer/types';

export function AppointmentDetail({
	appointment,
}: {
	appointment: CustomerAppointmentDetail;
}) {
	const { business } = appointment;
	const directions = directionsUrl({
		location: appointment.location,
		address: appointment.address,
		name: business.name,
	});

	const several = appointment.services.length > 1;

	/*
	 * Cancelar existe sólo mientras el turno ocupa agenda y todavía no empezó, la
	 * misma frontera que aplica el backend. No alcanza con esconder el botón —la
	 * regla vive en `cancelByCustomerAccount`—, pero mostrarlo para algo que la
	 * API va a rechazar es ofrecer una salida que no existe.
	 */
	const cancellable =
		(appointment.status === 'pending' || appointment.status === 'confirmed') &&
		new Date(appointment.startTime) > new Date();

	return (
		<article className="space-y-8">
			<header className="space-y-4">
				{business.photoUrl && (
					<div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-paper-200">
						<Image
							src={business.photoUrl}
							alt=""
							fill
							sizes="(min-width: 1024px) 34rem, 100vw"
							className="object-cover"
						/>
					</div>
				)}

				<div className="space-y-3">
					<StatusChip status={appointment.status} />

					<h1 className="text-2xl font-semibold first-letter:uppercase sm:text-3xl">
						{formatWhen(appointment.startTime, business.timezone)}
					</h1>

					<p className="text-ink-600">
						{business.name} ·{' '}
						{account.appointment.duration(
							formatDuration(appointment.durationMinutes),
						)}
					</p>
				</div>
			</header>

			<nav aria-label={account.appointment.actions.label}>
				<ul>
					{directions && (
						<li>
							<a
								href={directions}
								target="_blank"
								rel="noreferrer"
								className={actionItemClasses}
							>
								<ActionItemContent icon={Navigation}>
									{account.appointment.actions.directions}
								</ActionItemContent>
							</a>
						</li>
					)}

					{business.slug && (
						<li>
							<Link
								href={`/${encodeURIComponent(business.slug)}`}
								className={actionItemClasses}
							>
								<ActionItemContent icon={Store}>
									{account.appointment.actions.place}
								</ActionItemContent>
							</Link>
						</li>
					)}

					{cancellable && (
						<>
							<li>
								<Link
									href={`/historial/${appointment.id}/cambiar`}
									className={actionItemClasses}
								>
									<ActionItemContent icon={CalendarSync}>
										{account.appointment.reschedule.action}
									</ActionItemContent>
								</Link>
							</li>

							<li>
								<CancelAppointment appointmentId={appointment.id} />
							</li>
						</>
					)}
				</ul>
			</nav>

			<section aria-labelledby="resumen" className="space-y-3">
				<h2 id="resumen" className="text-xl font-semibold">
					{account.appointment.summary}
				</h2>

				<div className="space-y-4 rounded-2xl bg-paper-200 px-5 py-5">
					{appointment.services.map((service, index) => (
						<div
							key={`${service.name}-${service.startTime}-${index}`}
							className="flex items-start justify-between gap-4"
						>
							<div className="min-w-0">
								<p className="font-medium">{service.name}</p>

								<p className="text-sm text-ink-500">
									{/*
									 * Con varios servicios cada uno lleva su hora de inicio, y no
									 * sólo la del bloque. Es el dato que cambia la tarde de
									 * alguien: el corte a las 16:30 y la barba a las 17:30 se leen
									 * distinto de "un turno de dos horas a las 16:30", sobre todo
									 * cuando los atiende gente distinta.
									 */}
									{several && (
										<span className="tabular-nums">
											{formatTime(service.startTime, business.timezone)} ·{' '}
										</span>
									)}
									{formatDuration(service.durationMinutes)}
									{service.staffName &&
										` · ${account.appointment.with(service.staffName)}`}
								</p>
							</div>

							<p className="shrink-0 text-right text-ink-700 tabular-nums">
								{formatServicePrice(service.price, appointment.currency)}
							</p>
						</div>
					))}

					<div className="flex items-center justify-between gap-4 border-t border-paper-300 pt-4">
						<p className="font-medium">{account.appointment.total}</p>
						<p
							className={
								appointment.total === null
									? 'text-right text-ink-600'
									: 'text-right font-semibold tabular-nums'
							}
						>
							{appointment.total === null
								? account.appointment.quotedTotal
								: formatPrice(appointment.total, appointment.currency)}
						</p>
					</div>
				</div>
			</section>

			{appointment.note && (
				<section aria-labelledby="nota" className="space-y-3">
					<h2 id="nota" className="text-xl font-semibold">
						{account.appointment.note}
					</h2>

					<p className="rounded-2xl bg-paper-200 px-5 py-5 whitespace-pre-line text-ink-700">
						{appointment.note}
					</p>
				</section>
			)}

			{(appointment.address || directions) && (
				<section aria-labelledby="ubicacion" className="space-y-3">
					<h2 id="ubicacion" className="text-xl font-semibold">
						{account.appointment.location.title}
					</h2>

					<div className="space-y-3 rounded-2xl px-5 py-5 ring-1 ring-paper-300 ring-inset">
						{appointment.address && (
							<p className="text-ink-700">{appointment.address}</p>
						)}

						{directions && (
							<a
								href={directions}
								target="_blank"
								rel="noreferrer"
								className="inline-flex font-medium text-accent-600 underline-offset-4 hover:underline"
							>
								{account.appointment.location.directions}
							</a>
						)}
					</div>
				</section>
			)}
		</article>
	);
}

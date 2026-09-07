'use client';

import Link from 'next/link';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import { BOOKING_PARAM, bookingHref } from '../booking-url';
import type { BookingStep } from '../useBookingFlow';

/**
 * Las migas del flujo: servicio → profesional → hora → confirmar.
 *
 * Son enlaces de verdad, no un adorno de progreso, y eso lo permite tener el
 * estado en la URL: volver al paso del profesional es quitar de la dirección lo
 * que se eligió después. Sin eso habría que reconstruir a mano qué significa
 * "volver dos pasos".
 *
 * Sólo se puede ir hacia atrás. Los pasos que faltan se ven pero no se tocan:
 * saltar a "hora" sin servicio no lleva a ninguna parte, porque el paso se
 * deriva de lo elegido y volvería solo al primero.
 */

type NamedStep = Exclude<BookingStep, 'done'>;

const ORDER: NamedStep[] = ['service', 'staff', 'slot', 'confirm'];

/** Qué se borra de la URL para volver a cada paso. */
const CLEARS: Record<string, string[]> = {
	service: [
		BOOKING_PARAM.service,
		BOOKING_PARAM.staff,
		BOOKING_PARAM.date,
		BOOKING_PARAM.slot,
	],
	staff: [BOOKING_PARAM.staff, BOOKING_PARAM.date, BOOKING_PARAM.slot],
	slot: [BOOKING_PARAM.slot],
	confirm: [],
};

export function BookingBreadcrumbs({
	slug,
	step,
	search,
}: {
	slug: string;
	step: BookingStep;
	/** Los parámetros actuales, para poder recortarlos. */
	search: string;
}) {
	// En "listo" el flujo terminó: unas migas que invitan a volver a un turno ya
	// reservado sólo pueden confundir.
	if (step === 'done') return null;

	const currentIndex = ORDER.indexOf(step);

	return (
		<nav aria-label={booking.flow.steps.label}>
			<ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
				{ORDER.map((item, index) => {
					const label = booking.flow.steps[item];
					const isCurrent = item === step;
					const isPast = index < currentIndex;

					return (
						<li key={item} className="flex items-center gap-2">
							{index > 0 && (
								<span aria-hidden="true" className="text-ink-500">
									›
								</span>
							)}

							{isPast ? (
								<Link
									href={hrefFor(slug, item, search)}
									className="font-medium text-accent-600 underline-offset-4 hover:underline"
								>
									{label}
								</Link>
							) : (
								<span
									aria-current={isCurrent ? 'step' : undefined}
									className={cn(
										isCurrent ? 'font-medium text-ink-900' : 'text-ink-500',
									)}
								>
									{label}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}

/** La misma dirección, sin lo que se eligió después de ese paso. */
function hrefFor(slug: string, step: NamedStep, search: string): string {
	const next = new URLSearchParams(search);
	for (const param of CLEARS[step] ?? []) next.delete(param);

	const query = next.toString();
	return query ? `${bookingHref(slug)}?${query}` : bookingHref(slug);
}

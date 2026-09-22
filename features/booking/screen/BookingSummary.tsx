'use client';

import { booking } from '@/content/booking';
import {
	formatDuration,
	formatLongDate,
	formatPrice,
	formatServicePrice,
	formatTime,
} from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import type { PublicBusinessProfile } from '@/services/booking/types';

/**
 * El resumen de lo que se está reservando: el negocio arriba y lo elegido
 * debajo.
 *
 * En escritorio es la columna derecha, fija; en el teléfono no existe, porque
 * ahí el mismo resumen ya va en una línea bajo el título y una tarjeta lateral
 * dejaría el paso —que es lo que hay que tocar— en media pantalla.
 *
 * Muestra sólo lo decidido. Un resumen con huecos para lo que falta ("hora: —")
 * se lee como un formulario incompleto; lo que falta ya está señalado en las
 * migas y en el título.
 *
 * **Con varios servicios es una lista, y el total deja de ser un precio
 * repetido**: pasa a ser una suma que no está en ninguna otra parte de la
 * pantalla. Ahí abajo aparece además la duración, que es lo que alguien necesita
 * para saber si le entra en la tarde.
 */
export function BookingSummary({
	profile,
	state,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
}) {
	const { services, staff, slot, durationMinutes, totalPrice } = state;

	return (
		<aside className="hidden lg:block">
			<div className="sticky top-8 space-y-5 rounded-3xl px-6 py-6 ring-1 ring-paper-300 ring-inset">
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">{profile.name}</h2>
					{profile.address && (
						<p className="text-sm text-ink-500">{profile.address}</p>
					)}
				</div>

				{services.length > 0 && (
					<div className="space-y-3 border-t border-paper-300 pt-4">
						{services.map((service) => (
							<div
								key={service.id}
								className="flex items-start justify-between gap-4"
							>
								<div className="min-w-0">
									<p className="font-medium">{service.name}</p>
									<p className="text-sm text-ink-500">
										{formatDuration(service.durationMinutes)}
										{staff ? ` · ${staff.name}` : ''}
									</p>
								</div>
								<p
									className={
										service.price === null
											? 'shrink-0 text-sm text-ink-500'
											: 'shrink-0 font-medium tabular-nums'
									}
								>
									{formatServicePrice(service.price, service.currency)}
								</p>
							</div>
						))}

						{slot && (
							<p className="text-sm text-ink-700 first-letter:uppercase">
								{formatLongDate(slot.startTime, profile.timezone)} ·{' '}
								<span className="tabular-nums">
									{formatTime(slot.startTime, profile.timezone)}
								</span>
							</p>
						)}
					</div>
				)}

				{services.length > 0 && (
					<div className="space-y-2 border-t border-paper-300 pt-4">
						{/*
						 * La duración total sólo con dos o más servicios: con uno ya está
						 * escrita en su propia fila, y repetirla abajo sería decir el mismo
						 * número dos veces.
						 */}
						{services.length > 1 && (
							<div className="flex items-center justify-between gap-4 text-sm text-ink-600">
								<p>{booking.flow.summary.duration}</p>
								<p className="tabular-nums">
									{formatDuration(durationMinutes)}
								</p>
							</div>
						)}

						<div className="flex items-center justify-between gap-4">
							<p className="font-medium">{booking.flow.summary.total}</p>
							<p
								className={
									totalPrice === null
										? 'text-sm text-ink-500'
										: 'font-semibold tabular-nums'
								}
							>
								{totalPrice === null
									? booking.flow.summary.quotedTotal
									: formatPrice(totalPrice, services[0].currency)}
							</p>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}

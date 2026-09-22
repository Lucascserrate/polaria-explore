'use client';

import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import { formatDuration } from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import { EmptyNote, StepSkeleton } from './SelectionSteps';
import { StaffAvatar } from './StaffAvatar';

/**
 * Repartir la reserva: un profesional por servicio.
 *
 * Es un paso extra y no una variante del anterior, y se llega sólo pidiéndolo.
 * El motivo es el de siempre en este flujo: la mayoría de la gente no tiene
 * preferencia ni siquiera para un servicio, así que preguntarle por cada uno
 * sería cobrarle a todos el caso de unos pocos. Quien lo necesita —el corte con
 * Jose y la barba con Carlos— lo pide una vez y aparece.
 *
 * **Una tarjeta por servicio, con su propio selector.** No es una lista de
 * profesionales con servicios colgando: el orden de arriba abajo es el orden en
 * que se van a atender, el mismo que el resumen y el que el backend encadena.
 *
 * El selector es un `<select>` del sistema y no un menú propio. En el teléfono
 * —que es donde se reserva— abre la rueda nativa, se maneja con el pulgar y
 * funciona con lector de pantalla sin que haya que programar nada; un menú
 * dibujado a mano tendría que reimplementar las tres cosas. Y con cinco
 * profesionales y tres servicios, tres ruedas nativas ocupan menos pantalla que
 * tres listas abiertas.
 */
export function StaffPerServiceStep({
	state,
	onAssignStaff,
}: {
	state: BookingFlowState;
	onAssignStaff: (index: number, staffId: string) => void;
}) {
	if (state.loading && state.staffByService.length === 0) {
		return <StepSkeleton />;
	}

	const assigned =
		state.staffChoice.kind === 'perService' ? state.staffChoice.staffIds : [];

	return (
		<div className="space-y-2">
			{state.services.map((service, index) => {
				const options =
					state.staffByService.find((entry) => entry.serviceId === service.id)
						?.staff ?? [];

				const current = assigned[index] ?? '';
				const member = options.find((option) => option.id === current) ?? null;

				return (
					<div
						key={service.id}
						className="rounded-2xl px-4 py-4 ring-1 ring-paper-300 ring-inset"
					>
						<p className="font-medium">{service.name}</p>
						<p className="mt-0.5 text-sm text-ink-500">
							{formatDuration(service.durationMinutes)}
						</p>

						{options.length === 0 ? (
							/*
							 * Un servicio que nadie del equipo hace. No debería llegar acá
							 * —sin candidatos no hay horarios y el paso anterior ya lo dice—
							 * pero el catálogo puede cambiar mientras la pantalla está
							 * abierta, y una tarjeta con un selector vacío no explica nada.
							 */
							<p className="mt-3 text-sm text-ink-500">
								{booking.flow.staffPerService.empty}
							</p>
						) : (
							<div className="mt-3 flex items-center gap-3">
								{member && <StaffAvatar member={member} size={36} />}

								{/*
								 * La flecha la dibujamos nosotros y el `<select>` va sin
								 * apariencia propia: cada navegador pinta la suya —una caja
								 * gris en Windows, una píldora en Safari— y en una pantalla
								 * cuyo único control lleno es "Continuar" eso se ve como un
								 * error de estilos.
								 */}
								<div className="relative min-w-0 flex-1">
									<select
										value={current}
										onChange={(event) =>
											onAssignStaff(index, event.target.value)
										}
										aria-label={booking.flow.staffPerService.label(
											service.name,
										)}
										className={cn(
											'w-full appearance-none rounded-full bg-paper-50 py-2.5 pr-10 pl-4',
											'text-sm font-medium ring-1 ring-paper-300 ring-inset',
											'hover:bg-paper-200',
											current ? 'text-ink-900' : 'text-ink-500',
										)}
									>
										{/*
										 * La opción vacía existe mientras no haya elegido, y
										 * desaparece después: dejarla sería ofrecer "sin elegir"
										 * como si fuera una opción, y no lo es —para eso está
										 * "cualquier profesional" en el paso anterior—.
										 */}
										{!current && (
											<option value="" disabled>
												{booking.flow.staffPerService.placeholder}
											</option>
										)}
										{options.map((option) => (
											<option key={option.id} value={option.id}>
												{option.name}
											</option>
										))}
									</select>

									<svg
										aria-hidden="true"
										viewBox="0 0 24 24"
										className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-ink-500"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="m6 9 6 6 6-6" />
									</svg>
								</div>
							</div>
						)}
					</div>
				);
			})}

			{state.services.length === 0 && (
				<EmptyNote>{booking.flow.staff.empty}</EmptyNote>
			)}
		</div>
	);
}

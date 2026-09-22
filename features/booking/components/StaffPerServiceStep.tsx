'use client';

import { useState } from 'react';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import { ANY_STAFF } from '../booking-url';
import { formatDuration } from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import { EmptyNote, StepSkeleton } from './SelectionSteps';
import { AnyStaffAvatar, StaffAvatar } from './StaffAvatar';
import { StaffPickerDialog } from './StaffPickerDialog';

/**
 * Repartir la reserva: un profesional por servicio.
 *
 * Es un paso extra y no una variante del anterior, y se llega sólo pidiéndolo.
 * El motivo es el de siempre en este flujo: la mayoría de la gente no tiene
 * preferencia ni siquiera para un servicio, así que preguntarle por cada uno
 * sería cobrarle a todos el caso de unos pocos. Quien lo necesita —el corte con
 * Jose y la barba con Carlos— lo pide una vez y aparece.
 *
 * **Una tarjeta por servicio, con su propia píldora.** No es una lista de
 * profesionales con servicios colgando: el orden de arriba abajo es el orden en
 * que se van a atender, el mismo que el resumen y el que el backend encadena.
 *
 * **Todas arrancan en "Cualquier profesional", y eso no es un valor por defecto
 * cómodo sino la razón por la que el paso funciona.** Antes arrancaban vacías, y
 * "una elegida y la otra no" es un estado que la URL no sabía escribir: el
 * parámetro volvía al centinela de "no elegí a nadie" y cada elección borraba la
 * anterior. Con todas en "cualquiera" no hay nada que completar, sólo cosas que
 * cambiar, y el estado a medio llenar deja de existir.
 */
export function StaffPerServiceStep({
	state,
	onAssignStaff,
}: {
	state: BookingFlowState;
	onAssignStaff: (index: number, staffId: string) => void;
}) {
	/** Qué servicio tiene la hoja abierta, por posición. */
	const [picking, setPicking] = useState<number | null>(null);

	if (state.loading && state.staffByService.length === 0) {
		return <StepSkeleton />;
	}

	if (state.services.length === 0) {
		return <EmptyNote>{booking.flow.staff.empty}</EmptyNote>;
	}

	const assigned =
		state.staffChoice.kind === 'perService' ? state.staffChoice.staffIds : [];

	const optionsFor = (serviceId: string) =>
		state.staffByService.find((entry) => entry.serviceId === serviceId)
			?.staff ?? [];

	const open = picking === null ? null : state.services[picking];

	return (
		<div className="space-y-2">
			{state.services.map((service, index) => {
				const options = optionsFor(service.id);
				const current = assigned[index] ?? ANY_STAFF;
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
							 * abierta, y una píldora que abre una hoja vacía no explica nada.
							 */
							<p className="mt-3 text-sm text-ink-500">
								{booking.flow.staffPerService.empty}
							</p>
						) : (
							<button
								type="button"
								onClick={() => setPicking(index)}
								aria-label={booking.flow.staffPerService.label(service.name)}
								className={cn(
									'mt-3 flex max-w-full items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5',
									'ring-1 ring-paper-300 ring-inset transition-colors hover:bg-paper-200',
								)}
							>
								{member ? (
									<StaffAvatar member={member} size={28} />
								) : (
									<AnyStaffAvatar size={28} />
								)}

								<span className="min-w-0 truncate text-sm font-medium">
									{member ? member.name : booking.flow.staff.any}
								</span>

								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									className="size-4 shrink-0 text-ink-500"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="m6 9 6 6 6-6" />
								</svg>
							</button>
						)}
					</div>
				);
			})}

			{open && picking !== null && (
				<StaffPickerDialog
					service={open}
					options={optionsFor(open.id)}
					current={assigned[picking] ?? ANY_STAFF}
					onSelect={(staffId) => onAssignStaff(picking, staffId)}
					onClose={() => setPicking(null)}
				/>
			)}
		</div>
	);
}

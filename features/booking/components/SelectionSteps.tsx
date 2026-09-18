'use client';

import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import {
	formatDayChip,
	formatDuration,
	formatServicePrice,
	formatTime,
} from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import type {
	PublicBusinessProfile,
	PublicService,
	PublicSlot,
	PublicStaff,
} from '@/services/booking/types';
import { AnyStaffAvatar, StaffAvatar } from './StaffAvatar';

/**
 * Los tres pasos en los que se elige: servicio, profesional y horario.
 *
 * Todos comparten la misma forma —una lista de opciones grandes, tocables con
 * el pulgar— porque el flujo se diseñó para el teléfono: la mayoría de la gente
 * llega a esta página desde un enlace de WhatsApp, de Instagram o de un QR
 * pegado en el mostrador. En una pantalla ancha las mismas listas se ven
 * holgadas, que es el problema barato de los dos.
 */

/**
 * Lo que cada paso avisa hacia arriba.
 *
 * Están juntos para que los pasos tomen su función de acá con
 * `Handlers['onSelectStaff']` en lugar de repetir la firma. Confirmar no está:
 * ese paso vive en `ConfirmStep` y declara la suya, que además cambia según
 * haya cuenta o no.
 */
type Handlers = {
	onSelectService: (service: PublicService) => void;
	onSelectStaff: (staff: PublicStaff | null) => void;
	onSelectDate: (date: string) => void;
	onSelectSlot: (slot: PublicSlot) => void;
};

/** Fila tocable: la unidad de todas las listas del flujo. */
function OptionRow({
	title,
	meta,
	hint,
	leading,
	selected,
	onClick,
}: {
	title: string;
	meta?: string;
	hint?: string;
	leading?: React.ReactNode;
	selected?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				'flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left',
				'ring-1 ring-paper-300 ring-inset transition-colors',
				'hover:bg-paper-200 active:bg-paper-300',
				selected && 'bg-ink-950 text-white ring-ink-950 hover:bg-ink-900',
			)}
			aria-pressed={selected}
		>
			{leading}

			<span className="min-w-0 flex-1">
				<span className="block truncate font-medium">{title}</span>
				{hint && (
					<span
						className={cn(
							'mt-0.5 block truncate text-sm',
							selected ? 'text-white/70' : 'text-ink-500',
						)}
					>
						{hint}
					</span>
				)}
			</span>
			{meta && (
				<span
					className={cn(
						'shrink-0 text-sm tabular-nums',
						selected ? 'text-white/80' : 'text-ink-600',
					)}
				>
					{meta}
				</span>
			)}
		</button>
	);
}

export function ServiceStep({
	profile,
	onSelectService,
}: {
	profile: PublicBusinessProfile;
	onSelectService: Handlers['onSelectService'];
}) {
	return (
		<div className="space-y-2">
			{profile.services.map((service) => (
				<OptionRow
					key={service.id}
					title={service.name}
					hint={formatDuration(service.durationMinutes)}
					meta={formatServicePrice(service.price, service.currency)}
					onClick={() => onSelectService(service)}
				/>
			))}
		</div>
	);
}

export function StaffStep({
	state,
	onSelectStaff,
}: {
	state: BookingFlowState;
	onSelectStaff: Handlers['onSelectStaff'];
}) {
	if (state.loading && state.staffOptions.length === 0) return <StepSkeleton />;

	if (state.staffOptions.length === 0) {
		return <EmptyNote>{booking.flow.staff.empty}</EmptyNote>;
	}

	return (
		<div className="space-y-2">
			{/*
			 * "Cualquier profesional" va primero y no al final: es la opción con más
			 * horarios y la que elige la mayoría de la gente que no tiene preferencia,
			 * que en una barbería es casi todo el mundo la primera vez.
			 */}
			<OptionRow
				title={booking.flow.staff.any}
				hint={booking.flow.staff.anyHint}
				leading={<AnyStaffAvatar size={44} selected={state.staff === null} />}
				selected={state.staff === null}
				onClick={() => onSelectStaff(null)}
			/>
			{state.staffOptions.map((member) => (
				<OptionRow
					key={member.id}
					title={member.name}
					hint={member.jobTitle ?? undefined}
					leading={
						<StaffAvatar
							member={member}
							size={44}
							selected={state.staff?.id === member.id}
						/>
					}
					selected={state.staff?.id === member.id}
					onClick={() => onSelectStaff(member)}
				/>
			))}
		</div>
	);
}

export function SlotStep({
	profile,
	state,
	onSelectDate,
	onSelectSlot,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
	onSelectDate: Handlers['onSelectDate'];
	onSelectSlot: Handlers['onSelectSlot'];
}) {
	if (state.days.length === 0) {
		return state.loading ? (
			<StepSkeleton />
		) : (
			<EmptyNote>{booking.flow.slot.noDays}</EmptyNote>
		);
	}

	return (
		<div className="space-y-6">
			{/*
			 * Tira horizontal en lugar de un calendario mensual. Reservar un turno es
			 * casi siempre "esta semana": una grilla de treinta días obliga a leer un
			 * mes entero para elegir el jueves.
			 */}
			<div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
				{state.days.map((day) => {
					const chip = formatDayChip(day, profile.timezone);
					const selected = state.date === day;

					return (
						<button
							key={day}
							type="button"
							onClick={() => onSelectDate(day)}
							aria-pressed={selected}
							className={cn(
								'flex w-16 shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl py-3',
								'ring-1 ring-paper-300 ring-inset transition-colors',
								selected
									? 'bg-ink-950 text-white ring-ink-950'
									: 'hover:bg-paper-200',
							)}
						>
							<span
								className={cn(
									'text-xs',
									selected ? 'text-white/70' : 'text-ink-500',
								)}
							>
								{chip.weekday}
							</span>
							<span className="text-lg leading-none font-semibold tabular-nums">
								{chip.day}
							</span>
							<span
								className={cn(
									'text-xs',
									selected ? 'text-white/70' : 'text-ink-500',
								)}
							>
								{chip.month}
							</span>
						</button>
					);
				})}
			</div>

			{state.loading ? (
				<StepSkeleton />
			) : state.slots.length === 0 ? (
				<EmptyNote>{booking.flow.slot.empty}</EmptyNote>
			) : (
				<div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
					{state.slots.map((slot) => (
						<button
							key={slot.startTime}
							type="button"
							onClick={() => onSelectSlot(slot)}
							className={cn(
								'rounded-xl py-3 text-center text-sm font-medium tabular-nums',
								'ring-1 ring-paper-300 ring-inset transition-colors',
								'hover:bg-ink-950 hover:text-white hover:ring-ink-950',
							)}
						>
							{formatTime(slot.startTime, profile.timezone)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

// ---------------------------------------------------------------------------

function EmptyNote({ children }: { children: React.ReactNode }) {
	return (
		<p className="rounded-2xl bg-paper-200 px-5 py-6 text-center text-ink-600">
			{children}
		</p>
	);
}

/**
 * Espera con la forma de lo que viene, no con un cartel de "cargando".
 *
 * Tres barras del alto de una fila: la lista aparece en el mismo lugar donde ya
 * estaba el hueco, así que la pantalla no salta cuando llega la respuesta.
 */
function StepSkeleton() {
	return (
		<div className="space-y-2" aria-live="polite" aria-busy="true">
			<span className="sr-only">{booking.flow.slot.loading}</span>
			{[0, 1, 2].map((row) => (
				<div
					key={row}
					className="h-16 animate-pulse rounded-2xl bg-paper-200"
				/>
			))}
		</div>
	);
}

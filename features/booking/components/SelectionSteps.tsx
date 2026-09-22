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
import { MAX_SERVICES_PER_BOOKING } from '@/services/booking/selection';
import { AnyStaffAvatar, PerServiceAvatar, StaffAvatar } from './StaffAvatar';

/**
 * Los pasos en los que se elige: servicios, profesional y horario.
 *
 * Todos comparten la misma forma —una lista de opciones grandes, tocables con
 * el pulgar— porque el flujo se diseñó para el teléfono: la mayoría de la gente
 * llega a esta página desde un enlace de WhatsApp, de Instagram o de un QR
 * pegado en el mostrador. En una pantalla ancha las mismas listas se ven
 * holgadas, que es el problema barato de los dos.
 *
 * **El de servicios es el único de marcar y no de elegir**, y esa diferencia se
 * ve: sus filas no avanzan al tocarlas, se tildan. Lo que avanza es el botón de
 * la barra de abajo (`BookingBar`), que además es la única señal de que se puede
 * marcar más de uno.
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
	onToggleService: (service: PublicService) => void;
	onSelectStaff: (staff: PublicStaff | null) => void;
	onSelectStaffPerService: () => void;
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

/**
 * El paso de servicios: una lista de marcar.
 *
 * **La fila marcada no se pinta entera de negro**, al revés que en los otros
 * pasos, y la diferencia es de significado: ahí el negro señala la única opción
 * elegida, y acá puede haber tres marcadas a la vez. Tres filas negras seguidas
 * se leen como un bloque y no como una lista, así que lo marcado se dice con el
 * borde y con el círculo de la derecha —el mismo lugar donde estaba el `+` que
 * se acaba de tocar—.
 */
export function ServiceStep({
	profile,
	state,
	onToggleService,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
	onToggleService: Handlers['onToggleService'];
}) {
	const chosen = new Set(state.services.map((service) => service.id));

	/*
	 * Al llegar al tope, lo que no está marcado se apaga en vez de rechazar el
	 * toque en silencio: una fila que no reacciona se lee como un error de la
	 * página. Lo ya marcado sigue tocándose, porque sacar algo es justamente la
	 * salida de este estado.
	 */
	const full = chosen.size >= MAX_SERVICES_PER_BOOKING;

	return (
		<div className="space-y-2">
			{full && <EmptyNote>{booking.flow.service.full}</EmptyNote>}

			{profile.services.map((service) => (
				<ServiceRow
					key={service.id}
					service={service}
					selected={chosen.has(service.id)}
					disabled={full && !chosen.has(service.id)}
					onClick={() => onToggleService(service)}
				/>
			))}
		</div>
	);
}

function ServiceRow({
	service,
	selected,
	disabled,
	onClick,
}: {
	service: PublicService;
	selected: boolean;
	disabled: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-pressed={selected}
			aria-label={
				selected
					? booking.flow.service.remove(service.name)
					: booking.flow.service.add(service.name)
			}
			className={cn(
				'flex w-full items-start justify-between gap-4 rounded-2xl px-4 py-4 text-left',
				'ring-inset transition-colors',
				selected ? 'ring-2 ring-ink-950' : 'ring-1 ring-paper-300',
				disabled ? 'opacity-40' : 'hover:bg-paper-200 active:bg-paper-300',
			)}
		>
			<span className="min-w-0 flex-1">
				<span className="block font-medium">{service.name}</span>
				<span className="mt-0.5 block text-sm text-ink-500">
					{formatDuration(service.durationMinutes)}
				</span>
				{/*
				 * La descripción se recorta a dos líneas. Es la que el negocio escribió
				 * para su catálogo y puede ser un párrafo: entera, una sola fila
				 * ocuparía la pantalla y la lista dejaría de poder recorrerse.
				 */}
				{service.description && (
					<span className="mt-2 line-clamp-2 block text-sm text-ink-600">
						{service.description}
					</span>
				)}
				<span
					className={cn(
						'mt-2 block',
						service.price === null
							? 'text-sm text-ink-500'
							: 'font-semibold tabular-nums',
					)}
				>
					{formatServicePrice(service.price, service.currency)}
				</span>
			</span>

			{/*
			 * El círculo es `aria-hidden`: lo que hace la fila ya lo dice su
			 * `aria-label`, y `aria-pressed` dice si está marcada. Anunciarlo tres
			 * veces es peor que una.
			 */}
			<span
				aria-hidden="true"
				className={cn(
					'mt-1 grid size-8 shrink-0 place-items-center rounded-full transition-colors',
					selected
						? 'bg-ink-950 text-white'
						: 'text-ink-700 ring-1 ring-paper-300 ring-inset',
				)}
			>
				<svg
					viewBox="0 0 24 24"
					className="size-4"
					fill="none"
					stroke="currentColor"
					strokeWidth={2.5}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					{selected ? <path d="m5 13 4 4L19 7" /> : <path d="M12 5v14M5 12h14" />}
				</svg>
			</span>
		</button>
	);
}

export function StaffStep({
	state,
	onSelectStaff,
	onSelectStaffPerService,
}: {
	state: BookingFlowState;
	onSelectStaff: Handlers['onSelectStaff'];
	onSelectStaffPerService: Handlers['onSelectStaffPerService'];
}) {
	if (state.loading && state.staffOptions.length === 0) return <StepSkeleton />;

	/*
	 * Repartir sólo tiene sentido con más de un servicio: con uno, "uno por
	 * servicio" y "uno para todo" son la misma pregunta hecha dos veces.
	 */
	const canSplit = state.services.length > 1;

	/*
	 * Nadie hace todo lo elegido. No es un callejón —la reserva existe repartida—
	 * así que en lugar de una lista vacía se explica y queda la fila que resuelve.
	 */
	const noneShared = state.staffOptions.length === 0;

	if (noneShared && !canSplit) {
		return <EmptyNote>{booking.flow.staff.empty}</EmptyNote>;
	}

	return (
		<div className="space-y-2">
			{noneShared && <EmptyNote>{booking.flow.staff.noneShared}</EmptyNote>}

			{/*
			 * "Cualquier profesional" va primero y no al final: es la opción con más
			 * horarios y la que elige la mayoría de la gente que no tiene preferencia,
			 * que en una barbería es casi todo el mundo la primera vez.
			 *
			 * Con varios servicios sigue queriendo decir **una sola persona para
			 * todo**, elegida por el servidor. Repartir es la fila de abajo, y es una
			 * decisión distinta que hay que tomar a propósito.
			 */}
			{!noneShared && (
				<OptionRow
					title={booking.flow.staff.any}
					hint={booking.flow.staff.anyHint}
					leading={
						<AnyStaffAvatar
							size={44}
							selected={state.staffChoice.kind === 'any'}
						/>
					}
					selected={state.staffChoice.kind === 'any'}
					onClick={() => onSelectStaff(null)}
				/>
			)}

			{canSplit && (
				<OptionRow
					title={booking.flow.staff.perService}
					hint={booking.flow.staff.perServiceHint}
					leading={<PerServiceAvatar size={44} selected={false} />}
					onClick={onSelectStaffPerService}
				/>
			)}

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

export function EmptyNote({ children }: { children: React.ReactNode }) {
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
export function StepSkeleton() {
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

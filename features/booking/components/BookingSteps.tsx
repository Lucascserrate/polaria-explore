'use client';

import { booking } from '@/content/booking';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	formatDayChip,
	formatDuration,
	formatLongDate,
	formatPrice,
	formatTime,
} from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import type {
	PublicBusinessProfile,
	PublicService,
	PublicSlot,
	PublicStaff,
} from '@/services/booking/types';
import type { CustomerSession } from '@/services/customer/types';
import { AnyStaffAvatar, StaffAvatar } from './StaffAvatar';

/**
 * El cuerpo de cada paso del flujo.
 *
 * Todos comparten la misma forma —una lista de opciones grandes, tocables con
 * el pulgar— porque el flujo se diseñó para el teléfono: la mayoría de la gente
 * llega a esta página desde un enlace de WhatsApp, de Instagram o de un QR
 * pegado en el mostrador. En una pantalla ancha las mismas listas se ven
 * holgadas, que es el problema barato de los dos.
 */

type Handlers = {
	onSelectService: (service: PublicService) => void;
	onSelectStaff: (staff: PublicStaff | null) => void;
	onSelectDate: (date: string) => void;
	onSelectSlot: (slot: PublicSlot) => void;
	onConfirm: () => void;
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
					meta={formatPrice(service.price, profile.currency)}
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

/**
 * Iniciar sesión, que reemplazó al formulario de nombre y teléfono.
 *
 * Es un enlace y no un `fetch`: entrar con Google es una navegación —sale del
 * sitio, pasa por Google y vuelve—, y el destino es una ruta de este mismo
 * sitio para no escribir la dirección de la API en el HTML. Ver
 * `app/api/customer/login`.
 *
 * El `returnTo` es la dirección actual **con sus parámetros**, que es lo que
 * hace que al volver el flujo siga en el mismo paso, con el servicio, el
 * profesional y el horario ya elegidos. Era justamente lo que se perdía cuando
 * esto era un modal.
 */
export function SignInStep() {
	const returnTo =
		typeof window === 'undefined'
			? '/'
			: `${window.location.pathname}${window.location.search}`;

	return (
		<div className="max-w-lg space-y-5">
			<p className="text-ink-600">{booking.flow.identity.why}</p>

			<Button
				size="lg"
				className="w-full"
				href={`/api/customer/login?returnTo=${encodeURIComponent(returnTo)}`}
			>
				{booking.flow.identity.google}
			</Button>

			<p className="text-sm text-ink-500">
				{booking.flow.identity.whatsappNote}
			</p>
		</div>
	);
}

/** Con cuenta y teléfono, reservar es leer y apretar un botón. */
export function ConfirmStep({
	profile,
	session,
	submitting,
	askingPhone,
	onAskPhone,
	onConfirm,
}: {
	profile: PublicBusinessProfile;
	session: CustomerSession;
	submitting: boolean;
	/** El diálogo del teléfono está abierto encima de esta pantalla. */
	askingPhone: boolean;
	onAskPhone: () => void;
	onConfirm: () => void;
}) {
	/*
	 * Sin teléfono no se puede reservar, y quien cerró el diálogo tiene que poder
	 * volver a abrirlo desde acá. Mientras está abierto no se dibuja nada: un
	 * botón detrás de un modal es un botón que nadie puede apretar.
	 */
	if (!session.phone) {
		return askingPhone ? null : (
			<div className="max-w-lg space-y-4">
				<p className="text-ink-600">{booking.flow.phoneStep.missing}</p>
				<Button size="lg" className="w-full" onClick={onAskPhone}>
					{booking.flow.phoneStep.title}
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-lg space-y-5">
			{/*
			 * Los datos se muestran completos y no detrás de un "usar mi cuenta": el
			 * número es por donde llega el recordatorio, así que quien lo cambió tiene
			 * que poder verlo antes de confirmar y no cuando no le llega nada.
			 */}
			<div className="space-y-1 rounded-2xl bg-paper-200 px-5 py-4">
				<p className="text-sm text-ink-600">{booking.flow.details.bookingAs}</p>
				<p className="font-medium">{session.name}</p>
				<p className="text-ink-700 tabular-nums">
					{formatPhone(session.phone, profile.dialCode)}
				</p>
			</div>

			<Button
				size="lg"
				className="w-full"
				disabled={submitting}
				onClick={onConfirm}
			>
				{submitting
					? booking.flow.details.submitting
					: booking.flow.details.submit}
			</Button>
		</div>
	);
}

/**
 * El teléfono guardado, en la forma en que la persona lo escribió.
 *
 * La cuenta lo guarda como lo guarda WhatsApp —dígitos con código de país y sin
 * `+`, `59170011223`— y eso no se le muestra así a nadie. Se le devuelve el `+`
 * y se separa el prefijo del negocio cuando coincide; si el número es de otro
 * país se muestra completo, que es más honesto que partirlo por un prefijo que
 * no es el suyo.
 */
function formatPhone(phone: string, dialCode: string): string {
	return phone.startsWith(dialCode)
		? `+${dialCode} ${phone.slice(dialCode.length)}`
		: `+${phone}`;
}

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

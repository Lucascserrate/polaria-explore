'use client';

import { useState } from 'react';
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
import { saveCustomerPhone } from '@/services/customer/phone';
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
	/** El teléfono se guardó en la cuenta: la sesión ya sirve para reservar. */
	onSessionChange: (session: CustomerSession) => void;
	onConfirm: () => void;
	onClose: () => void;
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

export function DetailsStep({
	profile,
	state,
	onSessionChange,
	onConfirm,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
	onSessionChange: Handlers["onSessionChange"];
	onConfirm: Handlers["onConfirm"];
}) {
	/*
	 * Tres estados, en el orden en que los ve una persona nueva: no inició
	 * sesión, inició pero no dio su teléfono, y listo para confirmar. El tercero
	 * es el único que ve quien ya reservó antes en cualquier negocio de Polaria,
	 * y para esa persona este paso es un botón.
	 */
	if (!state.session) return <SignInStep />;

	if (!state.session.phone) {
		return (
			<PhoneStep
				profile={profile}
				onSaved={onSessionChange}
			/>
		);
	}

	return (
		<ConfirmStep
			profile={profile}
			session={state.session}
			submitting={state.submitting}
			onConfirm={onConfirm}
		/>
	);
}

/**
 * Iniciar sesión, que reemplazó al formulario de nombre y teléfono.
 *
 * Es un enlace y no un `fetch`: iniciar sesión con Google es una navegación del
 * navegador —sale del sitio, pasa por Google y vuelve—, y el destino es una ruta
 * de este mismo sitio para no escribir la dirección de la API en el HTML. Ver
 * `app/api/customer/login`.
 *
 * El `returnTo` es la página del negocio donde está reservando, así que al
 * volver sigue viendo lo mismo. Lo que **no** sobrevive al viaje es el paso en
 * el que estaba: al volver tiene que elegir servicio y horario otra vez. Es la
 * arruga conocida de esta primera versión y se arregla guardando el flujo antes
 * de salir; no se hizo todavía porque el caso que importa —quien ya tiene
 * cuenta— nunca pasa por acá.
 */
function SignInStep() {
	const returnTo =
		typeof window === "undefined"
			? "/"
			: `${window.location.pathname}${window.location.search}`;

	return (
		<div className="space-y-5">
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

/**
 * El teléfono: lo único que Google no entrega.
 *
 * Se pide una sola vez en la vida de la cuenta, y por eso el texto dice para qué
 * es: es el número al que llega la confirmación y el recordatorio, no un dato de
 * registro. El prefijo se muestra al costado y no se escribe —es el del país del
 * negocio—, y quien tenga un número de otro país puede escribirlo completo con
 * `+`: eso lo resuelve el backend, que es el único que normaliza teléfonos.
 */
function PhoneStep({
	profile,
	onSaved,
}: {
	profile: PublicBusinessProfile;
	onSaved: (session: CustomerSession) => void;
}) {
	const [phone, setPhone] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!phone.trim() || saving) return;

		setSaving(true);
		setError(null);

		try {
			onSaved(
				await saveCustomerPhone({
					phone: phone.trim(),
					timezone: profile.timezone,
				}),
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: "No pudimos guardar el número. Probá de nuevo.",
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<form className="space-y-5" onSubmit={submit}>
			<p className="text-ink-600">{booking.flow.phoneStep.subtitle}</p>

			<Field
				id="customer-phone"
				label={booking.flow.phoneStep.label}
				hint={booking.flow.details.phoneHint}
				error={error ?? undefined}
			>
				<div className="flex items-stretch gap-2">
					<span className="flex shrink-0 items-center rounded-xl bg-paper-200 px-3 text-sm text-ink-600 tabular-nums">
						+{profile.dialCode}
					</span>
					<input
						id="customer-phone"
						value={phone}
						onChange={(event) => setPhone(event.target.value)}
						placeholder={booking.flow.details.phonePlaceholder}
						inputMode="tel"
						autoComplete="tel"
						autoFocus
						className={cn(inputClasses, "flex-1")}
					/>
				</div>
			</Field>

			<Button type="submit" size="lg" className="w-full" disabled={saving}>
				{saving
					? booking.flow.phoneStep.saving
					: booking.flow.phoneStep.submit}
			</Button>
		</form>
	);
}

/** Con cuenta y teléfono, reservar es leer y apretar un botón. */
function ConfirmStep({
	profile,
	session,
	submitting,
	onConfirm,
}: {
	profile: PublicBusinessProfile;
	session: CustomerSession;
	submitting: boolean;
	onConfirm: () => void;
}) {
	return (
		<div className="space-y-5">
			{/*
			 * Los datos se muestran completos y no detrás de un "usar mi cuenta": el
			 * número es por donde llega el recordatorio, así que quien lo cambió tiene
			 * que poder verlo antes de confirmar y no cuando no le llega nada.
			 */}
			<div className="space-y-1 rounded-2xl bg-paper-200 px-5 py-4">
				<p className="text-sm text-ink-600">
					{booking.flow.details.bookingAs}
				</p>
				<p className="font-medium">{session.name}</p>
				<p className="text-ink-700 tabular-nums">
					{session.phone ? formatPhone(session.phone, profile.dialCode) : ""}
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
 * país, se muestra completo, que es más honesto que partirlo por un prefijo que
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
	onClose,
}: {
	profile: PublicBusinessProfile;
	state: BookingFlowState;
	onClose: Handlers['onClose'];
}) {
	const { confirmation } = state;
	if (!confirmation) return null;

	return (
		<div className="space-y-6 text-center">
			<div className="space-y-2">
				<h3 className="text-2xl font-semibold">{booking.flow.done.title}</h3>
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

			<Button size="lg" className="w-full" onClick={onClose}>
				{booking.flow.done.close}
			</Button>
		</div>
	);
}

// ---------------------------------------------------------------------------

const inputClasses =
	'w-full rounded-xl bg-paper-100 px-4 py-3 text-ink-900 ring-1 ring-paper-300 ' +
	'ring-inset outline-none placeholder:text-ink-500 focus:ring-2 focus:ring-accent-500';

function Field({
	id,
	label,
	hint,
	error,
	children,
}: {
	id: string;
	label: string;
	hint?: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<label htmlFor={id} className="block text-sm font-medium text-ink-700">
				{label}
			</label>
			{children}
			{error ? (
				<p className="text-sm text-attention-700">{error}</p>
			) : (
				hint && <p className="text-sm text-ink-500">{hint}</p>
			)}
		</div>
	);
}

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

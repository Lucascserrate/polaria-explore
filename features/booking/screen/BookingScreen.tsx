'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { booking } from '@/content/booking';
import type { CustomerSession } from '@/services/customer/types';
import type { PublicBusinessProfile } from '@/services/booking/types';
import { useBookingFlow } from '../useBookingFlow';
import {
	ConfirmStep,
	DoneStep,
	ServiceStep,
	SignInStep,
	SlotStep,
	StaffStep,
} from '../components/BookingSteps';
import { BookingBreadcrumbs } from './BookingBreadcrumbs';
import { BookingSummary } from './BookingSummary';
import { PhoneDialog } from './PhoneDialog';

/**
 * La pantalla de reserva: `/[negocio]/reservar`.
 *
 * Antes esto era un modal sobre la página del negocio, y el login lo rompió:
 * salir a Google cerraba el modal y volvía al paso uno con todo lo elegido
 * perdido. Ahora es una pantalla con dirección propia y lo elegido viaja en la
 * URL, así que volver de Google es volver al mismo lugar. Ver `useBookingFlow`.
 *
 * Dos columnas en escritorio —el paso a la izquierda, el resumen a la derecha— y
 * una sola en el teléfono, donde el resumen se reduce a la línea que va debajo
 * del título. La barra inferior con el botón sólo aparece en los pasos que
 * tienen algo que confirmar: en los de elegir, se avanza tocando una opción y un
 * botón "Continuar" sería un segundo toque para lo mismo.
 */
export function BookingScreen({
	profile,
	customer,
}: {
	profile: PublicBusinessProfile;
	customer: CustomerSession | null;
}) {
	const router = useRouter();
	const params = useSearchParams();
	const flow = useBookingFlow(profile, customer);
	const { state } = flow;

	/**
	 * El teléfono se pide apenas hay sesión sin número: es completar la cuenta,
	 * no un paso de la reserva.
	 *
	 * Arranca abierto si la sesión llegó sin teléfono, que es exactamente el
	 * estado en el que vuelve alguien que recién creó su cuenta con Google.
	 * `dismissed` recuerda que decidió cerrarlo, para no volver a plantárselo en
	 * cada cambio de paso.
	 */
	const [dismissedPhone, setDismissedPhone] = useState(false);
	const needsPhone = Boolean(state.session && !state.session.phone);
	const askingPhone = needsPhone && !dismissedPhone;

	const businessHref = `/${encodeURIComponent(profile.slug)}`;

	return (
		<main className="min-h-dvh bg-paper-50 pb-24 lg:pb-10">
			{/*
			 * El encabezado de la pantalla: volver y salir. "Volver" usa el historial
			 * del navegador —cada paso es una entrada— así que hace lo mismo que el
			 * gesto del sistema y no hay dos formas de retroceder que puedan
			 * discrepar.
			 */}
			<Container className="max-w-6xl py-5">
				<div className="flex items-center justify-between gap-4">
					<button
						type="button"
						onClick={() => router.back()}
						aria-label={booking.flow.back}
						className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-paper-300 ring-inset hover:bg-paper-200"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="m15 6-6 6 6 6" />
						</svg>
					</button>

					<Link
						href={businessHref}
						aria-label={booking.flow.close}
						className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-paper-300 ring-inset hover:bg-paper-200"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
						>
							<path d="M6 6l12 12M18 6L6 18" />
						</svg>
					</Link>
				</div>
			</Container>

			<Container className="max-w-6xl">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
					<div className="space-y-6">
						<div className="space-y-3">
							<BookingBreadcrumbs
								slug={profile.slug}
								step={state.step}
								search={params.toString()}
							/>

							{/*
							 * En "listo" el encabezado lo pone el propio paso, con el detalle
							 * del turno debajo: dos títulos seguidos —"¡Listo!" y "tu turno
							 * quedó reservado"— eran la misma frase dicha dos veces.
							 */}
							{state.step !== 'done' && (
								<h1 className="text-3xl font-semibold sm:text-4xl">
									{booking.flow.titles[state.step]}
								</h1>
							)}

							{/* En el teléfono, éste es todo el resumen que hay. */}
							{state.service && state.step !== 'done' && (
								<p className="text-ink-600 lg:hidden">
									{state.service.name}
									{state.staff ? ` · ${state.staff.name}` : ''}
								</p>
							)}
						</div>

						{state.error && (
							<p className="rounded-2xl bg-attention-50 px-5 py-4 text-attention-700">
								{state.error}
							</p>
						)}

						<Step
							flow={flow}
							profile={profile}
							askingPhone={askingPhone}
							onAskPhone={() => setDismissedPhone(false)}
						/>
					</div>

					{state.step !== 'done' && (
						<BookingSummary profile={profile} state={state} />
					)}
				</div>
			</Container>

			{askingPhone && (
				<PhoneDialog
					profile={profile}
					onSaved={(session) => {
						flow.updateSession(session);
						setDismissedPhone(false);
					}}
					onClose={() => setDismissedPhone(true)}
				/>
			)}
		</main>
	);
}

/** El cuerpo del paso actual. */
function Step({
	flow,
	profile,
	askingPhone,
	onAskPhone,
}: {
	flow: ReturnType<typeof useBookingFlow>;
	profile: PublicBusinessProfile;
	askingPhone: boolean;
	onAskPhone: () => void;
}) {
	const { state } = flow;

	switch (state.step) {
		case 'service':
			return (
				<ServiceStep profile={profile} onSelectService={flow.selectService} />
			);

		case 'staff':
			return <StaffStep state={state} onSelectStaff={flow.selectStaff} />;

		case 'slot':
			return (
				<SlotStep
					profile={profile}
					state={state}
					onSelectDate={flow.selectDate}
					onSelectSlot={flow.selectSlot}
				/>
			);

		case 'confirm':
			return state.session ? (
				<ConfirmStep
					profile={profile}
					session={state.session}
					submitting={state.submitting}
					/*
					 * Con el diálogo del teléfono abierto no se ofrece confirmar: sería
					 * un botón detrás de un modal. Cerrado y sin número, `ConfirmStep`
					 * muestra el pedido con su propio botón para volver a abrirlo.
					 */
					askingPhone={askingPhone}
					onAskPhone={onAskPhone}
					onConfirm={flow.confirm}
				/>
			) : (
				<SignInStep />
			);

		case 'done':
			return <DoneStep profile={profile} state={state} />;
	}
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { account } from '@/content/account';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { cn } from '@/lib/utils';
import {
	formatDayChip,
	formatTime,
	toCalendarDate,
} from '@/features/booking/format';
import { formatWhen } from '../format';
import type { CustomerAppointmentDetail } from '@/services/customer/types';

type Slot = { startTime: string; endTime: string };

/**
 * Mover un turno de horario: elegir día, elegir hora, confirmar.
 *
 * **Es la misma cita y no una reserva nueva**, y toda la pantalla está escrita
 * para que eso se entienda: no se eligen servicios ni profesional porque no
 * cambian, y el texto de arriba lo dice antes de que nadie se lo pregunte. Quien
 * quiera otra cosa cancela y reserva, que es un camino distinto y ya existe.
 *
 * **No reusa el flujo de reserva**, aunque se le parezca. Ese flujo elige
 * servicios, resuelve profesionales y termina creando una cita; acá lo único
 * abierto es el horario, y hacerlo pasar por los cuatro pasos de aquel para
 * ignorar tres sería más código y más formas de terminar en otro lado.
 *
 * Todo lo que decide cuáles horarios hay está del otro lado: qué servicios se
 * buscan, con quién, y que la cita que se mueve no se bloquee a sí misma. Acá
 * sólo se piden por el id del turno. Ver `reschedulableSlots`.
 */
export function RescheduleScreen({
	appointment,
}: {
	appointment: CustomerAppointmentDetail;
}) {
	const router = useRouter();
	const timezone = appointment.business.timezone;

	const [days, setDays] = useState<string[] | null>(null);
	const [date, setDate] = useState<string | null>(null);
	/*
	 * Los horarios y el elegido viajan **con el día al que pertenecen**, y se
	 * leen comparando contra el día actual. Es lo que hace que cambiar de día los
	 * vacíe sin tener que vaciarlos a mano dentro de un efecto: una lista de otro
	 * día no es una lista vieja que haya que limpiar, es una que no corresponde.
	 */
	const [loaded, setLoaded] = useState<{ date: string; list: Slot[] } | null>(
		null,
	);
	const [picked, setPicked] = useState<{ date: string; startTime: string } | null>(
		null,
	);

	const slots = loaded && loaded.date === date ? loaded.list : null;
	const chosen = picked && picked.date === date ? picked.startTime : null;
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const base = `/api/customer/appointments/${encodeURIComponent(appointment.id)}`;

	/* Los días con lugar, una sola vez: no dependen de lo que se toque después. */
	useEffect(() => {
		let alive = true;

		void fetch(`${base}/days`)
			.then((r) => (r.ok ? (r.json() as Promise<string[]>) : []))
			.then((list) => {
				if (!alive) return;
				setDays(list);
				/*
				 * Abre en el día que el turno ya tiene si sigue estando, y si no en el
				 * primero con lugar: en los dos casos la pantalla llega con horarios a
				 * la vista en lugar de un calendario vacío esperando un toque.
				 */
				const own = toCalendarDate(new Date(appointment.startTime), timezone);
				setDate(list.includes(own) ? own : (list[0] ?? null));
			})
			.catch(() => alive && setDays([]));

		return () => {
			alive = false;
		};
	}, [base, appointment.startTime, timezone]);

	/* Los horarios del día elegido. Se vuelven a pedir con cada día. */
	useEffect(() => {
		if (!date) return;
		let alive = true;
		const asked = date;

		void fetch(`${base}/slots?date=${asked}`)
			.then((r) => (r.ok ? (r.json() as Promise<Slot[]>) : []))
			.then((list) => alive && setLoaded({ date: asked, list }))
			.catch(() => alive && setLoaded({ date: asked, list: [] }));

		return () => {
			alive = false;
		};
	}, [base, date]);

	const move = useCallback(async () => {
		if (!chosen) return;
		setPending(true);
		setError(null);

		try {
			const response = await fetch(`${base}/reschedule`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ startTime: chosen }),
			});

			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as {
					message?: string;
				} | null;
				setError(body?.message ?? account.appointment.reschedule.failed);
				setPending(false);

				/*
				 * El horario se ocupó entre que se listó y se confirmó, que es la
				 * carrera normal de una agenda compartida. Se vuelven a pedir los del
				 * día en lugar de dejar en pantalla una lista que ya mintió una vez.
				 */
				setPicked(null);
				const asked = date;
				if (asked) {
					void fetch(`${base}/slots?date=${asked}`)
						.then((r) => (r.ok ? (r.json() as Promise<Slot[]>) : []))
						.then((list) => setLoaded({ date: asked, list }))
						.catch(() => setLoaded({ date: asked, list: [] }));
				}
				return;
			}

			/*
			 * Al turno, que es de donde se vino y donde ahora está la hora nueva.
			 * `replace` y no `push`: volver atrás desde ahí tiene que llevar al
			 * historial, no a esta pantalla con un horario que ya se tomó.
			 */
			router.replace(`/historial/${appointment.id}`);
			router.refresh();
		} catch {
			setError(account.appointment.reschedule.failed);
			setPending(false);
		}
	}, [base, chosen, date, router, appointment.id]);

	return (
		<Container width="narrow" className="py-8 lg:py-12">
			<Link
				href={`/historial/${appointment.id}`}
				className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-ink-600 underline-offset-4 hover:underline"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					className="size-4"
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<path d="m15 18-6-6 6-6" />
				</svg>
				{account.appointment.reschedule.back}
			</Link>

			<h1 className="text-3xl font-semibold">
				{account.appointment.reschedule.title}
			</h1>

			<p className="mt-2 text-ink-600 first-letter:uppercase">
				{account.appointment.reschedule.current(
					formatWhen(appointment.startTime, timezone),
				)}
			</p>

			<p className="mt-4 rounded-2xl bg-paper-200 px-5 py-4 text-sm text-ink-700">
				{account.appointment.reschedule.keeps}
			</p>

			{days !== null && days.length === 0 ? (
				<p className="mt-8 text-ink-600">
					{account.appointment.reschedule.noDays}
				</p>
			) : (
				<>
					<section className="mt-8 space-y-3">
						<h2 className="font-semibold">
							{account.appointment.reschedule.pickDay}
						</h2>

						{/*
						 * Desplazamiento horizontal con los días. Hay negocios cuyos
						 * equipos no tienen rueda de mouse, así que esto se recorre con el
						 * dedo o arrastrando, nunca sólo con la rueda.
						 */}
						<ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
							{(days ?? []).map((day) => {
								const chip = formatDayChip(day, timezone);
								const active = day === date;

								return (
									<li key={day}>
										<button
											type="button"
											aria-pressed={active}
											onClick={() => setDate(day)}
											className={cn(
												'flex w-16 shrink-0 flex-col items-center rounded-2xl border px-2 py-3 transition-colors',
												active
													? 'border-ink-950 bg-ink-950 text-paper-50'
													: 'border-paper-300 hover:bg-paper-200',
											)}
										>
											<span className="text-xs">{chip.weekday}</span>
											<span className="text-lg font-semibold tabular-nums">
												{chip.day}
											</span>
											<span className="text-xs">{chip.month}</span>
										</button>
									</li>
								);
							})}
						</ul>
					</section>

					<section className="mt-6 space-y-3">
						<h2 className="font-semibold">
							{account.appointment.reschedule.pickTime}
						</h2>

						{slots === null ? (
							<p className="text-sm text-ink-500">
								{account.appointment.reschedule.loading}
							</p>
						) : slots.length === 0 ? (
							<p className="text-sm text-ink-500">
								{account.appointment.reschedule.noSlots}
							</p>
						) : (
							<ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
								{slots.map((slot) => {
									const active = slot.startTime === chosen;

									return (
										<li key={slot.startTime}>
											<button
												type="button"
												aria-pressed={active}
												onClick={() =>
													setPicked({
														date: date!,
														startTime: slot.startTime,
													})
												}
												className={cn(
													'w-full rounded-full border py-2.5 text-sm tabular-nums transition-colors',
													active
														? 'border-ink-950 bg-ink-950 text-paper-50'
														: 'border-paper-300 hover:bg-paper-200',
												)}
											>
												{formatTime(slot.startTime, timezone)}
											</button>
										</li>
									);
								})}
							</ul>
						)}
					</section>
				</>
			)}

			{error && <p className="mt-6 text-sm text-ink-950">{error}</p>}

			{chosen && (
				<Button
					size="lg"
					className="mt-8 w-full"
					disabled={pending}
					onClick={() => void move()}
				>
					{pending
						? account.appointment.reschedule.pending
						: account.appointment.reschedule.confirm(
								formatWhen(chosen, timezone),
							)}
				</Button>
			)}
		</Container>
	);
}

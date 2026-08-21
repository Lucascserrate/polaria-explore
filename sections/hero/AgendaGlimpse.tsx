'use client';

import { CalendarIcon, Check } from '@/components/ui/icons';
import { hero } from '@/content/hero';
import { cn } from '@/lib/utils';

const agenda = hero.agenda;

/**
 * La agenda del negocio, detrás del teléfono.
 *
 * Es la segunda mitad de la historia del hero: mientras el cliente toca
 * opciones en WhatsApp, el hueco elegido se llena solo del lado del dueño. Sin
 * esta pieza la demo muestra un chat; con ella muestra un producto.
 *
 * Decorativa a propósito (`aria-hidden`): lo que cuenta ya está en el copy y en
 * la etiqueta del teléfono, y un tablero anunciado celda por celda sería ruido.
 */
export function AgendaGlimpse({ booked }: { booked: boolean }) {
	const scheduled = agenda.rows.reduce(
		(total, row) =>
			total +
			row.cells.filter(
				(label, column) => label && (row.books !== column || booked),
			).length,
		0,
	);

	return (
		<div aria-hidden="true" className="w-124 select-none">
			<div
				className={cn(
					'overflow-hidden rounded-2xl bg-white/85 backdrop-blur-sm',
					'ring-1 ring-inset ring-ink-900/8',
					'shadow-[0_1px_2px_rgb(6_8_15/0.04),0_24px_60px_-30px_rgb(6_8_15/0.28)]',
				)}
			>
				<header className="flex items-center gap-3 border-b border-paper-300 px-4 py-3">
					<span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
						<CalendarIcon className="size-4" />
					</span>

					<div className="min-w-0">
						<p className="text-sm font-semibold leading-tight text-ink-900">
							{agenda.title}
						</p>
						<p className="text-xs leading-tight text-ink-500">{agenda.hint}</p>
					</div>

					{/* El contador va pegado al título, no al borde derecho: ahí lo tapa
              el teléfono, y es justo el dato que cambia cuando entra la cita. */}
					<span
						className={cn(
							'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-500',
							booked
								? 'bg-confirm-50 text-confirm-700'
								: 'bg-paper-200 text-ink-500',
						)}
					>
						<Check className="size-3.5" />
						<span className="font-mono tabular-nums">{scheduled}</span>{' '}
						{agenda.countLabel}
					</span>
				</header>

				<div className="px-4 pb-4 pt-2.5">
					{/* Una columna por profesional: cada uno con su propia agenda. */}
					<div className="grid grid-cols-[2.75rem_repeat(3,minmax(0,1fr))] items-center gap-2 pb-2">
						<span />
						{agenda.columns.map((name) => (
							<span
								key={name}
								className="flex items-center gap-1.5 text-xs font-medium text-ink-700"
							>
								<span className="grid size-5 shrink-0 place-items-center rounded-full bg-paper-200 text-[0.625rem] font-semibold text-ink-600">
									{name.charAt(0)}
								</span>
								<span className="truncate">{name}</span>
							</span>
						))}
					</div>

					<div className="flex flex-col gap-1.5">
						{agenda.rows.map((row) => (
							<div
								key={row.time}
								className="grid grid-cols-[2.75rem_repeat(3,minmax(0,1fr))] items-center gap-2"
							>
								<span className="font-mono text-[0.6875rem] tabular-nums text-ink-500">
									{row.time}
								</span>

								{row.cells.map((label, column) => {
									const isBooking = row.books === column;

									// El hueco que reserva la conversación se ve libre hasta que
									// el teléfono confirma.
									if (!label || (isBooking && !booked)) {
										return <Slot key={column} />;
									}

									return (
										<Appointment key={column} label={label} fresh={isBooking} />
									);
								})}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Fuera de la tarjeta: el teléfono se apoya sobre su borde derecho y
          acá le cortaría la frase al medio. */}
			<p className="mt-3 max-w-76 text-pretty text-xs leading-relaxed text-ink-500">
				{agenda.footnote}
			</p>
		</div>
	);
}

/** Hueco libre. */
function Slot() {
	return (
		<span className="h-7 rounded-md border border-dashed border-paper-400/70 bg-paper-100/60" />
	);
}

function Appointment({ label, fresh }: { label: string; fresh: boolean }) {
	return (
		<span
			className={cn(
				'flex h-7 items-center gap-1.5 rounded-md px-2 text-[0.6875rem] font-medium',
				fresh
					? 'bg-brand-600 text-white shadow-[0_4px_14px_-6px_rgb(11_80_232/0.8)] motion-safe:animate-slot-fill'
					: 'bg-paper-200 text-ink-700 ring-1 ring-inset ring-paper-300',
			)}
		>
			<span className="truncate">{label}</span>
		</span>
	);
}

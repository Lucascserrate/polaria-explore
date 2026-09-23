'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { booking } from '@/content/booking';
import { formatDuration, formatPrice, formatServicePrice } from '../format';
import type { BookingFlowState } from '../useBookingFlow';

/**
 * El desglose del precio: la hoja que se abre desde la barra de abajo.
 *
 * **La barra dice cuánto sale; esto dice de qué está hecho.** Con tres servicios
 * marcados, el total de la barra es un número que no se puede revisar: no hay
 * forma de ver qué entró en él sin volver a recorrer la lista buscando cuáles
 * quedaron tildados. En escritorio eso ya estaba resuelto por la columna de la
 * derecha (`BookingSummary`), que en el teléfono no existe —ahí ocuparía media
 * pantalla del paso, que es lo que hay que tocar—. Esta hoja es esa columna, a
 * pedido.
 *
 * **Se mira, no se edita.** No hay una cruz para sacar un servicio: quitar algo
 * es tocar su fila en la lista de atrás, que es donde se lo agregó, y una
 * segunda forma de hacerlo dejaría dos lugares que pueden discrepar sobre qué
 * está elegido. Lo que sí lleva es "Continuar", porque después de revisar lo que
 * hay, seguir es lo único que queda por hacer: cerrar la hoja para apretar el
 * mismo botón que estaba debajo sería un toque de peaje.
 *
 * Pegada al borde inferior en el teléfono y centrada en escritorio, igual que
 * `StaffPickerDialog` y `PhoneDialog`.
 */
export function BookingBreakdown({
	state,
	disabled,
	onContinue,
	onClose,
}: {
	state: BookingFlowState;
	/** El mismo que el de la barra: si no se puede seguir, acá tampoco. */
	disabled: boolean;
	onContinue: () => void;
	onClose: () => void;
}) {
	const { services, durationMinutes, totalPrice } = state;

	/** Escape cierra, y el fondo no se desplaza mientras esto está abierto. */
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', onKeyDown);
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previous;
		};
	}, [onClose]);

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="titulo-desglose"
			/*
			 * Tocar afuera cierra. Es lo que se espera de una hoja que se levantó
			 * desde el borde, y acá no se pierde nada al cerrarla: no hay nada a medio
			 * completar adentro.
			 */
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 sm:items-center sm:p-6"
		>
			{/*
			 * `dvh` y no `vh` para el alto máximo: en Safari de iOS, `100vh` cuenta la
			 * barra de direcciones que después se retrae, así que la hoja nace más
			 * alta que la pantalla y el último servicio queda debajo del borde.
			 */}
			<div className="flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-3xl bg-paper-50 sm:rounded-3xl">
				<div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
					<h2 id="titulo-desglose" className="text-2xl font-semibold">
						{booking.flow.breakdown.title}
					</h2>

					<button
						type="button"
						onClick={onClose}
						aria-label={booking.flow.close}
						className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-paper-200"
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
					</button>
				</div>

				{/*
				 * La lista se desplaza dentro de la hoja y el total se queda abajo,
				 * fuera del scroll: con cinco servicios, el número que se vino a ver
				 * quedaría debajo del borde.
				 *
				 * `overscroll-contain` para que llegar al final de la lista no empiece a
				 * mover la página de atrás.
				 */}
				<div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-6 pb-2">
					{services.map((service) => (
						<div
							key={service.id}
							className="flex items-start justify-between gap-4"
						>
							<div className="min-w-0">
								<p className="font-medium">{service.name}</p>
								<p className="text-sm text-ink-500">
									{formatDuration(service.durationMinutes)}
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
				</div>

				<div className="space-y-4 border-t border-paper-300 px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
					{/*
					 * La duración total sólo con dos o más servicios: con uno ya está
					 * escrita en su propia fila, y repetirla abajo sería decir el mismo
					 * número dos veces. Misma regla que `BookingSummary`.
					 */}
					{services.length > 1 && (
						<div className="flex items-center justify-between gap-4 text-sm text-ink-600">
							<p>{booking.flow.summary.duration}</p>
							<p className="tabular-nums">{formatDuration(durationMinutes)}</p>
						</div>
					)}

					<div className="flex items-center justify-between gap-4">
						<p className="font-medium">{booking.flow.summary.total}</p>
						<p
							className={
								totalPrice === null || !services[0]
									? 'text-sm text-ink-500'
									: 'font-semibold tabular-nums'
							}
						>
							{totalPrice === null || !services[0]
								? booking.flow.summary.quotedTotal
								: formatPrice(totalPrice, services[0].currency)}
						</p>
					</div>

					<Button
						size="lg"
						className="w-full"
						disabled={disabled}
						onClick={() => {
							onClose();
							onContinue();
						}}
					>
						{booking.flow.bar.continue}
					</Button>
				</div>
			</div>
		</div>
	);
}

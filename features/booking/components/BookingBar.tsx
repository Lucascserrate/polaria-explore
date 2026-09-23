'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import { formatDuration, formatPrice } from '../format';
import type { BookingFlowState } from '../useBookingFlow';
import { BookingBreakdown } from './BookingBreakdown';
import { Chevron } from './Chevron';

/**
 * La barra fija de abajo: lo que se lleva, y el botón para seguir.
 *
 * **Existe por el paso de servicios, no por estética.** Desde que se pueden
 * marcar varios, tocar una fila dejó de avanzar; sin un botón visible, la
 * pantalla se quedaría esperando algo que nadie sabe que tiene que hacer. Y el
 * botón es, de paso, la única señal de que se puede marcar más de uno: si la
 * primera fila avanzara sola, nadie descubriría que puede sumarle la barba al
 * corte.
 *
 * Muestra el total y la duración porque son las dos cosas que cambian al agregar
 * algo, y las dos que alguien quiere saber antes de seguir: cuánto sale y cuánto
 * se va a quedar.
 *
 * **Sólo en los pasos que no avanzan solos.** En el de profesional y en el de
 * horario se avanza tocando una opción, así que un "Continuar" ahí sería un
 * segundo toque para lo mismo —la misma razón por la que nunca hubo uno—. La
 * excepción es el paso de repartir, donde se completan varios selectores y el
 * último no significa "listo".
 *
 * Va fija abajo en el teléfono y en el flujo del escritorio también: la lista de
 * servicios de un negocio con veinte filas no entra en pantalla, y un botón al
 * final obligaría a recorrerla entera para seguir.
 *
 * **El lado izquierdo abre el desglose** (`BookingBreakdown`). El total es la
 * suma de lo que se fue marcando varias pantallas arriba, y en el teléfono no
 * había dónde revisarlo: la columna que lo detalla en escritorio
 * (`BookingSummary`) ahí no se dibuja. Abre el resumen y no "Continuar" porque
 * el botón es lo único que no se puede tocar por accidente en una barra pegada
 * al pulgar.
 */
export function BookingBar({
	state,
	disabled,
	onContinue,
}: {
	state: BookingFlowState;
	/** Sin nada elegido no se puede seguir, y el texto dice qué falta. */
	disabled: boolean;
	onContinue: () => void;
}) {
	const { services, durationMinutes, totalPrice } = state;
	const currency = services[0]?.currency;

	const [open, setOpen] = useState(false);

	/*
	 * Sin nada marcado no hay desglose: el lado izquierdo dice qué falta y no
	 * abre nada. Un botón que abre una hoja vacía es peor que un texto.
	 */
	const hasBreakdown = services.length > 0;

	const summary = (
		<>
			{/*
			 * El importe arriba y el detalle abajo, que es el orden en que se leen:
			 * lo primero que se mira de un carrito es cuánto sale.
			 *
			 * Con algún servicio que se cotiza no hay total —ver `totalPrice`— y en
			 * su lugar va la frase, no una suma parcial que se leería como el precio
			 * final.
			 */}
			<span className="block truncate font-semibold tabular-nums">
				{services.length === 0
					? booking.flow.bar.empty
					: totalPrice === null || !currency
						? booking.flow.summary.quotedTotal
						: formatPrice(totalPrice, currency)}
			</span>

			{hasBreakdown && (
				<span className="flex items-center gap-1 truncate text-sm text-ink-600">
					{booking.flow.bar.summary(
						services.length,
						formatDuration(durationMinutes),
					)}
					{/*
					 * La flecha hacia arriba es toda la señal de que esto se abre. Un
					 * "Ver detalle" escrito sería una tercera línea de texto en una barra
					 * de dos, al lado de un botón que dice lo que hay que hacer.
					 */}
					<Chevron className="size-4 shrink-0 -rotate-90" />
				</span>
			)}
		</>
	);

	return (
		<>
			<div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-300 bg-paper-50/95 backdrop-blur">
				<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
					{hasBreakdown ? (
						<button
							type="button"
							onClick={() => setOpen(true)}
							aria-haspopup="dialog"
							aria-expanded={open}
							className={cn(
								'-mx-2 min-w-0 rounded-2xl px-2 py-1 text-left',
								'transition-colors hover:bg-paper-200 active:bg-paper-300',
							)}
						>
							{summary}
							{/*
							 * Con el `aria-label` el nombre del botón pasaba a ser "Ver el
							 * desglose" a secas y se perdía el importe, que es lo que un
							 * lector de pantalla tiene que leer primero acá. Así se leen las
							 * dos cosas, en ese orden.
							 */}
							<span className="sr-only">{booking.flow.breakdown.open}</span>
						</button>
					) : (
						<div className="min-w-0">{summary}</div>
					)}

					<Button
						size="lg"
						className="shrink-0"
						disabled={disabled}
						onClick={onContinue}
					>
						{booking.flow.bar.continue}
					</Button>
				</div>
			</div>

			{open && (
				<BookingBreakdown
					state={state}
					disabled={disabled}
					onContinue={onContinue}
					onClose={() => setOpen(false)}
				/>
			)}
		</>
	);
}

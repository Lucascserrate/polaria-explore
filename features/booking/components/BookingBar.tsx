'use client';

import { Button } from '@/components/ui/button';
import { booking } from '@/content/booking';
import { formatDuration, formatPrice } from '../format';
import type { BookingFlowState } from '../useBookingFlow';

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

	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper-300 bg-paper-50/95 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
				<div className="min-w-0">
					{/*
					 * El importe arriba y el detalle abajo, que es el orden en que se
					 * leen: lo primero que se mira de un carrito es cuánto sale.
					 *
					 * Con algún servicio que se cotiza no hay total —ver `totalPrice`— y
					 * en su lugar va la frase, no una suma parcial que se leería como el
					 * precio final.
					 */}
					<p className="truncate font-semibold tabular-nums">
						{services.length === 0
							? booking.flow.bar.empty
							: totalPrice === null || !currency
								? booking.flow.summary.quotedTotal
								: formatPrice(totalPrice, currency)}
					</p>

					{services.length > 0 && (
						<p className="truncate text-sm text-ink-600">
							{booking.flow.bar.summary(
								services.length,
								formatDuration(durationMinutes),
							)}
						</p>
					)}
				</div>

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
	);
}

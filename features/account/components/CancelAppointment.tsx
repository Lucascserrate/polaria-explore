'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarX } from 'lucide-react';
import { account } from '@/content/account';
import { Button } from '@/components/ui/button';
import { ActionItemContent, actionItemClasses } from './ActionItem';

/**
 * Cancelar el turno, en dos toques.
 *
 * **Dos toques y no un diálogo**: lo que hace falta acá no es una ventana que
 * robe el foco sino decir qué pasa si se cancela, y eso entra en el lugar donde
 * estaba el botón. Un diálogo además necesita JavaScript para existir; esto sólo
 * lo necesita para el segundo toque, que es cuando ya hubo una decisión.
 *
 * **La confirmación dice qué pasa, no pregunta si se está seguro.** "¿Estás
 * seguro?" no agrega información: quien llegó hasta acá ya lo está. Lo que no
 * sabe es que el horario se libera y que puede no volver a encontrarlo.
 *
 * El error de la API se muestra **tal cual**. Los dos que llegan están escritos
 * para el cliente final y dicen cosas distintas —un turno que ya empezó no es
 * un turno que no existe—, así que traducirlos acá sería escribir una segunda
 * versión del mismo problema y perder la que sabe cuál de los dos fue.
 */
export function CancelAppointment({ appointmentId }: { appointmentId: string }) {
	const router = useRouter();
	const [asking, setAsking] = useState(false);
	const [pending, setPending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const cancel = async () => {
		setPending(true);
		setError(null);

		try {
			const response = await fetch(
				`/api/customer/appointments/${encodeURIComponent(appointmentId)}/cancel`,
				{ method: 'POST' },
			);

			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as {
					message?: string;
				} | null;
				setError(body?.message ?? account.appointment.cancel.failed);
				setPending(false);
				return;
			}

			/*
			 * `refresh` y no un estado local: la pantalla la dibuja el servidor y el
			 * turno cambió de lista —sale de "Próximas" y entra al historial—, así
			 * que pintar sólo el estado acá dejaría la lista de al lado mintiendo.
			 *
			 * No se apaga `pending`: la pantalla se va a redibujar, y volver a
			 * encender el botón un instante antes invita a un segundo toque.
			 */
			setAsking(false);
			router.refresh();
		} catch {
			setError(account.appointment.cancel.failed);
			setPending(false);
		}
	};

	if (!asking) {
		return (
			<div className="space-y-2">
				<button
					type="button"
					className={actionItemClasses}
					onClick={() => setAsking(true)}
				>
					<ActionItemContent icon={CalendarX}>
						{account.appointment.cancel.action}
					</ActionItemContent>
				</button>

				{error && <p className="text-sm text-ink-600">{error}</p>}
			</div>
		);
	}

	return (
		<div className="space-y-3 rounded-2xl px-5 py-5 ring-1 ring-paper-300 ring-inset">
			<p className="font-medium">{account.appointment.cancel.question}</p>
			<p className="text-sm text-ink-600">
				{account.appointment.cancel.warning}
			</p>

			{error && <p className="text-sm text-ink-950">{error}</p>}

			<div className="flex flex-wrap gap-2">
				<Button disabled={pending} onClick={() => void cancel()}>
					{pending
						? account.appointment.cancel.pending
						: account.appointment.cancel.confirm}
				</Button>

				<Button
					variant="secondary"
					disabled={pending}
					onClick={() => {
						setAsking(false);
						setError(null);
					}}
				>
					{account.appointment.cancel.dismiss}
				</Button>
			</div>
		</div>
	);
}

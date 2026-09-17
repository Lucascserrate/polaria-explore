'use client';

import { booking } from '@/content/booking';
import { Button } from '@/components/ui/button';

/**
 * El atajo de Google, debajo del formulario.
 *
 * Era un paso obligatorio —sin cuenta no se podía reservar— y ahora es una
 * comodidad. El cambio no es estético: cada cuenta que alguien no quiere crear,
 * y cada vez que el login de Google falla, era un cliente que se iba.
 *
 * El `returnTo` es la dirección actual **con sus parámetros**, que es lo que
 * hace que al volver el flujo siga en el mismo paso, con el servicio, el
 * profesional y el horario ya elegidos.
 */
export function GoogleShortcut() {
	const returnTo =
		typeof window === 'undefined'
			? '/'
			: `${window.location.pathname}${window.location.search}`;

	return (
		<div className="space-y-3">
			{/* Una línea con la palabra en el medio: separa sin encabezar. */}
			<div className="flex items-center gap-3">
				<span className="h-px flex-1 bg-paper-300" />
				<span className="text-sm text-ink-500">{booking.flow.identity.or}</span>
				<span className="h-px flex-1 bg-paper-300" />
			</div>

			<Button
				size="lg"
				variant="secondary"
				className="w-full"
				href={`/api/customer/login?returnTo=${encodeURIComponent(returnTo)}`}
			>
				{booking.flow.identity.google}
			</Button>

			<p className="text-sm text-ink-500">{booking.flow.identity.why}</p>
		</div>
	);
}

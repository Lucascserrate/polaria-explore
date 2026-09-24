import { cn } from '@/lib/utils';
import { statusLabel } from '../format';
import type { CustomerAppointmentStatus } from '@/services/customer/types';

/**
 * En qué quedó el turno, en una píldora.
 *
 * **El único que se destaca es el cancelado**, y no por decoración: en una
 * lista donde casi todo está confirmado, marcar los cuatro estados haría que el
 * que importa se pierda entre los demás. El resto se distingue por el texto, que
 * es lo que se lee.
 *
 * El contraste no viaja solo: la palabra dice lo mismo que el fondo, así que
 * quien no distingue colores lee exactamente la misma información.
 */
export function StatusChip({ status }: { status: CustomerAppointmentStatus }) {
	return (
		<span
			className={cn(
				'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
				status === 'cancelled'
					? 'bg-ink-950 text-paper-50'
					: 'bg-paper-200 text-ink-700',
			)}
		>
			{statusLabel(status)}
		</span>
	);
}

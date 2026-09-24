import { cn } from '@/lib/utils';
import { statusLabel } from '../format';
import type { CustomerAppointmentStatus } from '@/services/customer/types';

/**
 * El color de cada estado, en el orden en que un turno los recorre.
 *
 * Son los colores de producto y no de marca —ver `globals.css`—, y cada uno
 * dice lo que ya dice en el resto de la interfaz: ámbar es "falta algo",
 * verde es "está firme", azul es "ya pasó" y rojo es "no va a pasar". El fondo
 * es claro y el texto oscuro del mismo tono, así que la píldora se lee como un
 * rótulo y no compite con el negro de los botones.
 */
const tones: Record<CustomerAppointmentStatus, string> = {
	pending: 'bg-attention-50 text-attention-700',
	confirmed: 'bg-confirm-50 text-confirm-700',
	completed: 'bg-accent-50 text-accent-700',
	cancelled: 'bg-danger-50 text-danger-700',
};

/**
 * En qué quedó el turno, en una píldora.
 *
 * **Cada estado con su color**, para que una lista larga se recorra de un
 * vistazo: lo que viene, lo que ya pasó y lo que se cayó se separan antes de
 * leer una palabra.
 *
 * El color no viaja solo: la palabra dice lo mismo que el fondo, así que quien
 * no distingue colores lee exactamente la misma información.
 */
export function StatusChip({ status }: { status: CustomerAppointmentStatus }) {
	return (
		<span
			className={cn(
				'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
				tones[status],
			)}
		>
			{statusLabel(status)}
		</span>
	);
}

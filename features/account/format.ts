import { account } from '@/content/account';
import {
	formatLongDate,
	formatTime,
	toCalendarDate,
} from '@/features/booking/format';
import type { CustomerAppointmentStatus } from '@/services/customer/types';

/**
 * Cómo se escribe un turno del historial.
 *
 * Los números y las fechas los sigue resolviendo `features/booking/format`: es
 * el mismo sitio y la misma zona horaria —la **del negocio**, nunca la del
 * navegador—, y dos configuraciones de `Intl` terminarían escribiendo la misma
 * fecha de dos maneras según desde qué pantalla se la mire. Acá sólo está lo
 * que la reserva no necesitaba.
 */

/**
 * El encabezado del turno: "Hoy a las 14:00", "Mañana a las 14:00" o la fecha
 * larga.
 *
 * "Hoy" y "mañana" se calculan **en la zona del negocio** y no en la del
 * navegador, por la misma razón que la hora: quien abre el enlace desde otro
 * país tiene que leer el mismo día que quien lo abre desde la cuadra de al
 * lado. Con la zona del dispositivo, un turno de mañana a las 09:00 en La Paz
 * se leería "Hoy" para alguien que lo mira desde Madrid.
 */
export function formatWhen(
	iso: string,
	timeZone: string,
	now: Date = new Date(),
): string {
	const time = formatTime(iso, timeZone);
	const day = formatDay(iso, timeZone, now);

	switch (day.kind) {
		case 'today':
			return account.appointment.when.today(time);
		case 'tomorrow':
			return account.appointment.when.tomorrow(time);
		default:
			return account.appointment.when.onDay(day.label, time);
	}
}

/**
 * Sólo el día: "Hoy", "Mañana" o "viernes 25 de septiembre".
 *
 * Aparte del encabezado porque la tarjeta de la lista pone el día y la hora en
 * columnas separadas, y partir la frase del encabezado para volver a componerla
 * sería trabajar en contra de `Intl`. El `kind` viaja para que quien lo use
 * pueda decidir sin volver a comparar fechas.
 */
export function formatDay(
	iso: string,
	timeZone: string,
	now: Date = new Date(),
): { kind: 'today' | 'tomorrow' | 'other'; label: string } {
	const day = toCalendarDate(new Date(iso), timeZone);
	const today = toCalendarDate(now, timeZone);
	const tomorrow = toCalendarDate(
		new Date(now.getTime() + 24 * 60 * 60 * 1000),
		timeZone,
	);

	if (day === today) return { kind: 'today', label: account.day.today };
	if (day === tomorrow) {
		return { kind: 'tomorrow', label: account.day.tomorrow };
	}

	return { kind: 'other', label: formatLongDate(iso, timeZone) };
}

/** Cómo se llama cada estado para quien reservó. */
export function statusLabel(status: CustomerAppointmentStatus): string {
	return account.appointment.status[status];
}

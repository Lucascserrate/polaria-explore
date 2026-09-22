'use client';

import { booking } from '@/content/booking';
import { formatLongDate, formatTime } from '../format';
import type { CustomerAppointment } from '@/services/customer/types';
import type { PublicBusinessProfile } from '@/services/booking/types';

/**
 * "Ya tenés un turno acá": el contexto que le falta a alguien que está por sacar
 * otro sin acordarse del primero.
 *
 * Es el equivalente de lo que WhatsApp hace al recibir a un cliente con turno
 * —nombrarlo en lugar de volver a presentarse— y sale de la misma definición de
 * turno vigente, que la decide el backend. Ver `CustomerAppointment`.
 *
 * **Avisa y no interrumpe**, y ésa es la decisión. Un segundo turno es legítimo
 * —un mes después, para otra persona de la casa— así que esto no es una puerta
 * con dos botones sino una tarjeta que se lee de paso: el flujo sigue abajo,
 * igual que si no estuviera. Lo que evita es la reserva repetida por olvido, que
 * es un problema de memoria y se arregla mostrando el turno.
 *
 * **Sólo aparece con sesión iniciada.** Sin cuenta no hay forma honesta de saber
 * quién está mirando —un teléfono es un identificador, no una credencial— y
 * pedir que inicie sesión para avisarle algo sería cobrarle a todo el mundo el
 * peaje que se sacó del flujo a propósito.
 *
 * **No lleva botón.** El detalle del turno es lo que un "Ver mi turno" iría a
 * mostrar, y está acá; el día que exista la pantalla de turnos de la cuenta,
 * este título es el enlace natural hacia ella.
 */
export function ExistingAppointments({
	profile,
	appointments,
}: {
	profile: PublicBusinessProfile;
	/** Los turnos vigentes de la cuenta **con este negocio**, ya filtrados. */
	appointments: CustomerAppointment[];
}) {
	if (appointments.length === 0) return null;

	return (
		<section
			aria-label={booking.flow.existing.label}
			className="space-y-3 rounded-2xl bg-paper-200 px-5 py-4"
		>
			<h2 className="font-medium">
				{booking.flow.existing.title(profile.name, appointments.length)}
			</h2>

			{/*
			 * Se listan todos y no sólo el más próximo: quien tiene dos turnos
			 * seguidos y ve uno solo sigue sin saber si el que recuerda es ése. Son
			 * dos o tres líneas; el backend ya los devuelve ordenados de más cerca a
			 * más lejos.
			 */}
			<ul className="space-y-3">
				{appointments.map((appointment) => (
					<li key={appointment.id} className="space-y-0.5">
						<p className="font-medium">{appointment.serviceName}</p>
						{/*
						 * La hora en la zona del negocio, como en todo el resto de la
						 * página: es la hora a la que hay que estar ahí, aunque el turno se
						 * mire desde otro país.
						 */}
						<p className="text-ink-700 first-letter:uppercase">
							{formatLongDate(appointment.startTime, profile.timezone)} ·{' '}
							<span className="tabular-nums">
								{formatTime(appointment.startTime, profile.timezone)}
							</span>
						</p>
						{appointment.staffName && (
							<p className="text-sm text-ink-500">
								{booking.flow.summary.with(appointment.staffName)}
							</p>
						)}
					</li>
				))}
			</ul>

			<p className="text-sm text-ink-600">{booking.flow.existing.hint}</p>
		</section>
	);
}

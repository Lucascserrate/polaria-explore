'use client';

import { booking } from '@/content/booking';
import { Button } from '@/components/ui/button';
import type { PublicBusinessProfile } from '@/services/booking/types';
import type { CustomerSession } from '@/services/customer/types';
import GuestForm from './GuestForm';

/**
 * El último paso: quién reserva, y confirmar.
 *
 * Dos caras del mismo paso según haya cuenta o no. Con cuenta es leer y apretar
 * un botón; sin cuenta es escribir el nombre y el WhatsApp, con el atajo de
 * Google debajo. Nunca es una pared: antes, sin cuenta esto mostraba un login y
 * ahí terminaba el camino para quien no quería una o para quien Google rechazó.
 */
export function ConfirmStep({
	profile,
	session,
	submitting,
	askingPhone,
	onAskPhone,
	onConfirm,
}: {
	profile: PublicBusinessProfile;
	/** `null` cuando reserva sin cuenta, que es el camino corto. */
	session: CustomerSession | null;
	submitting: boolean;
	/** El diálogo del teléfono está abierto encima de esta pantalla. */
	askingPhone: boolean;
	onAskPhone: () => void;
	onConfirm: (identity?: { name: string; phone: string }) => void;
}) {
	if (!session) {
		return (
			<GuestForm
				profile={profile}
				submitting={submitting}
				onConfirm={onConfirm}
			/>
		);
	}

	/*
	 * Con cuenta sin teléfono no se puede reservar, y quien cerró el diálogo tiene
	 * que poder volver a abrirlo desde acá. Mientras está abierto no se dibuja
	 * nada: un botón detrás de un modal es un botón que nadie puede apretar.
	 */
	if (!session.phone) {
		return askingPhone ? null : (
			<div className="max-w-lg space-y-4">
				<p className="text-ink-600">{booking.flow.phoneStep.missing}</p>
				<Button size="lg" className="w-full" onClick={onAskPhone}>
					{booking.flow.phoneStep.title}
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-lg space-y-5">
			{/*
			 * Los datos se muestran completos y no detrás de un "usar mi cuenta": el
			 * número es por donde llega el recordatorio, así que quien lo cambió tiene
			 * que poder verlo antes de confirmar y no cuando no le llega nada.
			 */}
			<div className="space-y-1 rounded-2xl bg-paper-200 px-5 py-4">
				<p className="text-sm text-ink-600">{booking.flow.details.bookingAs}</p>
				<p className="font-medium">{session.name}</p>
				<p className="text-ink-700 tabular-nums">
					{formatPhone(session.phone, profile.dialCode)}
				</p>
			</div>

			<Button
				size="lg"
				className="w-full"
				disabled={submitting}
				onClick={() => onConfirm()}
			>
				{submitting
					? booking.flow.details.submitting
					: booking.flow.details.submit}
			</Button>
		</div>
	);
}

/**
 * El teléfono guardado, en la forma en que la persona lo escribió.
 *
 * La cuenta lo guarda como lo guarda WhatsApp —dígitos con código de país y sin
 * `+`, `59170011223`— y eso no se le muestra así a nadie. Se le devuelve el `+`
 * y se separa el prefijo del negocio cuando coincide; si el número es de otro
 * país se muestra completo, que es más honesto que partirlo por un prefijo que
 * no es el suyo.
 */
function formatPhone(phone: string, dialCode: string): string {
	return phone.startsWith(dialCode)
		? `+${dialCode} ${phone.slice(dialCode.length)}`
		: `+${phone}`;
}

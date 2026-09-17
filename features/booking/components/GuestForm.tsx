'use client';

import { useState } from 'react';
import { booking } from '@/content/booking';
import { Button } from '@/components/ui/button';
import type { PublicBusinessProfile } from '@/services/booking/types';
import { GoogleShortcut } from './GoogleShortcut';

/**
 * Reservar sin cuenta: el nombre y el WhatsApp, y listo.
 *
 * El backend acepta este camino desde siempre —`customerName` y `customerPhone`
 * en el cuerpo— y esta pantalla había dejado de ofrecerlo. Lo que llega acá
 * queda como cliente del negocio igual que quien escribe por WhatsApp: el
 * teléfono lo normaliza el servidor, así que las dos puertas terminan en la
 * misma ficha y no en dos historiales partidos.
 *
 * Lo que no da es "mis reservas" en Polaria: eso necesita una cuenta, y es
 * exactamente lo que ofrece el atajo de abajo.
 */
const GuestForm = ({
	profile,
	submitting,
	onConfirm,
}: {
	profile: PublicBusinessProfile;
	submitting: boolean;
	onConfirm: (identity: { name: string; phone: string }) => void;
}) => {
	const [name, setName] = useState('');
	const [phone, setPhone] = useState('');

	const canSubmit = Boolean(name.trim() && phone.trim()) && !submitting;

	return (
		<div className="max-w-lg space-y-6">
			<form
				className="space-y-4"
				onSubmit={(event) => {
					event.preventDefault();
					if (canSubmit) onConfirm({ name, phone });
				}}
			>
				<div className="space-y-1.5">
					<label
						htmlFor="guest-name"
						className="block text-sm font-medium text-ink-700"
					>
						{booking.flow.details.name}
					</label>
					<input
						id="guest-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder={booking.flow.details.namePlaceholder}
						autoComplete="name"
						maxLength={120}
						className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 outline-none focus:border-ink-400"
					/>
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="guest-phone"
						className="block text-sm font-medium text-ink-700"
					>
						{booking.flow.details.phone}
					</label>

					<div className="flex items-stretch gap-2">
						{/*
						 * El prefijo se muestra y no se escribe: es el del país del
						 * negocio. Quien tenga un número de otro país lo escribe completo
						 * con `+` y el backend lo respeta, que es el único que normaliza
						 * teléfonos en Polaria. Mismo trato que en `PhoneDialog`.
						 */}
						<span className="flex shrink-0 items-center rounded-xl bg-paper-200 px-3 text-sm text-ink-600 tabular-nums">
							+{profile.dialCode}
						</span>

						<input
							id="guest-phone"
							value={phone}
							onChange={(event) => setPhone(event.target.value)}
							placeholder={booking.flow.details.phonePlaceholder}
							inputMode="tel"
							autoComplete="tel"
							maxLength={32}
							className="w-full rounded-xl border border-paper-300 bg-paper-50 px-4 py-3 tabular-nums outline-none focus:border-ink-400"
						/>
					</div>

					<p className="text-sm text-ink-500">
						{booking.flow.details.phoneHint}
					</p>
				</div>

				{/*
				 * `submit` y no `onClick`: en el teléfono el botón "listo" del teclado
				 * confirma, que es un toque menos y el gesto que la gente ya conoce.
				 */}
				<Button
					type="submit"
					size="lg"
					className="w-full"
					disabled={!canSubmit}
				>
					{submitting
						? booking.flow.details.submitting
						: booking.flow.details.submit}
				</Button>
			</form>

			<GoogleShortcut />
		</div>
	);
};

export default GuestForm;

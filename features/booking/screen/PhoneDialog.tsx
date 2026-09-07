'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import { saveCustomerPhone } from '@/services/customer/phone';
import type { CustomerSession } from '@/services/customer/types';
import type { PublicBusinessProfile } from '@/services/booking/types';

/**
 * "Añadir teléfono": lo único que Google no entrega.
 *
 * Es un diálogo y no un paso del flujo, y ésa es la diferencia con la versión
 * anterior. Aparece **apenas se vuelve del login**, en el paso en el que la
 * persona estaba, porque pertenece a completar la cuenta y no a elegir un
 * turno: quien ya lo dio una vez no lo vuelve a ver nunca, ni acá ni en otro
 * negocio de Polaria.
 *
 * Se puede cerrar. No es una concesión: obligar con un diálogo sin salida deja
 * a alguien encerrado si se arrepiente, y el paso de confirmar igual va a pedir
 * el número —con un botón para volver a abrir esto— porque sin él no hay a
 * dónde mandar el recordatorio.
 */
export function PhoneDialog({
	profile,
	onSaved,
	onClose,
}: {
	profile: PublicBusinessProfile;
	onSaved: (session: CustomerSession) => void;
	onClose: () => void;
}) {
	const [phone, setPhone] = useState('');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	/** Escape cierra, y el fondo no se desplaza mientras esto está abierto. */
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', onKeyDown);
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previous;
		};
	}, [onClose]);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!phone.trim() || saving) return;

		setSaving(true);
		setError(null);

		try {
			onSaved(
				await saveCustomerPhone({
					phone: phone.trim(),
					timezone: profile.timezone,
				}),
			);
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: 'No pudimos guardar el número. Probá de nuevo.',
			);
			setSaving(false);
		}
	};

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-labelledby="titulo-telefono"
			className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 p-0 sm:items-center sm:p-6"
		>
			{/*
			 * Pegado al borde inferior en el teléfono y centrado en escritorio: es
			 * donde llega el pulgar y donde está la mirada, respectivamente.
			 */}
			{/*
			 * `env(safe-area-inset-bottom)` en el teléfono: pegada al borde inferior,
			 * la hoja termina debajo de la barra de gestos de iOS y Android, y el
			 * botón queda a un milímetro de un gesto del sistema.
			 */}
			<div className="w-full max-w-md rounded-t-3xl bg-paper-50 px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:rounded-3xl sm:pb-6">
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1">
						<h2 id="titulo-telefono" className="text-2xl font-semibold">
							{booking.flow.phoneStep.title}
						</h2>
						<p className="text-ink-600">{booking.flow.phoneStep.subtitle}</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label={booking.flow.close}
						className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-paper-200"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							strokeWidth={2}
							strokeLinecap="round"
						>
							<path d="M6 6l12 12M18 6L6 18" />
						</svg>
					</button>
				</div>

				<form className="mt-5 space-y-4" onSubmit={submit}>
					<div className="space-y-1.5">
						<label
							htmlFor="customer-phone"
							className="block text-sm font-medium text-ink-700"
						>
							{booking.flow.phoneStep.label}
						</label>

						<div className="flex items-stretch gap-2">
							{/*
							 * El prefijo se muestra y no se escribe: es el del país del
							 * negocio. Quien tenga un número de otro país lo escribe completo
							 * con `+` y el backend lo respeta, que es el único que normaliza
							 * teléfonos en Polaria.
							 */}
							<span className="flex shrink-0 items-center rounded-xl bg-paper-200 px-3 text-sm text-ink-600 tabular-nums">
								+{profile.dialCode}
							</span>
							<input
								id="customer-phone"
								value={phone}
								onChange={(event) => setPhone(event.target.value)}
								placeholder={booking.flow.details.phonePlaceholder}
								inputMode="tel"
								autoComplete="tel"
								autoFocus
								className={cn(
									'w-full flex-1 rounded-xl bg-paper-100 px-4 py-3 text-ink-900',
									'ring-1 ring-paper-300 ring-inset outline-none',
									'placeholder:text-ink-500 focus:ring-2 focus:ring-accent-500',
								)}
							/>
						</div>

						{error ? (
							<p className="text-sm text-attention-700">{error}</p>
						) : (
							<p className="text-sm text-ink-500">
								{booking.flow.details.phoneHint}
							</p>
						)}
					</div>

					<Button type="submit" size="lg" className="w-full" disabled={saving}>
						{saving
							? booking.flow.phoneStep.saving
							: booking.flow.phoneStep.submit}
					</Button>
				</form>
			</div>
		</div>
	);
}

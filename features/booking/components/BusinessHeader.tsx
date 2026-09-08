import { booking } from '@/content/booking';
import { businessTypeLabel } from '@/content/business-types';
import { cn } from '@/lib/utils';
import { describeStatus } from '../format';
import { directionsUrl } from '../location';
import type { PublicBusinessProfile } from '@/services/booking/types';

/**
 * Quién es el negocio y si está abierto. Nada más.
 *
 * Es lo que separa una página de reservas de la página institucional de un
 * local: no hay "sobre nosotros", ni historia, ni frases sobre la pasión por el
 * oficio. Alguien que llega desde un QR ya sabe adónde entró; lo que no sabe es
 * si puede ir hoy.
 */
export function BusinessHeader({
	profile,
}: {
	profile: PublicBusinessProfile;
}) {
	const directions = directionsUrl(profile);

	const typeLabel = businessTypeLabel(profile.businessType);

	return (
		<header className="space-y-3">
			<div className="space-y-1">
				<h1 className="text-3xl font-semibold sm:text-4xl">{profile.name}</h1>
				{typeLabel && <p className="text-ink-500 capitalize">{typeLabel}</p>}
			</div>

			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
				<StatusPill profile={profile} />

				{profile.address && (
					<span className="text-ink-600">{profile.address}</span>
				)}

				{directions && (
					<a
						href={directions}
						target="_blank"
						rel="noreferrer"
						className="font-medium text-accent-600 underline-offset-4 hover:underline"
					>
						{booking.header.directions}
					</a>
				)}
			</div>
		</header>
	);
}

/**
 * Abierto o cerrado, con un punto de color.
 *
 * El punto es el único color de toda la página junto al enlace: verde y ámbar
 * son los mismos que usa la agenda del panel para "confirmado" y "requiere tu
 * atención", así que no hay una paleta nueva que aprender.
 */
export function StatusPill({
	profile,
	className,
}: {
	profile: PublicBusinessProfile;
	className?: string;
}) {
	const { status } = profile;

	return (
		<span className={cn('inline-flex items-center gap-2', className)}>
			<span
				aria-hidden="true"
				className={cn(
					'h-2 w-2 rounded-full',
					status.open ? 'bg-confirm-500' : 'bg-attention-500',
				)}
			/>
			<span
				className={cn(
					'font-medium',
					status.open ? 'text-confirm-700' : 'text-attention-700',
				)}
			>
				{describeStatus(status)}
			</span>
		</span>
	);
}

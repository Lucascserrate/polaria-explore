'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { booking } from '@/content/booking';
import type { PublicPhoto } from '@/services/booking/types';
import { Chevron } from './Chevron';

/**
 * El visor: una foto a pantalla completa y las flechas para recorrerlas.
 *
 * Se navega con botones y con las flechas del teclado. Nunca con la rueda del
 * mouse: hay clientes cuyo mouse no la tiene, y una galería que solo avanza
 * rodando sería para ellos una galería de una sola foto.
 */
export function PhotoViewer({
	photos,
	name,
	startAt,
	onClose,
}: {
	photos: PublicPhoto[];
	name: string;
	startAt: number;
	onClose: () => void;
}) {
	const [index, setIndex] = useState(startAt);

	const move = useCallback(
		(step: number) =>
			setIndex((current) =>
				Math.min(Math.max(current + step, 0), photos.length - 1),
			),
		[photos.length],
	);

	/**
	 * Escape cierra, las flechas mueven, y el fondo no se desplaza mientras el
	 * visor está abierto. Es el mismo trato que `BookingDialog` le da al flujo de
	 * reserva: mientras hay algo a pantalla completa, la página de atrás se
	 * queda quieta.
	 */
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onClose();
			if (event.key === 'ArrowLeft') move(-1);
			if (event.key === 'ArrowRight') move(1);
		};

		document.addEventListener('keydown', onKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', onKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [move, onClose]);

	const photo = photos[index];

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={booking.gallery.counter(index + 1, photos.length)}
			className="fixed inset-0 z-50 flex flex-col bg-ink-950/95"
		>
			<div className="flex items-center justify-between px-4 py-3 text-paper-50">
				<p className="text-sm font-medium">
					{booking.gallery.counter(index + 1, photos.length)}
				</p>

				<button
					type="button"
					onClick={onClose}
					className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-paper-50/10"
				>
					{booking.gallery.close}
				</button>
			</div>

			<div className="relative flex-1">
				<Image
					key={photo.id}
					src={photo.url}
					alt={booking.gallery.photoAlt(name, index + 1, photos.length)}
					fill
					sizes="100vw"
					/*
					 * `contain` y no `cover`: en el visor la foto se mira completa. Un
					 * recorte acá esconde justo lo que alguien vino a ver.
					 */
					className="object-contain"
				/>
			</div>

			{photos.length > 1 && (
				<div className="flex items-center justify-center gap-6 px-4 py-5">
					<ViewerArrow
						direction="previous"
						disabled={index === 0}
						onClick={() => move(-1)}
					/>
					<ViewerArrow
						direction="next"
						disabled={index === photos.length - 1}
						onClick={() => move(1)}
					/>
				</div>
			)}
		</div>
	);
}

function ViewerArrow({
	direction,
	disabled,
	onClick,
}: {
	direction: 'previous' | 'next';
	disabled: boolean;
	onClick: () => void;
}) {
	const isPrevious = direction === 'previous';

	return (
		<button
			type="button"
			aria-label={booking.gallery[direction]}
			disabled={disabled}
			onClick={onClick}
			className="grid h-11 w-11 place-items-center rounded-full bg-paper-50/15 text-paper-50 disabled:opacity-30"
		>
			<Chevron className={isPrevious ? 'rotate-180' : undefined} />
		</button>
	);
}

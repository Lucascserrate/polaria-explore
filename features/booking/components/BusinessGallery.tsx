'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import type {
	PublicBusinessProfile,
	PublicPhoto,
} from '@/services/booking/types';

export function BusinessGallery({
	profile,
}: {
	profile: PublicBusinessProfile;
}) {
	const { photos, name } = profile;

	const track = useRef<HTMLUListElement>(null);
	const [index, setIndex] = useState(0);
	const [viewerAt, setViewerAt] = useState<number | null>(null);

	if (photos.length === 0) return null;

	const scrollTo = (next: number) => {
		const element = track.current;

		if (!element) {
			// El síntoma de que al <ul> le falte `ref={track}` es "las flechas no
			// funcionan": sin error, sin nada en la consola y con el resto de la
			// galería andando, porque el visor no usa el ref. Ya pasó una vez y
			// llevó un rato largo encontrarlo. Este aviso es ese rato.
			if (process.env.NODE_ENV !== 'production') {
				console.error(
					'BusinessGallery: el <ul> del carrusel se quedó sin ref={track}, así que las flechas no pueden desplazarlo.',
				);
			}
			return;
		}

		const clamped = Math.min(Math.max(next, 0), photos.length - 1);
		element.scrollTo({
			left: clamped * element.clientWidth,
			behavior: 'smooth',
		});
	};

	const hiddenOnDesktop = Math.max(photos.length - 3, 0);

	return (
		<>
			<div className="relative -mx-5 sm:mx-0">
				<ul
					// Imprescindible: es lo único que las flechas tienen para desplazar
					// la lista. Ver `scrollTo`.
					ref={track}
					onScroll={(event) => {
						const element = event.currentTarget;
						setIndex(Math.round(element.scrollLeft / element.clientWidth));
					}}
					className={cn(
						'flex snap-x snap-mandatory overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden',
						'sm:grid sm:gap-2 sm:overflow-visible',
						photos.length === 1 && 'sm:grid-cols-1',
						photos.length === 2 && 'sm:grid-cols-2',
						photos.length >= 3 && 'sm:grid-cols-[1.6fr_1fr] sm:grid-rows-2',
					)}
				>
					{photos.map((photo, position) => (
						<li
							key={photo.id}
							className={cn(
								'w-full shrink-0 snap-center sm:w-auto',
								// En escritorio la portada ocupa las dos filas de la izquierda
								// y las dos siguientes se apilan a la derecha.
								position === 0 &&
									photos.length >= 3 &&
									'sm:col-start-1 sm:row-span-2',
								position === 1 && photos.length >= 3 && 'sm:col-start-2',
								position === 2 && photos.length >= 3 && 'sm:col-start-2',
								/*
								 * De la cuarta en adelante siguen en el HTML —el carrusel del
								 * teléfono las usa— y en escritorio no se dibujan: para eso
								 * está "ver todas".
								 */
								position >= 3 && 'sm:hidden',
							)}
						>
							<button
								type="button"
								aria-label={booking.gallery.open}
								onClick={() => setViewerAt(position)}
								className={cn(
									'relative block h-full w-full bg-paper-200',
									'aspect-4/3 sm:aspect-auto',
									// La portada es la que fija la altura de la grilla; el resto
									// se estira a las filas que le tocan.
									position === 0 && photos.length >= 3 && 'sm:aspect-4/3',
									position === 0 && photos.length < 3 && 'sm:aspect-video',
									position === 1 && photos.length === 2 && 'sm:aspect-video',
									'overflow-hidden',
									position === 0 && 'sm:rounded-l-2xl',
									photos.length === 1 && 'sm:rounded-2xl',
									photos.length === 2 && position === 1 && 'sm:rounded-r-2xl',
									photos.length >= 3 && position === 1 && 'sm:rounded-tr-2xl',
									photos.length >= 3 && position === 2 && 'sm:rounded-br-2xl',
								)}
							>
								<Image
									src={photo.url}
									alt={booking.gallery.photoAlt(
										name,
										position + 1,
										photos.length,
									)}
									fill
									/*
									 * Los anchos que la foto ocupa de verdad, medidos sobre la
									 * grilla: en el teléfono el ancho de la pantalla; de `sm` en
									 * adelante, 55% del contenedor la portada y 35% las otras;
									 * y a partir de `xl`, donde el contenedor topa en 72rem, los
									 * dos valores dejan de crecer.
									 *
									 * Declararlo es lo que hace que el navegador pida el tamaño
									 * que va a usar. Con un `sizes` de más, baja una imagen que
									 * nadie ve entera; con uno de menos, la escala hacia arriba y
									 * se ve borrosa.
									 */
									sizes={
										position === 0
											? '(min-width: 1280px) 43rem, (min-width: 640px) 55vw, 100vw'
											: '(min-width: 1280px) 27rem, (min-width: 640px) 35vw, 100vw'
									}
									/*
									 * Solo la portada se carga con prioridad: es la imagen más
									 * grande de lo que se ve al abrir y por lo tanto la que mide
									 * el navegador. Pedir las diez con prioridad las pone a
									 * competir y ninguna llega antes.
									 */
									priority={position === 0}
									className="object-cover"
								/>
							</button>
						</li>
					))}
				</ul>

				{/*
				 * Flechas y contador son del carrusel, así que desaparecen donde la
				 * lista es una grilla: en escritorio no hay nada que pasar.
				 *
				 * Las flechas no son decorativas: hay quien abre esto con un mouse sin
				 * rueda, y sin botones no tendría forma de ver la segunda foto.
				 */}
				{photos.length > 1 && (
					<div className="sm:hidden">
						<CarouselArrow
							direction="previous"
							disabled={index === 0}
							onClick={() => scrollTo(index - 1)}
						/>
						<CarouselArrow
							direction="next"
							disabled={index === photos.length - 1}
							onClick={() => scrollTo(index + 1)}
						/>

						<p className="absolute bottom-7 right-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-xs font-medium text-paper-50 sm:bottom-3">
							{booking.gallery.counter(index + 1, photos.length)}
						</p>
					</div>
				)}

				{/*
				 * El botón aparece solo si hay fotos que la grilla no muestra. Si
				 * estuviera siempre, "ver todas" abriría el visor para mostrar
				 * exactamente lo que ya está en pantalla.
				 */}
				{hiddenOnDesktop > 0 && (
					<button
						type="button"
						onClick={() => setViewerAt(0)}
						className="absolute bottom-4 right-4 hidden rounded-full bg-paper-50 px-4 py-2 text-sm font-medium text-ink-900 shadow-md sm:block"
					>
						{booking.gallery.seeAll}
					</button>
				)}
			</div>

			{viewerAt !== null && (
				<PhotoViewer
					photos={photos}
					name={name}
					startAt={viewerAt}
					onClose={() => setViewerAt(null)}
				/>
			)}
		</>
	);
}

function CarouselArrow({
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
			className={cn(
				'absolute top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-paper-50/90 text-ink-900 shadow-sm transition-opacity disabled:opacity-0',
				isPrevious ? 'left-3' : 'right-3',
			)}
		>
			<Chevron className={isPrevious ? 'rotate-180' : undefined} />
		</button>
	);
}

/**
 * El visor: una foto a pantalla completa y las flechas para recorrerlas.
 *
 * Se navega con botones y con las flechas del teclado. Nunca con la rueda del
 * mouse: hay clientes cuyo mouse no la tiene, y una galería que solo avanza
 * rodando sería para ellos una galería de una sola foto.
 */
function PhotoViewer({
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

/** Una flecha dibujada acá y no un icono de librería: es la única de la página. */
function Chevron({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			className={cn('h-5 w-5', className)}
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m9 6 6 6-6 6" />
		</svg>
	);
}

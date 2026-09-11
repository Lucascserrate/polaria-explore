'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { booking } from '@/content/booking';
import { cn } from '@/lib/utils';
import type { PublicBusinessProfile } from '@/services/booking/types';
import { Chevron } from './Chevron';
import { PhotoViewer } from './PhotoViewer';

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

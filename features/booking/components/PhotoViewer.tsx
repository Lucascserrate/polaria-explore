'use client';

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { booking } from '@/content/booking';
import type { PublicPhoto } from '@/services/booking/types';
import { Chevron } from './Chevron';

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
	const track = useRef<HTMLUListElement>(null);
	const [index, setIndex] = useState(startAt);

	const move = useCallback(
		(step: number) => {
			const element = track.current;
			if (!element) return;

			const next = Math.min(Math.max(index + step, 0), photos.length - 1);

			/*
			 * Mover el scroll y no un estado: el índice sale de dónde quedó la lista
			 * (`onScroll`), así que las flechas y el dedo terminan en el mismo lugar
			 * en vez de discutir cuál de los dos tiene razón.
			 */
			element.scrollTo({
				left: next * element.clientWidth,
				behavior: 'smooth',
			});
		},
		[index, photos.length],
	);

	/*
	 * Abrir en la foto que se tocó, antes del primer pintado. Con `useEffect` se
	 * alcanza a ver la primera y un salto hasta la elegida; acá el salto no
	 * existe, y va sin `behavior: 'smooth'` a propósito: no es un movimiento, es
	 * la posición en la que el visor nace.
	 */
	useLayoutEffect(() => {
		const element = track.current;
		if (element) element.scrollLeft = startAt * element.clientWidth;
	}, [startAt]);

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

	const viewer = (
		<div
			role="dialog"
			aria-modal="true"
			aria-label={booking.gallery.counter(index + 1, photos.length)}
			/*
			 * `h-dvh` y no sólo `inset-0`: en el teléfono la barra del navegador
			 * aparece y desaparece, y la altura de la ventana con ella. Con la altura
			 * dinámica el visor mide siempre lo que se ve, ni una franja de menos
			 * abajo ni un pedazo escondido detrás de la barra.
			 */
			className="fixed inset-0 z-50 h-dvh bg-ink-950/95"
		>
			{/*
			 * La lista ocupa el visor entero y los controles van encima. Antes era
			 * una columna —barra, foto, flechas— y la foto se quedaba con lo que
			 * sobraba: en el teléfono, con dos filas de controles, eso es la mitad de
			 * la pantalla para lo único que se vino a ver.
			 */}
			<ul
				ref={track}
				onScroll={(event) => {
					const element = event.currentTarget;
					setIndex(Math.round(element.scrollLeft / element.clientWidth));
				}}
				className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				{photos.map((photo, position) => (
					<li
						key={photo.id}
						className="relative h-full w-full shrink-0 snap-center"
					>
						<Image
							src={photo.url}
							alt={booking.gallery.photoAlt(name, position + 1, photos.length)}
							fill
							sizes="100vw"
							/*
							 * La que se tocó se pide con prioridad: es la única que se ve al
							 * abrir. Las de al lado las baja el navegador cuando se llega a
							 * ellas, que es lo que evita bajar veinte fotos para mirar una.
							 */
							priority={position === startAt}
							/*
							 * `contain` y no `cover`: en el visor la foto se mira completa. Un
							 * recorte acá esconde justo lo que alguien vino a ver.
							 */
							className="object-contain"
						/>
					</li>
				))}
			</ul>

			{/*
			 * Los controles flotan sobre la foto, así que van con un velo: el blanco
			 * sobre una foto clara no se lee, y pintarles una barra sólida sería
			 * volver a comerse el alto que este cambio devuelve.
			 *
			 * `pt-[max(...)]` por la isla del iPhone: sin `viewport-fit=cover` la
			 * variable vale cero y queda el valor de siempre, así que no rompe nada
			 * donde no hace falta.
			 */}
			<div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-linear-to-b from-ink-950/70 to-transparent px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))] text-paper-50">
				<p className="text-sm font-medium">
					{booking.gallery.counter(index + 1, photos.length)}
				</p>

				<button
					type="button"
					onClick={onClose}
					className="pointer-events-auto rounded-full px-3 py-1.5 text-sm font-medium hover:bg-paper-50/10"
				>
					{booking.gallery.close}
				</button>
			</div>

			{photos.length > 1 && (
				<div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 bg-linear-to-t from-ink-950/70 to-transparent px-4 pt-10 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
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

	/*
	 * Al `<body>` y no donde se lo llamó. `position: fixed` deja de medir la
	 * ventana en cuanto un antepasado tiene `transform`, `filter` o `contain` —el
	 * mosaico del portfolio y el carrusel de la galería están llenos de
	 * candidatos—, y el síntoma es exactamente éste: un visor que se dibuja
	 * adentro de la sección en vez de tapar la pantalla. Colgado del body no hay
	 * antepasado que pueda atraparlo.
	 *
	 * No se renderiza nunca en el servidor: el visor se monta al tocar una foto.
	 */
	return createPortal(viewer, document.body);
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
			className="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-paper-50/15 text-paper-50 backdrop-blur-sm disabled:opacity-30"
		>
			<Chevron className={isPrevious ? 'rotate-180' : undefined} />
		</button>
	);
}

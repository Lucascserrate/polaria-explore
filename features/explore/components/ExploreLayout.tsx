'use client';

import { useState, type ReactNode } from 'react';
import { List, Map as MapIcon } from 'lucide-react';
import type { MapPin } from '@/components/map/interactive-map';
import { explore } from '@/content/explore';
import { cn } from '@/lib/utils';
import type { MapView } from '../map-view';
import { ExploreMap } from './ExploreMap';

/**
 * La pantalla del buscador. Son dos diseños, no uno que se encoge.
 *
 * **En escritorio conviven**: la lista a la izquierda, el mapa fijo a la
 * derecha, y ocultarlo le devuelve el ancho a la lista —de dos tarjetas por
 * fila a cuatro—. Es la diferencia entre elegir por zona y elegir por foto, y
 * las dos cosas son legítimas.
 *
 * **En el teléfono se turnan.** El mapa va a pantalla completa o no va: media
 * pantalla de mapa arriba de media pantalla de lista deja dos cosas empezadas y
 * ninguna usable. Con el mapa abierto la lista no se dibuja, así que la página
 * mide exactamente una pantalla y no hay scroll debajo del mapa.
 *
 * Es la única parte cliente de la página, y por una sola razón: ese
 * intercambio. Las tarjetas, los rubros y el recuento llegan dibujados desde el
 * servidor y entran como `children`, así que el HTML sirve completo aunque el
 * JavaScript no llegue nunca. El filtro tampoco necesita estado: son enlaces
 * (ver `BusinessTypeFilter`).
 *
 * **Sin ningún negocio ubicado no hay mapa ni botón.** Un mapa sin marcadores
 * no es un mapa vacío: es una pantalla que no sirve para nada.
 */
export function ExploreLayout({
	count,
	filter,
	view,
	pins,
	empty,
	children,
}: {
	count: number;
	/** Los rubros, ya resueltos en el servidor. */
	filter: ReactNode;
	/** Dónde abre el mapa, o `null` si ningún negocio tiene coordenadas. */
	view: MapView | null;
	pins: MapPin[];
	/** El texto de "no hay nada", cuando no hay nada. Manda sobre `children`. */
	empty?: string;
	children: ReactNode;
}) {
	/**
	 * `null` es "todavía no eligió", y no es lo mismo que "no".
	 *
	 * Cada tamaño de pantalla abre distinto —el escritorio con el mapa a la
	 * vista, el teléfono con la lista— y un booleano solo no puede decir las dos
	 * cosas a la vez. Guardar la elección aparte de los valores por defecto deja
	 * que cada uno tenga el suyo **sin medir el ancho de la ventana**: medirlo
	 * significaría dibujar la página una vez mal y otra bien, y ver el salto.
	 * Acá lo resuelve CSS, que es quien sabe de qué tamaño es la pantalla.
	 */
	const [choice, setChoice] = useState<boolean | null>(null);

	const openWide = choice ?? true;
	const openNarrow = choice ?? false;

	const hasMap = view !== null && pins.length > 0;

	return (
		<main className="flex-1">
			{/*
			  El titular no se dibuja: arriba de la lista van el recuento y los
			  rubros, como en cualquier buscador, y una frase grande ocuparía la
			  primera pantalla del teléfono con algo que nadie vino a leer. La
			  página igual tiene que decir de qué es. Ver `content/explore.ts`.
			*/}
			<h1 className="sr-only">{explore.title}</h1>

			<div className="flex flex-col lg:flex-row lg:items-start">
				<div
					className={cn(
						'min-w-0 flex-1 px-5 py-5 sm:px-8',
						hasMap && openNarrow ? 'hidden lg:block' : 'block',
						hasMap && openWide && 'lg:w-1/2 lg:flex-none xl:w-[46%]',
					)}
				>
					<div className="flex items-center justify-between gap-4">
						<p className="text-sm text-ink-600">{explore.count(count)}</p>

						{hasMap && (
							<>
								<button
									type="button"
									onClick={() => setChoice(true)}
									aria-label={explore.map.show}
									className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full border border-paper-300 text-ink-900 transition-colors hover:bg-paper-200 lg:hidden"
								>
									<MapIcon aria-hidden className="size-5" strokeWidth={1.75} />
								</button>

								<button
									type="button"
									onClick={() => setChoice(!openWide)}
									className="hidden shrink-0 cursor-pointer items-center gap-2 rounded-full border border-paper-300 px-3.5 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-paper-400 hover:bg-paper-200 lg:flex"
								>
									<MapIcon aria-hidden className="size-4" strokeWidth={1.75} />
									{openWide ? explore.map.hide : explore.map.show}
								</button>
							</>
						)}
					</div>

					<div className="mt-4">{filter}</div>

					{empty ? (
						<p className="py-16 text-center text-ink-600">{empty}</p>
					) : (
						<ul
							className={cn(
								'mt-6 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2',
								!(hasMap && openWide) && 'lg:grid-cols-3 2xl:grid-cols-4',
							)}
						>
							{children}
						</ul>
					)}
				</div>

				{hasMap && (
					/*
					 * El mapa no se recentra al cambiar de rubro: los marcadores se
					 * actualizan y el encuadre queda donde estaba. Mover el mapa debajo
					 * de alguien que acaba de encontrar su barrio es peor que dejarle
					 * unos marcadores de menos a la vista.
					 *
					 * En el teléfono ocupa la pantalla entera —sin margen ni esquinas
					 * redondeadas, que a sangre es lo que lo hace parecer un mapa y no
					 * una figurita—; en escritorio es un panel fijo que acompaña el
					 * scroll de la lista.
					 */
					<div
						className={cn(
							'relative h-[calc(100dvh-4rem)] w-full shrink-0 sm:h-[calc(100dvh-4.5rem)] lg:sticky lg:top-18 lg:flex-1 lg:p-3 lg:pl-0',
							openNarrow ? 'block' : 'hidden',
							openWide ? 'lg:block' : 'lg:hidden',
						)}
					>
						<ExploreMap
							pins={pins}
							center={view.center}
							zoom={view.zoom}
							className="size-full overflow-hidden lg:rounded-2xl"
						/>

						{/*
						  Volver a la lista. Sólo en el teléfono: en escritorio la lista
						  nunca se fue.
						*/}
						<button
							type="button"
							onClick={() => setChoice(false)}
							aria-label={explore.map.backToList}
							className="absolute top-3 right-3 z-10 grid size-11 cursor-pointer place-items-center rounded-full bg-paper-50 text-ink-900 shadow-md ring-1 ring-paper-300 lg:hidden"
						>
							<List aria-hidden className="size-5" strokeWidth={1.75} />
						</button>
					</div>
				)}
			</div>
		</main>
	);
}

export default ExploreLayout;

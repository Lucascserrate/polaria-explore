'use client';

import { useState, type ReactNode } from 'react';
import { Map as MapIcon } from 'lucide-react';
import type { MapPin } from '@/components/map/interactive-map';
import { explore } from '@/content/explore';
import { cn } from '@/lib/utils';
import type { MapView } from '../map-view';
import { ExploreMap } from './ExploreMap';

/**
 * La pantalla del buscador: la lista a la izquierda, el mapa a la derecha.
 *
 * Es la única parte cliente de la página, y por una sola razón: mostrar y
 * ocultar el mapa. Todo lo demás —las tarjetas, los rubros, el recuento— llega
 * dibujado desde el servidor y entra acá como `children`, así que el HTML sirve
 * completo aunque el JavaScript no llegue nunca. El filtro de rubros tampoco
 * necesita estado: son enlaces (ver `BusinessTypeFilter`).
 *
 * **Ocultar el mapa no es una preferencia decorativa.** Con el mapa a la vista
 * la lista entra en media pantalla y muestra dos tarjetas por fila; sin él usa
 * el ancho completo y llega a cuatro. Es la diferencia entre elegir por zona y
 * elegir por foto, y las dos cosas son legítimas.
 *
 * **En el teléfono el mapa va arriba y la lista abajo**, que es el orden en que
 * se usan: primero ubicarse, después mirar. Se logra con `flex-col-reverse`
 * para que el HTML siga diciendo la lista primero —es el contenido de la
 * página; el mapa es cómo se navega—.
 *
 * **Sin ningún negocio ubicado no hay mapa ni botón.** Un mapa sin marcadores
 * no es un mapa vacío: es una mitad de pantalla que no sirve para nada.
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
	const [showMap, setShowMap] = useState(true);

	const hasMap = view !== null && pins.length > 0;
	const withMap = hasMap && showMap;

	return (
		<main className="flex-1">
			{/*
			  El titular no se dibuja: arriba de la lista van el recuento y los
			  rubros, como en cualquier buscador, y una frase grande ocuparía la
			  primera pantalla del teléfono con algo que nadie vino a leer. La
			  página igual tiene que decir de qué es. Ver `content/explore.ts`.
			*/}
			<h1 className="sr-only">{explore.title}</h1>

			<div className="flex flex-col-reverse lg:flex-row lg:items-start">
				<div
					className={cn(
						'min-w-0 flex-1 px-5 py-5 sm:px-8',
						withMap && 'lg:w-1/2 lg:flex-none xl:w-[46%]',
					)}
				>
					<div className="flex items-center justify-between gap-4">
						<p className="text-sm text-ink-600">{explore.count(count)}</p>

						{hasMap && (
							<button
								type="button"
								onClick={() => setShowMap((visible) => !visible)}
								className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-paper-300 px-3.5 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-paper-400 hover:bg-paper-200"
							>
								<MapIcon aria-hidden className="size-4" strokeWidth={1.75} />
								{showMap ? explore.map.hide : explore.map.show}
							</button>
						)}
					</div>

					<div className="mt-4">{filter}</div>

					{empty ? (
						<p className="py-16 text-center text-ink-600">{empty}</p>
					) : (
						<ul
							className={cn(
								'mt-6 grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2',
								!withMap && 'lg:grid-cols-3 2xl:grid-cols-4',
							)}
						>
							{children}
						</ul>
					)}
				</div>

				{withMap && (
					/*
					 * El mapa no se recentra al cambiar de rubro: los marcadores se
					 * actualizan y el encuadre queda donde estaba. Mover el mapa debajo
					 * de alguien que acaba de encontrar su barrio es peor que dejarle
					 * unos marcadores de menos a la vista.
					 */
					<div className="h-[55dvh] w-full shrink-0 p-3 lg:sticky lg:top-18 lg:h-[calc(100dvh-4.5rem)] lg:flex-1 lg:pl-0">
						<ExploreMap
							pins={pins}
							center={view.center}
							zoom={view.zoom}
							className="size-full overflow-hidden rounded-2xl"
						/>
					</div>
				)}
			</div>
		</main>
	);
}

export default ExploreLayout;

'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Map as MapIcon } from 'lucide-react';
import type { Bounds, Viewport } from '@/components/map/interactive-map';
import { explore } from '@/content/explore';
import { cn } from '@/lib/utils';
import type {
	LocatedBusiness,
	PublicBusinessSummary,
} from '@/services/explore/types';
import { writeMapView } from '../map-url';
import type { MapView } from '../map-view';
import { visibleIn } from '../viewport';
import { BusinessCard } from './BusinessCard';
import { ExploreMap } from './ExploreMap';
import { ExploreTopBar } from './ExploreTopBar';

/**
 * La pantalla del buscador. Son dos diseños, no uno que se encoge.
 *
 * **En escritorio conviven**: la lista a la izquierda, el mapa fijo a la
 * derecha, y ocultarlo le devuelve el ancho a la lista —de dos tarjetas por
 * fila a tres—. Es la diferencia entre elegir por zona y elegir por foto, y las
 * dos cosas son legítimas.
 *
 * **En el teléfono se turnan.** El mapa va a pantalla completa o no va: media
 * pantalla de mapa arriba de media pantalla de lista deja dos cosas empezadas y
 * ninguna usable. Con el mapa abierto la lista no se dibuja, así que la página
 * mide exactamente una pantalla y no hay scroll debajo del mapa.
 *
 * **La lista es lo que se ve en el mapa.** Cuando el mapa se queda quieto avisa
 * qué rectángulo está mostrando y la lista se recorta a eso, sin pedirle nada a
 * la API: los negocios ya llegaron todos en el render del servidor, así que el
 * filtro son cuatro comparaciones y pasa en el mismo cuadro. El día que el
 * directorio no entre en una respuesta, lo que cambia es de dónde salen los
 * datos y no esto. Ver `visibleIn`.
 *
 * **El mapa se tapa pero no se desmonta**, y es a propósito: así los límites
 * sobreviven al cambio de vista. Alguien que arrastra hasta su barrio en el
 * teléfono y toca "lista" espera encontrar los negocios de su barrio, no la
 * lista entera otra vez.
 *
 * Las tarjetas y los rubros llegan dibujados desde el servidor, así que sin
 * JavaScript la página sirve completa: se ve la lista entera, que es la
 * respuesta correcta cuando no hay mapa que la recorte.
 */
export function ExploreLayout({
	businesses,
	located,
	filter,
	filtered,
	view,
}: {
	/** Todos los del rubro elegido, ubicados o no. De acá sale la lista. */
	businesses: PublicBusinessSummary[];
	/** Los que tienen coordenadas. De acá salen los marcadores. */
	located: LocatedBusiness[];
	/** Los rubros, ya resueltos en el servidor. */
	filter: ReactNode;
	/** Si hay un rubro elegido, para saber qué decir cuando no queda ninguno. */
	filtered: boolean;
	/** Dónde abre el mapa, o `null` si ningún negocio tiene coordenadas. */
	view: MapView | null;
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

	/** Lo último que informó el mapa. `null` hasta que termina de abrir. */
	const [bounds, setBounds] = useState<Bounds | null>(null);

	const openWide = choice ?? true;
	const openNarrow = choice ?? false;

	const hasMap = view !== null && located.length > 0;
	const withMap = hasMap && openWide;

	const onViewportChange = useCallback((viewport: Viewport) => {
		setBounds(viewport.bounds);
		writeMapView(viewport.center, viewport.zoom);
	}, []);

	const shown = visibleIn(businesses, bounds);

	const empty =
		businesses.length === 0
			? filtered
				? explore.empty.filtered
				: explore.empty.all
			: shown.length === 0
				? explore.empty.area
				: null;

	return (
		<main className="flex-1">
			<h1 className="sr-only">{explore.title}</h1>

			<div className="flex flex-col lg:flex-row lg:items-start">
				<div
					className={cn(
						/*
						 * El tope es de la **columna entera, con su padding adentro**:
						 * 855px es lo que mide el bloque de punta a punta, no el ancho de
						 * las tarjetas.
						 *
						 * Va sobre la columna y no sobre su contenido porque eso decide
						 * quién se queda con lo que sobra. Con el mapa al lado se lo lleva
						 * el mapa, que es lo que mejora al crecer —entran más cuadras—;
						 * una lista estirada sólo muestra los mismos negocios más grandes,
						 * y deja una franja de blanco entre las tarjetas y el mapa.
						 */
						'min-w-0 flex-1 px-5 py-5 sm:px-8 lg:max-w-[855px]',
						hasMap && openNarrow ? 'hidden lg:block' : 'block',
						// Sin mapa al lado, el bloque se centra en la pantalla.
						withMap ? 'lg:w-1/2 lg:flex-none' : 'lg:mx-auto',
					)}
				>
					<div className="sticky top-3 z-20 lg:hidden">
						<ExploreTopBar
							count={shown.length}
							mapOpen={false}
							onToggleMap={hasMap ? () => setChoice(true) : undefined}
						/>
					</div>

					<div className="hidden items-center justify-between gap-4 lg:flex">
						<p className="text-sm text-ink-600">
							{bounds
								? explore.countInArea(shown.length)
								: explore.count(shown.length)}
						</p>

						{hasMap && (
							<button
								type="button"
								onClick={() => setChoice(!openWide)}
								className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-paper-300 px-3.5 py-2 text-sm font-medium text-ink-800 transition-colors hover:border-paper-400 hover:bg-paper-200"
							>
								<MapIcon aria-hidden className="size-4" strokeWidth={1.75} />
								{openWide ? explore.map.hide : explore.map.show}
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
								// Tres y no cuatro: dentro del tope de la lista, cuatro
								// columnas dejan tarjetas donde el nombre no entra.
								!withMap && 'lg:grid-cols-3',
							)}
						>
							{shown.map((business) => (
								<BusinessCard key={business.slug} business={business} />
							))}
						</ul>
					)}
				</div>

				{hasMap && (
					/*
					 * El mapa se tapa, no se desmonta: si se fuera del árbol perdería
					 * los límites, y con ellos el recorte de la lista que alguien acaba
					 * de elegir arrastrando.
					 *
					 * Tampoco se recentra al cambiar de rubro: los marcadores se
					 * actualizan y el encuadre queda donde estaba. Mover el mapa debajo
					 * de alguien que acaba de encontrar su barrio es peor que dejarle
					 * unos marcadores de menos a la vista.
					 *
					 * Alto: la pantalla entera en el teléfono, donde el buscador no
					 * dibuja la barra de Polaria (ver `app/explore/layout.tsx`), y la
					 * pantalla menos la barra en escritorio, donde sí está.
					 */
					<div
						className={cn(
							'relative h-dvh w-full shrink-0 lg:sticky lg:top-18 lg:h-[calc(100dvh-4.5rem)] lg:flex-1 lg:p-3 lg:pl-0',
							openNarrow ? 'block' : 'hidden',
							openWide ? 'lg:block' : 'lg:hidden',
						)}
					>
						<ExploreMap
							businesses={located}
							view={view}
							onViewportChange={onViewportChange}
							className="explore-map size-full overflow-hidden lg:rounded-2xl"
						/>

						<div className="absolute inset-x-3 top-3 z-10 lg:hidden">
							<ExploreTopBar
								count={shown.length}
								mapOpen
								onToggleMap={() => setChoice(false)}
							/>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}

export default ExploreLayout;

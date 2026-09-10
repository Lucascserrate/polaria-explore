'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Popup } from 'react-map-gl/mapbox';
import {
	InteractiveMap,
	type MapPin,
	type Viewport,
} from '@/components/map/interactive-map';
import { useMediaQuery } from '@/lib/media-query';
import type { LocatedBusiness } from '@/services/explore/types';
import { BusinessTypeIcon } from '../business-type-icon';
import type { MapView } from '../map-view';
import { MapPreviewCard } from './MapPreviewCard';

/** El `lg` de Tailwind, que es donde la lista y el mapa dejan de turnarse. */
const WIDE_SCREEN = '(min-width: 64rem)';

/**
 * Cuánto se espera después del último movimiento antes de avisar.
 *
 * El mapa avisa cuando se queda quieto, y en un zoom con la rueda eso pasa
 * varias veces en un segundo. Este respiro junta esa ráfaga en un solo aviso,
 * que es lo que evita que la lista de al lado se redibuje cinco veces mientras
 * alguien todavía está acercando. Corto, porque cuando alguien suelta el mapa
 * ya está esperando la lista nueva.
 */
const SETTLE_MS = 250;

/**
 * El mapa del buscador, con lo que pasa al tocar un marcador.
 *
 * **Nunca se renderiza en el servidor**: `mapbox-gl` toca `window` al
 * importarse, y `Popup` viene del mismo paquete. Por eso vive detrás de
 * `ExploreMap`, que lo carga con `dynamic(..., { ssr: false })`, y por eso acá
 * adentro se puede medir la pantalla sin que la página se dibuje dos veces.
 *
 * Tocar un marcador abre la vista previa del negocio, y ahí hay dos diseños
 * porque hay dos situaciones distintas:
 *
 * - **En escritorio, un globo pegado al marcador.** Se ve el mapa entero
 *   alrededor, así que la tarjeta puede señalar de cuál de los veinte círculos
 *   está hablando.
 * - **En el teléfono, una tarjeta al pie.** Un globo del ancho de la pantalla
 *   pegado a un marcador que puede estar en cualquier borde termina medio
 *   afuera; al pie siempre está en el mismo lugar y el pulgar ya está ahí.
 *
 * Se elige uno y se dibuja uno solo. Dibujar los dos y esconder uno con CSS
 * dejaría la misma tarjeta dos veces en el HTML, y un lector de pantalla la
 * leería dos veces. Ver `useMediaQuery`.
 */
export function ExploreMapView({
	businesses,
	view,
	className,
	onViewportChange,
}: {
	businesses: LocatedBusiness[];
	view: MapView;
	className?: string;
	/** Qué se está viendo, ya amortiguado. Lo usa la lista y la URL. */
	onViewportChange?: (viewport: Viewport) => void;
}) {
	const [openSlug, setOpenSlug] = useState<string | null>(null);
	const wide = useMediaQuery(WIDE_SCREEN);

	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const settle = useCallback(
		(viewport: Viewport) => {
			if (timer.current) clearTimeout(timer.current);

			timer.current = setTimeout(
				() => onViewportChange?.(viewport),
				SETTLE_MS,
			);
		},
		[onViewportChange],
	);

	// Sin esto, un aviso pendiente intenta actualizar la lista después de que la
	// pantalla se desmontó.
	useEffect(() => {
		return () => {
			if (timer.current) clearTimeout(timer.current);
		};
	}, []);

	/*
	 * El negocio se busca por slug en lugar de guardarlo entero: si la lista
	 * cambia —alguien filtró por rubro, o el mapa se movió— el que estaba abierto
	 * puede ya no estar, y así la vista previa se cierra sola en vez de quedar
	 * mostrando un negocio que la pantalla dejó de listar.
	 */
	const open = businesses.find((business) => business.slug === openSlug) ?? null;

	const pins: MapPin[] = businesses.map((business) => ({
		id: business.slug,
		label: business.name,
		latitude: business.location.latitude,
		longitude: business.location.longitude,
		active: business.slug === openSlug,
		icon: (
			<BusinessTypeIcon
				type={business.businessType ?? 'OTHER'}
				className="size-3.5"
			/>
		),
	}));

	const close = () => setOpenSlug(null);

	return (
		<>
			<InteractiveMap
				initialCenter={view.center}
				zoom={view.zoom}
				pins={pins}
				className={className}
				onSelect={setOpenSlug}
				onDeselect={close}
				onViewportChange={settle}
			>
				{open && wide && (
					<Popup
						latitude={open.location.latitude}
						longitude={open.location.longitude}
						anchor="bottom"
						offset={20}
						closeButton={false}
						closeOnClick={false}
						maxWidth="256px"
						className="explore-popup"
					>
						<div className="w-64">
							<MapPreviewCard business={open} onClose={close} />
						</div>
					</Popup>
				)}
			</InteractiveMap>

			{open && !wide && (
				<div className="absolute inset-x-3 bottom-3 z-10">
					<MapPreviewCard business={open} onClose={close} />
				</div>
			)}
		</>
	);
}

export default ExploreMapView;

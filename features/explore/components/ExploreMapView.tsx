'use client';

import { useState } from 'react';
import { Popup } from 'react-map-gl/mapbox';
import { InteractiveMap, type MapPin } from '@/components/map/interactive-map';
import { useMediaQuery } from '@/lib/media-query';
import type { LocatedBusiness } from '@/services/explore/types';
import { BusinessTypeIcon } from '../business-type-icon';
import type { MapView } from '../map-view';
import { MapPreviewCard } from './MapPreviewCard';

/** El `lg` de Tailwind, que es donde la lista y el mapa dejan de turnarse. */
const WIDE_SCREEN = '(min-width: 64rem)';

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
}: {
	businesses: LocatedBusiness[];
	view: MapView;
	className?: string;
}) {
	const [openSlug, setOpenSlug] = useState<string | null>(null);
	const wide = useMediaQuery(WIDE_SCREEN);

	/*
	 * El negocio se busca por slug en lugar de guardarlo entero: si la lista
	 * cambia —alguien filtró por rubro— el que estaba abierto puede ya no estar,
	 * y así la vista previa se cierra sola en vez de quedar mostrando un negocio
	 * que la pantalla dejó de listar.
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
			>
				{open && wide && (
					<Popup
						latitude={open.location.latitude}
						longitude={open.location.longitude}
						anchor="bottom"
						/* Lo suficiente para no tapar el marcador del que salió. */
						offset={20}
						/* La cruz la dibuja la tarjeta; ver `explore-popup` en globals.css. */
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

'use client';

// Sin esto, el canvas y los controles se dibujan sin estilos.
import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef } from 'react';
import Map, { Marker, NavigationControl, type MapRef } from 'react-map-gl/mapbox';
import { MAPBOX_PUBLIC_STYLE, MAPBOX_PUBLIC_TOKEN } from '@/config/map';
import { map as copy } from '@/content/map';
import { cn } from '@/lib/utils';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

/** Un negocio en el mapa. `id` es lo que vuelve en `onSelect`. */
export interface MapPin extends Coordinates {
	id: string;
	/** Lo que se lee en el marcador: hoy la inicial o el nombre corto. */
	label: string;
	/** Resaltado, porque la lista de al lado lo tiene marcado. */
	active?: boolean;
}

/**
 * Adónde volar, cuando lo pide algo de afuera.
 *
 * Lleva un `nonce` además de las coordenadas, y no es un detalle: sin él, pedir
 * dos veces seguidas el mismo punto —mover el mapa y volver a tocar el mismo
 * negocio de la lista— no cambiaría el valor, el efecto no se dispararía y el
 * botón parecería roto la segunda vez. Es la misma solución que en el panel.
 */
export interface FlyTarget extends Coordinates {
	nonce: number;
}

const DEFAULT_ZOOM = 13;

/**
 * El mapa que se arrastra: el del buscador del marketplace.
 *
 * Trae el conocimiento del `MapView` del panel —el mismo `react-map-gl`, el
 * mismo `nonce` para volar, los mismos gestos apagados— con dos diferencias que
 * vienen de para qué sirve cada uno:
 *
 * 1. **Éste tiene marcadores y aquél no.** El del panel existe para elegir *un*
 *    punto, y por eso su pin está clavado al centro del contenedor: durante el
 *    arrastre las coordenadas todavía son las de antes, así que un `<Marker>` se
 *    correría y saltaría al soltar. Acá los marcadores son negocios que ya
 *    tienen su lugar, y no se mueven con el mapa.
 * 2. **Un solo estilo.** Este sitio no tiene modo oscuro, así que no hay que
 *    elegir mapa según el tema.
 *
 * **Sin token no se renderiza el mapa** sino un aviso: un `<Map>` sin
 * credenciales queda gris y se lee como un error de red. Y la página que lo use
 * tiene que poder vivir sin él —el buscador con una lista, la reserva con su
 * imagen estática—, porque el token es opcional a propósito.
 *
 * **Se carga con `dynamic(..., { ssr: false })`** desde donde se use:
 * `mapbox-gl` toca `window` al importarse.
 */
export function InteractiveMap({
	initialCenter,
	zoom = DEFAULT_ZOOM,
	pins = [],
	flyTo,
	className,
	onSelect,
	onMoveEnd,
}: {
	/** Dónde abre. Sólo se lee al montar; después manda el propio mapa. */
	initialCenter: Coordinates;
	zoom?: number;
	pins?: MapPin[];
	flyTo?: FlyTarget | null;
	className?: string;
	/** Tocaron un marcador. */
	onSelect?: (id: string) => void;
	/** El mapa dejó de moverse: sirve para "buscar en esta zona". */
	onMoveEnd?: (center: Coordinates) => void;
}) {
	const mapRef = useRef<MapRef | null>(null);

	useEffect(() => {
		if (!flyTo) return;

		mapRef.current?.flyTo({
			center: [flyTo.longitude, flyTo.latitude],
			zoom,
			essential: true,
		});
	}, [flyTo, zoom]);

	if (!MAPBOX_PUBLIC_TOKEN) {
		return (
			<div
				className={cn(
					'flex items-center justify-center rounded-2xl bg-paper-200 px-6 text-center',
					className,
				)}
			>
				<p className="text-sm text-ink-600">{copy.notConfigured}</p>
			</div>
		);
	}

	/*
	 * El `className` va en un contenedor y no en `<Map>`: react-map-gl v8 sólo
	 * acepta `style`, y así el mapa y el aviso de "sin token" tienen la misma
	 * forma —la página no salta cuando falta la credencial—.
	 */
	return (
		<div className={className}>
			<Map
				ref={mapRef}
				mapboxAccessToken={MAPBOX_PUBLIC_TOKEN}
				mapStyle={MAPBOX_PUBLIC_STYLE}
				initialViewState={{
					latitude: initialCenter.latitude,
					longitude: initialCenter.longitude,
					zoom,
				}}
				style={{ width: '100%', height: '100%' }}
				/*
				 * La rueda hace zoom, y los botones también existen: en táctil y con
				 * teclado son la única vía, y hay gente cuyo mouse no tiene rueda. Es
				 * la misma razón por la que el carrusel de fotos tiene flechas.
				 */
				scrollZoom
				dragRotate={false}
				pitchWithRotate={false}
				touchPitch={false}
				onMoveEnd={(event) =>
					onMoveEnd?.({
						latitude: event.viewState.latitude,
						longitude: event.viewState.longitude,
					})
				}
			>
				<NavigationControl position="top-right" showCompass={false} />

				{pins.map((pin) => (
					<Marker
						key={pin.id}
						latitude={pin.latitude}
						longitude={pin.longitude}
						anchor="bottom"
						onClick={(event) => {
							// Sin esto, el clic llega al mapa y además lo desplaza.
							event.originalEvent.stopPropagation();
							onSelect?.(pin.id);
						}}
					>
						<button
							type="button"
							aria-label={copy.pinLabel(pin.label)}
							className={cn(
								'grid size-8 cursor-pointer place-items-center rounded-full text-xs font-semibold shadow-md ring-2 ring-white transition-transform',
								pin.active
									? 'scale-110 bg-accent-600 text-white'
									: 'bg-ink-950 text-white hover:scale-105',
							)}
						>
							{pin.label}
						</button>
					</Marker>
				))}
			</Map>
		</div>
	);
}

export default InteractiveMap;

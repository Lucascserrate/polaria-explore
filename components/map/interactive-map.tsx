'use client';

// Sin esto, el canvas y los controles se dibujan sin estilos.
import 'mapbox-gl/dist/mapbox-gl.css';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import Map, {
	Marker,
	NavigationControl,
	type MapRef,
} from 'react-map-gl/mapbox';
import { MAPBOX_PUBLIC_STYLE, MAPBOX_PUBLIC_TOKEN } from '@/config/map';
import { map as copy } from '@/content/map';
import { cn } from '@/lib/utils';

export interface Coordinates {
	latitude: number;
	longitude: number;
}

/** El rectángulo que se está viendo, en grados. */
export interface Bounds {
	north: number;
	south: number;
	east: number;
	west: number;
}

/**
 * Lo que el mapa está mostrando, para quien necesite seguirlo.
 *
 * Van los límites **y** el centro con el zoom porque se usan para dos cosas
 * distintas y ninguna se deriva bien de la otra: los límites deciden qué
 * negocios entran en la lista, y el centro con el zoom es lo que se escribe en
 * la URL. Calcular los límites desde el centro exigiría saber cuántos píxeles
 * mide el panel, que es justo lo que el servidor no sabe.
 */
export interface Viewport {
	bounds: Bounds;
	center: Coordinates;
	zoom: number;
}

/**
 * Un negocio en el mapa. `id` es lo que vuelve en `onSelect`.
 *
 * El marcador es una pastilla apaisada con una punta abajo, y la punta es el
 * punto: por eso el ancla es `bottom` y no `center`. Apaisada porque adentro va
 * un dibujo ancho y no una letra, y sin aro blanco porque el contorno le sumaba
 * dos píxeles de nada a una forma que ya se despega del mapa por su sombra.
 */
export interface MapPin extends Coordinates {
	id: string;
	label: string;
	icon?: ReactNode;
	/**
	 * El que está abierto: se dibuja más grande, y nada más.
	 *
	 * **Por tamaño y no por color.** Sobre un mapa, un marcador de otro color se
	 * lee como otra cosa —otra categoría, un aviso, algo cerrado— y no como el
	 * que se acaba de tocar. El más grande es el mismo objeto un paso adelante,
	 * que es exactamente lo que pasó. Además el color acá está reservado para el
	 * mapa de abajo, que es lo único que lo tiene en toda la pantalla.
	 *
	 * Es el mismo gesto que el `hover`, un escalón más: pasar por encima levanta
	 * un poco, tocar lo deja levantado. Así se entiende sin leer nada que el
	 * grande es el elegido y no una clase distinta de negocio.
	 */
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
	onDeselect,
	onViewportChange,
	children,
}: {
	/** Dónde abre. Sólo se lee al montar; después manda el propio mapa. */
	initialCenter: Coordinates;
	zoom?: number;
	pins?: MapPin[];
	flyTo?: FlyTarget | null;
	className?: string;
	/** Tocaron un marcador. */
	onSelect?: (id: string) => void;
	onDeselect?: () => void;
	/**
	 * El mapa se quedó quieto y esto es lo que se está viendo.
	 *
	 * Se dispara con `idle`, que es el único evento que cubre los tres casos que
	 * importan con la misma cuenta: terminó de abrir, terminó un gesto, y cambió
	 * de tamaño el contenedor. Escuchar `load` y `moveend` por separado deja
	 * afuera justamente el tercero, que acá pasa seguido porque el panel del mapa
	 * se muestra y se esconde.
	 *
	 * Quien lo reciba tiene que amortiguarlo: un zoom con la rueda son varios
	 * `idle` seguidos.
	 */
	onViewportChange?: (viewport: Viewport) => void;
	children?: ReactNode;
}) {
	const mapRef = useRef<MapRef | null>(null);
	const boxRef = useRef<HTMLDivElement | null>(null);

	/**
	 * Lo que se está viendo, si es que se está viendo algo.
	 *
	 * El `if` del lienzo en cero no es defensivo porque sí: el mapa se monta
	 * dentro de un contenedor en `display: none` —en el teléfono la lista abre
	 * primero— y ahí `getBounds()` devuelve un rectángulo de área cero. Emitirlo
	 * dejaría la lista de al lado sin un solo resultado antes de que nadie haya
	 * visto el mapa. Cuando el contenedor aparece, el `ResizeObserver` mide y
	 * vuelve a preguntar.
	 */
	const readViewport = useCallback(() => {
		const map = mapRef.current;
		if (!map || !onViewportChange) return;

		const canvas = map.getCanvas();
		if (!canvas.width || !canvas.height) return;

		const bounds = map.getBounds();
		if (!bounds) return;

		const center = map.getCenter();

		onViewportChange({
			bounds: {
				north: bounds.getNorth(),
				south: bounds.getSouth(),
				east: bounds.getEast(),
				west: bounds.getWest(),
			},
			center: { latitude: center.lat, longitude: center.lng },
			zoom: map.getZoom(),
		});
	}, [onViewportChange]);

	/**
	 * Volver a medir el contenedor cuando cambia de tamaño.
	 *
	 * Mapbox mide una sola vez, al montar, y después sólo escucha el `resize` de
	 * la ventana. Alcanza mientras el mapa esté a la vista desde el principio;
	 * no alcanza acá, donde el panel se muestra y se esconde con CSS: si el mapa
	 * se monta dentro de un contenedor en `display: none` —que es lo que pasa en
	 * el teléfono, donde la lista abre primero— el lienzo nace con la medida
	 * equivocada y se queda así. Se ve como un mapa recortado, con franjas
	 * blancas al costado y abajo, sin ningún error en la consola.
	 *
	 * Un `ResizeObserver` también cubre lo que la ventana no avisa: el panel que
	 * pasa de media pantalla a pantalla completa, y el que vuelve de estar
	 * escondido.
	 */
	useEffect(() => {
		const box = boxRef.current;
		if (!box || typeof ResizeObserver === 'undefined') return;

		const observer = new ResizeObserver(() => {
			mapRef.current?.resize();
			/*
			 * Y avisar qué se ve ahora, que es lo que acaba de cambiar. `resize()`
			 * actualiza la vista en el momento pero no siempre dispara `idle`, así
			 * que sin esto un panel que aparece deja la lista filtrada por los
			 * límites que tenía cuando estaba escondido.
			 */
			readViewport();
		});
		observer.observe(box);

		return () => observer.disconnect();
	}, [readViewport]);

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
		<div ref={boxRef} className={className}>
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
				onIdle={readViewport}
				onClick={() => onDeselect?.()}
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
							aria-expanded={pin.active ?? false}
							className={cn(
								'relative block cursor-pointer pb-1.5 drop-shadow-md transition-transform',
								'origin-bottom',
								pin.active ? 'scale-125' : 'hover:scale-110',
							)}
						>
							<span className="flex h-5.5 items-center justify-center rounded-full bg-ink-950 px-2.5 text-white">
								{pin.icon}
							</span>

							<span
								aria-hidden
								className="absolute bottom-0 left-1/2 size-0 -translate-x-1/2 border-x-4 border-x-transparent border-t-[6px] border-t-ink-950"
							/>
						</button>
					</Marker>
				))}
				{children}
			</Map>
		</div>
	);
}

export default InteractiveMap;

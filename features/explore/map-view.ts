import type { Coordinates } from '@/components/map/interactive-map';

/** Dónde abre el mapa del buscador. */
export type MapView = { center: Coordinates; zoom: number };

/**
 * El tamaño con el que se calcula el encuadre inicial.
 *
 * Es una suposición y no una medida: el encuadre se decide en el servidor, que
 * no sabe cuánto mide el panel del mapa en la pantalla de nadie. Medirlo en el
 * navegador significaría dibujar el mapa dos veces —una mal y otra bien— y ver
 * el salto. Con estos números el resultado entra holgado en cualquier panel de
 * escritorio; en uno más chico se ve un poco menos que todo, que es exactamente
 * lo que arregla arrastrar.
 */
const ASSUMED_PANE = { width: 900, height: 800 };

/** Mapbox sirve tiles de 512px, y de ahí sale la escala de cada nivel de zoom. */
const TILE_SIZE = 512;

/** Un poco menos de zoom del que entra justo, para que nada quede pegado al borde. */
const PADDING_ZOOM = 0.5;

/**
 * Ni tan lejos que se vea el continente, ni tan cerca que un solo negocio
 * llene la pantalla y no se entienda en qué ciudad está.
 */
const MIN_ZOOM = 9;
const MAX_ZOOM = 15;

/** Un solo negocio: barrio, no cuadra. La dirección escrita dice el número. */
const SINGLE_POINT_ZOOM = 14;

/**
 * El encuadre que muestra a todos los negocios ubicados.
 *
 * Devuelve `null` cuando no hay ninguno con coordenadas, y ése es el caso que
 * decide si la página dibuja el mapa: un mapa sin marcadores no es un mapa
 * vacío, es una pantalla que no sirve para nada. Ver `ExploreLayout`.
 *
 * No hay un centro por defecto —ni Santa Cruz ni ninguna otra ciudad— a
 * propósito: el primer negocio de otro país abriría el mapa en el lugar
 * equivocado y nadie se enteraría.
 */
export function fitView(points: Coordinates[]): MapView | null {
	if (points.length === 0) return null;

	const latitudes = points.map((point) => point.latitude);
	const longitudes = points.map((point) => point.longitude);

	const north = Math.max(...latitudes);
	const south = Math.min(...latitudes);
	const east = Math.max(...longitudes);
	const west = Math.min(...longitudes);

	const center = {
		latitude: (north + south) / 2,
		longitude: (east + west) / 2,
	};

	const latitudeSpan = north - south;
	const longitudeSpan = east - west;

	if (latitudeSpan === 0 && longitudeSpan === 0) {
		return { center, zoom: SINGLE_POINT_ZOOM };
	}

	/*
	 * Un grado de longitud siempre mide lo mismo en el mapa; uno de latitud, no:
	 * Mercator los estira a medida que se sube. `cos(latitud)` es esa corrección,
	 * y sin ella el encuadre de una ciudad lejana al ecuador queda corto.
	 */
	const stretch = Math.cos((center.latitude * Math.PI) / 180);

	const zoom = Math.min(
		zoomFor(longitudeSpan, ASSUMED_PANE.width),
		zoomFor(latitudeSpan / (stretch || 1), ASSUMED_PANE.height),
	);

	return {
		center,
		zoom: clamp(zoom - PADDING_ZOOM, MIN_ZOOM, MAX_ZOOM),
	};
}

/** El zoom al que `span` grados entran justo en `pixels`. */
const zoomFor = (span: number, pixels: number) =>
	span <= 0 ? MAX_ZOOM : Math.log2((pixels * 360) / (TILE_SIZE * span));

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), max);

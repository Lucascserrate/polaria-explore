import type { Coordinates } from '@/components/map/interactive-map';
import type { MapView } from './map-view';

/**
 * Dónde está mirando el mapa, escrito en la URL.
 *
 * Sirve para lo de siempre que sirve una URL: se comparte, se guarda en
 * favoritos y sobrevive a un F5. "Mirá las barberías de esta zona" es un enlace
 * y no una explicación de cómo arrastrar hasta ahí.
 *
 * Tres parámetros sueltos y no uno con comas: `?lat=-17.7466&lng=-63.1671&z=13`
 * se lee de un vistazo en la barra de direcciones y cada valor se valida por su
 * cuenta. Cinco decimales son poco más de un metro, que es más precisión de la
 * que tiene el gesto de arrastrar un mapa.
 */
export const MAP_PARAMS = ['lat', 'lng', 'z'] as const;

const PRECISION = 5;

/** Rango de zoom que acepta Mapbox. Fuera de esto la URL está inventada. */
const ZOOM_RANGE = { min: 0, max: 22 };

type RawParams = Record<string, string | string[] | undefined>;

/**
 * El encuadre que pide la URL, o `null` si no pide ninguno.
 *
 * Devuelve `null` ante cualquier cosa rara —falta un parámetro, hay letras, la
 * latitud dice 500— en lugar de arreglarla a medias. La página tiene un
 * encuadre por defecto que funciona (ver `fitView`), y usarlo es mejor que
 * abrir el mapa en el Golfo de Guinea porque alguien recortó mal un enlace.
 */
export function readMapView(params: RawParams): MapView | null {
	const latitude = readNumber(params.lat, -90, 90);
	const longitude = readNumber(params.lng, -180, 180);
	const zoom = readNumber(params.z, ZOOM_RANGE.min, ZOOM_RANGE.max);

	if (latitude === null || longitude === null || zoom === null) return null;

	return { center: { latitude, longitude }, zoom };
}

/**
 * Deja el encuadre en la barra de direcciones, sin recargar nada.
 *
 * Usa `history.replaceState` y no el router de Next a propósito. `router.replace`
 * pediría el árbol del servidor de nuevo en **cada** movimiento del mapa, y este
 * filtro es de navegador: los negocios ya están todos acá. Y `replace` y no
 * `push` porque cada arrastre no es un paso atrás: si lo fuera, salir del
 * buscador serían treinta toques del botón de volver.
 *
 * Conserva el resto de la consulta —el rubro, sobre todo— leyendo la que hay en
 * la barra en este momento y no una copia del render.
 */
export function writeMapView(center: Coordinates, zoom: number): void {
	const params = new URLSearchParams(window.location.search);

	params.set('lat', center.latitude.toFixed(PRECISION));
	params.set('lng', center.longitude.toFixed(PRECISION));
	params.set('z', zoom.toFixed(2));

	window.history.replaceState(
		null,
		'',
		`${window.location.pathname}?${params}`,
	);
}

const readNumber = (
	value: string | string[] | undefined,
	min: number,
	max: number,
): number | null => {
	if (typeof value !== 'string') return null;

	const parsed = Number(value);

	return Number.isFinite(parsed) && parsed >= min && parsed <= max
		? parsed
		: null;
};

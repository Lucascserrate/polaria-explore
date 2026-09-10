import type { Bounds, Coordinates } from '@/components/map/interactive-map';
import type { PublicBusinessSummary } from '@/services/explore/types';

/**
 * Si un punto cae adentro de lo que se está viendo.
 *
 * El `if` de la longitud es por el antimeridiano: cuando el mapa cruza el 180°,
 * el borde oeste queda con un número **mayor** que el este (por ejemplo, de 170
 * a -170) y la comparación de siempre no devuelve nada. Bolivia no llega ahí,
 * pero un mapa que se arrastra sin tope sí, y el síntoma —una lista que se
 * vacía sola en un lugar puntual del planeta— es de los que nadie encuentra.
 */
export function inBounds(point: Coordinates, bounds: Bounds): boolean {
	const withinLatitude =
		point.latitude >= bounds.south && point.latitude <= bounds.north;

	if (!withinLatitude) return false;

	return bounds.west <= bounds.east
		? point.longitude >= bounds.west && point.longitude <= bounds.east
		: point.longitude >= bounds.west || point.longitude <= bounds.east;
}

/**
 * Los negocios que entran en lo que muestra el mapa.
 *
 * **Sin límites todavía devuelve todo**, y ése es el caso que hay que entender:
 * pasa mientras el mapa abre, pasa cuando el mapa está escondido, y pasa
 * siempre para quien tiene el JavaScript apagado. La lista completa es la
 * respuesta honesta a "no sé qué se está mirando", y es también la que llega en
 * el HTML del servidor.
 *
 * Los negocios **sin coordenadas quedan afuera** mientras haya límites, y no es
 * un descuido: si la lista dice ser lo que hay en esta zona, un negocio que no
 * declaró dónde está no puede afirmarse que esté acá. Vuelven a aparecer apenas
 * se esconde el mapa, donde la lista es la lista y nada más.
 */
export function visibleIn(
	businesses: PublicBusinessSummary[],
	bounds: Bounds | null,
): PublicBusinessSummary[] {
	if (!bounds) return businesses;

	return businesses.filter(
		(business) => business.location && inBounds(business.location, bounds),
	);
}

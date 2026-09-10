import { home } from '@/content/home';
import type { BusinessTypeOption } from '@/features/explore/components/BusinessTypeFilter';
import type { PublicBusinessSummary } from '@/services/explore/types';

/**
 * Un negocio, con lo poco que necesita para aparecer en el desplegable.
 *
 * El listado completo trae la portada con sus medidas y el logo; nada de eso se
 * dibuja en una fila de treinta píxeles de alto, y todo viaja al navegador
 * porque el desplegable es cliente. Así que la página manda esto y no
 * `PublicBusinessSummary`.
 */
export type SearchBusiness = {
	slug: string;
	name: string;
	/** El código del rubro, sólo para elegir el icono de la fila. */
	type: string | null;
	address: string | null;
};

export const toSearchBusiness = (
	business: PublicBusinessSummary,
): SearchBusiness => ({
	slug: business.slug,
	name: business.name,
	type: business.businessType,
	address: business.address,
});

/** Una fila del desplegable. Todas llevan a algún lado: no hay filas inertes. */
export type SearchOption =
	| { kind: 'all'; key: string; href: string; label: string }
	| { kind: 'type'; key: string; href: string; label: string; type: string }
	| {
			kind: 'business';
			key: string;
			href: string;
			label: string;
			type: string | null;
			hint: string | null;
	  };

/** Un bloque con su título. `label: null` es el bloque sin título de arriba. */
export type SearchGroup = { label: string | null; options: SearchOption[] };

/**
 * Cuántos negocios se listan por nombre.
 *
 * Es un desplegable, no la pantalla de resultados: para eso está `/explore`, y
 * seis filas es lo que se ve sin desplazar dentro del panel.
 */
const MAX_BUSINESSES = 6;

/**
 * Sin acentos y en minúsculas, para comparar lo que alguien escribe.
 *
 * Nadie escribe "depilación" con tilde en un buscador, y "Peluqueria" tiene que
 * encontrar "Peluquería". Es lo mínimo para que el campo no parezca roto.
 */
const normalize = (value: string) =>
	value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim();

const businessOption = (business: SearchBusiness): SearchOption => ({
	kind: 'business',
	key: `business:${business.slug}`,
	href: `/${business.slug}`,
	label: business.name,
	type: business.type,
	hint: business.address,
});

const typeOption = (option: BusinessTypeOption): SearchOption => ({
	kind: 'type',
	key: `type:${option.type}`,
	href: `/explore?rubro=${encodeURIComponent(option.type)}`,
	label: option.label,
	type: option.type,
});

const allOption = (): SearchOption => ({
	kind: 'all',
	key: 'all',
	href: '/explore',
	label: home.search.all,
});

/**
 * Qué se ve en el desplegable, según lo que haya escrito.
 *
 * **Cerrado, ofrece rubros; escribiendo, además busca negocios por nombre.** Es
 * la forma de la referencia —se aprieta el campo y baja una lista de categorías,
 * no un cursor esperando una palabra— y acá tiene una razón de más: la API sabe
 * filtrar por rubro y todavía no por texto, así que un rubro elegido de la lista
 * es una búsqueda que existe. Los nombres, en cambio, ya llegaron todos en el
 * render del servidor, y por eso buscar entre ellos no le pide nada a nadie: son
 * veinte comparaciones en el mismo cuadro, y un negocio encontrado por nombre no
 * va a los resultados sino directo a su página, que es donde se reserva.
 *
 * **Los rubros son los que existen**, la misma regla que los chips de
 * `/explore`: salen de los negocios cargados y no del catálogo. Y con menos de
 * dos, la lista de rubros se cae —"Todos los negocios" y un único rubro son la
 * misma lista dos veces— y su lugar lo ocupan los negocios, para que apretar el
 * campo no abra un panel de un solo renglón.
 */
export function searchOptions({
	query,
	types,
	businesses,
}: {
	query: string;
	types: BusinessTypeOption[];
	businesses: SearchBusiness[];
}): SearchGroup[] {
	const term = normalize(query);

	if (!term) {
		const groups: SearchGroup[] = [{ label: null, options: [allOption()] }];

		if (types.length >= 2) {
			groups.push({
				label: home.search.groups.types,
				options: types.map(typeOption),
			});
		} else if (businesses.length) {
			groups.push({
				label: home.search.groups.businesses,
				options: businesses.slice(0, MAX_BUSINESSES).map(businessOption),
			});
		}

		return groups;
	}

	const matchedTypes = types.filter((option) =>
		normalize(option.label).includes(term),
	);

	const matchedBusinesses = businesses
		.filter((business) => normalize(business.name).includes(term))
		.slice(0, MAX_BUSINESSES);

	return [
		{ label: home.search.groups.types, options: matchedTypes.map(typeOption) },
		{
			label: home.search.groups.businesses,
			options: matchedBusinesses.map(businessOption),
		},
	].filter((group) => group.options.length > 0);
}

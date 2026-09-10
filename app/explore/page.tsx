import type { Metadata } from 'next';
import { explore } from '@/content/explore';
import { BusinessTypeFilter } from '@/features/explore/components/BusinessTypeFilter';
import { ExploreLayout } from '@/features/explore/components/ExploreLayout';
import { readMapView } from '@/features/explore/map-url';
import { fitView } from '@/features/explore/map-view';
import { typeOptions } from '@/features/explore/type-options';
import { listBusinesses } from '@/services/explore/server/businesses';
import { hasLocation } from '@/services/explore/types';

/**
 * El buscador del marketplace.
 *
 * Vive en `/explore` y no en la raíz: la raíz va a ser la puerta de entrada,
 * con su barra de búsqueda, y esto es la pantalla de resultados. Cada ruta
 * estática de este dominio es un slug menos disponible para un negocio, así que
 * `explore` está reservado del lado de la API (`RESERVED_SLUGS`).
 *
 * La página no dibuja: ordena. Pide la lista, decide qué rubro se está mirando,
 * calcula el encuadre del mapa y entrega las tres cosas a `ExploreLayout`. Lo
 * que no puede resolver acá es qué negocios entran en la pantalla del mapa: eso
 * depende de cuántos píxeles mide el panel, que sólo sabe el navegador.
 */
export const metadata: Metadata = {
	title: explore.metaTitle,
	description: explore.metaDescription,
	alternates: { canonical: '/explore' },
};

type SearchParams = { rubro?: string; lat?: string; lng?: string; z?: string };

export default async function ExplorePage({
	searchParams,
}: {
	searchParams: Promise<SearchParams>;
}) {
	const [params, businesses] = await Promise.all([
		searchParams,
		listBusinesses(),
	]);

	const options = typeOptions(businesses);

	/*
	 * Un `?rubro=` que no está entre las opciones se ignora y se muestra todo,
	 * en lugar de devolver una lista vacía: la URL la escribe gente, la copia y
	 * la pega, y un rubro que dejó de tener negocios no tiene por qué verse como
	 * un buscador roto.
	 */
	const selected =
		params.rubro && options.some((option) => option.type === params.rubro)
			? params.rubro
			: null;

	const shown = selected
		? businesses.filter((business) => business.businessType === selected)
		: businesses;

	const located = shown.filter(hasLocation);

	/*
	 * El encuadre lo manda la URL si lo trae —así un enlace compartido abre
	 * donde lo dejaron— y si no, el que muestra a todos los negocios ubicados.
	 */
	const view =
		readMapView(params) ?? fitView(located.map((business) => business.location));

	return (
		<ExploreLayout
			businesses={shown}
			located={located}
			filter={<BusinessTypeFilter options={options} selected={selected} />}
			filtered={selected !== null}
			view={view}
		/>
	);
}

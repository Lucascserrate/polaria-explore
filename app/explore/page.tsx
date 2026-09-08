import type { Metadata } from 'next';
import type { MapPin } from '@/components/map/interactive-map';
import { explore } from '@/content/explore';
import { BusinessCard } from '@/features/explore/components/BusinessCard';
import { BusinessTypeFilter } from '@/features/explore/components/BusinessTypeFilter';
import { ExploreLayout } from '@/features/explore/components/ExploreLayout';
import { fitView } from '@/features/explore/map-view';
import { typeOptions } from '@/features/explore/type-options';
import { initials } from '@/lib/initials';
import { listBusinesses } from '@/services/explore/server/businesses';
import type { PublicBusinessSummary } from '@/services/explore/types';

/**
 * El buscador del marketplace.
 *
 * Vive en `/explore` y no en la raíz: la raíz va a ser la puerta de entrada,
 * con su barra de búsqueda, y esto es la pantalla de resultados. Cada ruta
 * estática de este dominio es un slug menos disponible para un negocio, así que
 * `explore` está reservado del lado de la API (`RESERVED_SLUGS`).
 *
 * La página no dibuja: ordena. Pide la lista, decide qué rubro se está mirando
 * y arma las tres cosas que la pantalla necesita —las tarjetas, los chips y los
 * marcadores—. Lo único que no puede resolver acá es mostrar u ocultar el mapa,
 * que es estado del navegador y vive en `ExploreLayout`.
 */
export const metadata: Metadata = {
	title: explore.metaTitle,
	description: explore.metaDescription,
	alternates: { canonical: '/explore' },
};

export default async function ExplorePage({
	searchParams,
}: {
	searchParams: Promise<{ rubro?: string }>;
}) {
	const [{ rubro }, businesses] = await Promise.all([
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
		rubro && options.some((option) => option.type === rubro) ? rubro : null;

	const shown = selected
		? businesses.filter((business) => business.businessType === selected)
		: businesses;

	const pins = shown.filter(hasLocation).map(toPin);

	return (
		<ExploreLayout
			count={shown.length}
			filter={<BusinessTypeFilter options={options} selected={selected} />}
			view={fitView(pins)}
			pins={pins}
			empty={
				shown.length > 0
					? undefined
					: selected
						? explore.empty.filtered
						: explore.empty.all
			}
		>
			{shown.map((business) => (
				<BusinessCard key={business.slug} business={business} />
			))}
		</ExploreLayout>
	);
}

/** Un negocio que sí tiene coordenadas, para que el marcador no tenga que dudar. */
type Located = PublicBusinessSummary & {
	location: NonNullable<PublicBusinessSummary['location']>;
};

const hasLocation = (business: PublicBusinessSummary): business is Located =>
	business.location !== null;

/**
 * El marcador lleva las iniciales del negocio.
 *
 * No hay puntaje que mostrar —Polaria no tiene reseñas— y un mapa de círculos
 * idénticos obliga a tocarlos de a uno para saber cuál es cuál. Las iniciales
 * no identifican a nadie con certeza, pero alcanzan para volver a encontrar el
 * que ya se miró. El nombre completo lo dice la etiqueta accesible.
 */
const toPin = (business: Located): MapPin => ({
	id: business.slug,
	label: initials(business.name),
	latitude: business.location.latitude,
	longitude: business.location.longitude,
});

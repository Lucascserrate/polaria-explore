import Link from 'next/link';
import { businessTypeLabel } from '@/content/business-types';
import type { PublicBusinessSummary } from '@/services/explore/types';
import { BusinessMedia } from './BusinessMedia';

/**
 * Qué ancho ocupa la tarjeta en cada pantalla, para que el navegador baje la
 * foto del tamaño que va a dibujar y no la de 2000px que subió el dueño.
 *
 * Los números siguen a la grilla de `ExploreLayout`: una columna en el
 * teléfono, dos hasta que aparece el mapa, y de ahí en adelante siempre
 * alrededor de 280px —tres columnas dentro de los 855px de la lista, o dos
 * columnas en la mitad de pantalla que queda junto al mapa—. Es una
 * aproximación a propósito: `sizes` no tiene que ser exacto, tiene que evitar
 * que se baje una imagen diez veces más grande de lo necesario.
 */
const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px';

/**
 * Un negocio en el listado: la foto, el nombre, dónde está y de qué es.
 *
 * Componente de servidor, como casi todo: no tiene estado. Lo único que hace es
 * llevar a `polariahq.com/[slug]`, que es la página que sí sabe reservar.
 *
 * No hay estrellas ni reseñas porque Polaria no las tiene. Inventar un "4,9"
 * sería lo peor que puede hacer un listado de negocios reales.
 *
 * **La foto va apaisada (16:9) y no en 4:3.** Es la proporción de la
 * referencia, y la razón es cuántas tarjetas entran en la primera pantalla: en
 * 4:3 cada fila come un tercio más de alto y la lista al lado del mapa muestra
 * dos filas donde entraban tres. Lo que hay que comparar acá es varios negocios
 * a la vez; la foto grande es la de la página del negocio.
 */
export function BusinessCard({
	business,
}: {
	business: PublicBusinessSummary;
}) {
	const typeLabel = businessTypeLabel(business.businessType);

	return (
		<li>
			<Link
				href={`/${business.slug}`}
				className="group block rounded-2xl focus-visible:outline-offset-4"
			>
				<div className="relative aspect-16/9 overflow-hidden rounded-2xl bg-paper-200">
					<BusinessMedia business={business} sizes={CARD_SIZES} />
				</div>

				<h2 className="mt-3 truncate text-[0.9375rem] font-medium text-ink-950">
					{business.name}
				</h2>

				{business.address && (
					<p className="mt-0.5 truncate text-sm text-ink-600">
						{business.address}
					</p>
				)}

				{typeLabel && (
					<p className="mt-0.5 truncate text-sm text-ink-500">{typeLabel}</p>
				)}
			</Link>
		</li>
	);
}

export default BusinessCard;

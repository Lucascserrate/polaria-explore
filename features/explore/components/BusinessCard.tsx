import Image from 'next/image';
import Link from 'next/link';
import { businessTypeLabel } from '@/content/business-types';
import { initials } from '@/lib/initials';
import type { PublicBusinessSummary } from '@/services/explore/types';

/**
 * Qué ancho ocupa la tarjeta en cada pantalla, para que el navegador baje la
 * foto del tamaño que va a dibujar y no la de 2000px que subió el dueño.
 *
 * Los números siguen a la grilla de `ExploreLayout` —una columna en el
 * teléfono, dos junto al mapa, hasta cuatro sin él— y son una aproximación a
 * propósito: `sizes` no tiene que ser exacto, tiene que evitar que se baje una
 * imagen diez veces más grande de lo necesario.
 */
const CARD_SIZES = '(max-width: 640px) 100vw, (max-width: 1280px) 45vw, 24vw';

/**
 * Un negocio en el listado: la foto, el nombre, dónde está y de qué es.
 *
 * Componente de servidor, como casi todo: no tiene estado. Lo único que hace es
 * llevar a `polariahq.com/[slug]`, que es la página que sí sabe reservar.
 *
 * **Tres formas de tener imagen, y ninguna es un hueco gris.** La portada
 * —primera foto de la galería— es la buena y la tiene poca gente; sin ella
 * queda el logo, centrado sobre blanco en vez de recortado a sangre, porque un
 * logo estirado se ve roto; sin logo, la tarjeta negra con las iniciales, que
 * es la misma que usa la vista previa del enlace. La tercera no es un error:
 * hoy es el caso mayoritario, y la grilla tiene que verse terminada así.
 *
 * No hay estrellas ni reseñas porque Polaria no las tiene. Inventar un "4,9"
 * sería lo peor que puede hacer un listado de negocios reales.
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
				<div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-paper-200">
					<Media business={business} />
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

function Media({ business }: { business: PublicBusinessSummary }) {
	if (business.coverPhoto) {
		return (
			<Image
				src={business.coverPhoto.url}
				alt=""
				fill
				sizes={CARD_SIZES}
				className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-[1.03]"
			/>
		);
	}

	if (business.logoUrl) {
		return (
			<div className="absolute inset-0 bg-white ring-1 ring-paper-300 ring-inset">
				<Image
					src={business.logoUrl}
					alt=""
					fill
					sizes={CARD_SIZES}
					className="object-contain p-8"
				/>
			</div>
		);
	}

	return (
		<div className="absolute inset-0 grid place-items-center bg-ink-950">
			<span
				aria-hidden
				className="text-3xl font-semibold tracking-[-0.03em] text-paper-50"
			>
				{initials(business.name)}
			</span>
		</div>
	);
}

export default BusinessCard;

'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { businessTypeLabel } from '@/content/business-types';
import { explore } from '@/content/explore';
import type { LocatedBusiness } from '@/services/explore/types';
import { BusinessMedia } from './BusinessMedia';

/** Ancho del globo en escritorio; en el teléfono ocupa el ancho de la pantalla. */
const PREVIEW_SIZES = '(max-width: 1023px) 100vw, 264px';

/**
 * El negocio que se tocó en el mapa, sin salir del mapa.
 *
 * Es la misma información que la tarjeta de la lista y en el mismo orden —foto,
 * nombre, dirección, rubro—, con la misma regla de imagen (ver
 * `BusinessMedia`). Que se vean iguales es el punto: el mapa y la lista son dos
 * vistas de una misma cosa, y un negocio no debería parecer otro según por
 * dónde se lo mire.
 *
 * **Toda la tarjeta es el enlace**, menos la cruz. Quien la abrió ya eligió
 * mirar ese negocio; el siguiente gesto natural es entrar, no buscar un botón.
 *
 * La cruz es explícita aunque tocar el mapa también cierre: en el teléfono la
 * tarjeta tapa la parte de abajo del mapa, y "tocá el mapa" no se le ocurre a
 * nadie mientras busca dónde cerrar.
 */
export function MapPreviewCard({
	business,
	onClose,
}: {
	business: LocatedBusiness;
	onClose: () => void;
}) {
	const typeLabel = businessTypeLabel(business.businessType);

	return (
		<div className="relative overflow-hidden rounded-2xl bg-paper-50 shadow-xl ring-1 ring-paper-300">
			<Link href={`/${business.slug}`} className="group block">
				<div className="relative aspect-16/9 overflow-hidden bg-paper-200">
					<BusinessMedia business={business} sizes={PREVIEW_SIZES} />
				</div>

				<div className="p-3">
					<p className="truncate text-[0.9375rem] font-medium text-ink-950">
						{business.name}
					</p>

					{business.address && (
						<p className="mt-0.5 truncate text-sm text-ink-600">
							{business.address}
						</p>
					)}

					{typeLabel && (
						<p className="mt-0.5 truncate text-sm text-ink-500">{typeLabel}</p>
					)}
				</div>
			</Link>

			<button
				type="button"
				onClick={onClose}
				aria-label={explore.map.closePreview}
				className="absolute top-2 right-2 grid size-8 cursor-pointer place-items-center rounded-full bg-paper-50/90 text-ink-900 shadow-md backdrop-blur-sm transition-colors hover:bg-paper-50"
			>
				<X aria-hidden className="size-4" strokeWidth={2} />
			</button>
		</div>
	);
}

export default MapPreviewCard;

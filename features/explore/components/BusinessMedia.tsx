import Image from 'next/image';
import { initials } from '@/lib/initials';
import type { PublicBusinessSummary } from '@/services/explore/types';

/**
 * La imagen de un negocio, con sus tres caídas.
 *
 * **La portada** —primera foto de la galería— es la buena y la tiene poca
 * gente. **Sin portada, el logo**, centrado sobre blanco en vez de recortado a
 * sangre, porque un logo estirado se ve roto. **Sin logo, la tarjeta negra con
 * las iniciales**, que es la misma que usa la vista previa del enlace en
 * WhatsApp. La tercera no es un error: hoy es el caso mayoritario, y todo lo
 * que muestre negocios tiene que verse terminado así.
 *
 * Está acá y no adentro de la tarjeta porque lo usan dos —la lista y el globo
 * del mapa— y dos copias de esta regla significarían que el mismo negocio se ve
 * distinto según por dónde se lo mire.
 */
export function BusinessMedia({
	business,
	sizes,
}: {
	business: PublicBusinessSummary;
	/** Cuánto va a medir en pantalla, para no bajar una foto diez veces más grande. */
	sizes: string;
}) {
	if (business.coverPhoto) {
		return (
			<Image
				src={business.coverPhoto.url}
				alt=""
				fill
				sizes={sizes}
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
					sizes={sizes}
					className="object-contain p-6"
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

export default BusinessMedia;

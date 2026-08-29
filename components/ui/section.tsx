import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'white' | 'soft' | 'dark';

/**
 * El ritmo vertical de la página vive acá, en un solo lugar.
 *
 * Tres tonos y ninguno más: blanco por defecto, un gris casi imperceptible para
 * separar un bloque de su vecino, y negro para los dos momentos que tienen que
 * pesar —las cifras del hero y el cierre—. Que el negro aparezca dos veces es
 * lo que lo mantiene fuerte; si se usara en cada sección sería un fondo más.
 */
const tones: Record<Tone, string> = {
	white: 'bg-white text-ink-900',
	soft: 'bg-paper-200 text-ink-900',
	dark: 'bg-ink-950 text-white',
};

export function Section({
	id,
	tone = 'white',
	className,
	children,
	labelledBy,
}: {
	id?: string;
	tone?: Tone;
	className?: string;
	children: ReactNode;
	labelledBy?: string;
}) {
	return (
		<section
			id={id}
			aria-labelledby={labelledBy}
			// tabIndex -1 para que el foco aterrice acá al navegar por ancla.
			tabIndex={id ? -1 : undefined}
			className={cn(
				'scroll-mt-20 py-24 outline-none sm:py-32 lg:py-40',
				tones[tone],
				className,
			)}
		>
			{children}
		</section>
	);
}

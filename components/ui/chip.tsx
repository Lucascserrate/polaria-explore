import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Un rubro como enlace: la píldora con el icono y la etiqueta.
 *
 * Vive en `components/ui` y no en una de las dos pantallas porque las dos la
 * usan y tienen que verse igual: la fila de rubros de la raíz y el filtro de
 * `/explore` son el mismo control en dos momentos —antes y después de elegir—,
 * y dos copias de estas clases terminan siendo dos alturas distintas.
 *
 * **Siempre es un enlace, nunca un botón.** Elegir un rubro cambia de página, y
 * eso tiene que andar sin JavaScript, poder abrirse en otra pestaña y dejar el
 * botón de atrás funcionando. El estado activo lo pinta el relleno negro, que
 * es la única jerarquía que hay en una interfaz sin color.
 */
export function Chip({
	href,
	active = false,
	scroll,
	className,
	children,
}: {
	href: string;
	active?: boolean;
	/** `false` cuando la lista ya está a la vista y saltar arriba molesta. */
	scroll?: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<Link
			href={href}
			scroll={scroll}
			aria-current={active ? 'true' : undefined}
			className={cn(
				'flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm whitespace-nowrap transition-colors',
				active
					? 'border-ink-950 bg-ink-950 text-paper-50'
					: 'border-paper-300 text-ink-700 hover:border-paper-400 hover:bg-paper-200',
				className,
			)}
		>
			{children}
		</Link>
	);
}

export default Chip;

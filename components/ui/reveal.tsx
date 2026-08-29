'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Aparición al entrar en pantalla.
 *
 * El estado escondido vive en CSS y depende de la clase `js` del `<html>` (ver
 * `globals.css` y el script inline de `app/layout.tsx`), no de este componente.
 * Así, si JavaScript no corre o el observador falla, el contenido se ve igual:
 * el peor caso es una página sin animación, nunca una página en blanco.
 *
 * Una sola animación en todo el sitio, y un `delay` para escalonar hermanos.
 * Escalonar más de tres o cuatro elementos hace que el último llegue tarde y se
 * note el truco.
 */
export function Reveal({
	children,
	className,
	delay = 0,
	as: Tag = 'div',
}: {
	children: ReactNode;
	className?: string;
	/** Milisegundos de retraso, para escalonar hermanos. */
	delay?: number;
	as?: ElementType;
}) {
	const ref = useRef<HTMLElement>(null);

	useEffect(() => {
		const element = ref.current;
		if (!element) return;

		if (typeof IntersectionObserver === 'undefined') {
			element.dataset.reveal = 'shown';
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					element.dataset.reveal = 'shown';
					observer.disconnect();
				}
			},
			{ rootMargin: '0px 0px -12% 0px' },
		);

		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return (
		<Tag
			ref={ref}
			data-reveal=""
			style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
			className={cn(className)}
		>
			{children}
		</Tag>
	);
}

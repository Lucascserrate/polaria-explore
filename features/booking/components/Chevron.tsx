import { cn } from '@/lib/utils';

/**
 * Una flecha dibujada acá y no un icono de librería: es la única de la página.
 *
 * Vive en su propio archivo porque la usan las flechas del carrusel y las del
 * visor, que desde que existe el portfolio están en archivos distintos.
 */
export function Chevron({ className }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			className={cn('h-5 w-5', className)}
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m9 6 6 6-6 6" />
		</svg>
	);
}

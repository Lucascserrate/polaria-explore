import { cn } from '@/lib/utils';

/**
 * Wordmark provisional: la estrella polar y el nombre, en tinta.
 *
 * Es el mismo glifo que ya usa el panel, así que la landing y el producto
 * abren con la misma firma. Cuando llegue el logo definitivo se reemplaza sólo
 * este archivo.
 */
export function Logo({
	tone = 'dark',
	className,
}: {
	/** "dark" = tinta sobre blanco. "light" = blanco sobre negro. */
	tone?: 'dark' | 'light';
	className?: string;
}) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-2 text-[1.0625rem] font-semibold tracking-[-0.03em]',
				tone === 'dark' ? 'text-ink-950' : 'text-white',
				className,
			)}
		>
			<StarGlyph className="size-[1.05em] shrink-0" />
			<span className="leading-none">Polaria</span>
		</span>
	);
}

export function StarGlyph({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
			<path
				d="M12 1.5c.62 5.6 4.9 9.88 10.5 10.5-5.6.62-9.88 4.9-10.5 10.5-.62-5.6-4.9-9.88-10.5-10.5C7.1 11.38 11.38 7.1 12 1.5Z"
				fill="currentColor"
			/>
		</svg>
	);
}

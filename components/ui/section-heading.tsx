import type { ReactNode } from 'react';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';

/**
 * Encabezado de sección: título grande y, si hace falta, una bajada corta.
 *
 * No hay antetítulo. La referencia no usa ninguno y tenía razón: un rótulo en
 * versalitas arriba del título es una línea de texto que nadie lee y que le
 * roba aire al titular, que es lo único que hay que leer.
 *
 * La bajada es deliberadamente chica al lado del título. Ese salto de escala
 * —enorme contra tranquilo— es la mitad del carácter de la página.
 */
export function SectionHeading({
	id,
	title,
	lead,
	tone = 'light',
	align = 'center',
	className,
}: {
	id?: string;
	title: ReactNode;
	lead?: ReactNode;
	tone?: 'light' | 'dark';
	align?: 'center' | 'left';
	className?: string;
}) {
	const dark = tone === 'dark';

	return (
		<Reveal
			className={cn(
				'flex flex-col',
				align === 'center' ? 'items-center text-center' : 'items-start text-left',
				className,
			)}
		>
			<h2
				id={id}
				className={cn(
					'max-w-3xl text-[2rem] font-semibold leading-[1.05] sm:text-5xl',
					dark ? 'text-white' : 'text-ink-950',
				)}
			>
				{title}
			</h2>

			{lead && (
				<p
					className={cn(
						'mt-5 max-w-xl text-pretty leading-relaxed',
						dark ? 'text-white/60' : 'text-ink-600',
					)}
				>
					{lead}
				</p>
			)}
		</Reveal>
	);
}

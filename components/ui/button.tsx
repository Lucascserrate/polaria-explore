import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'onDark' | 'onDarkGhost';
type Size = 'sm' | 'md' | 'lg';

/**
 * Un botón, cuatro variantes, y ninguna de ellas tiene color.
 *
 * El primario es negro sólido y el secundario es blanco con una línea de 1px:
 * la jerarquía la da el relleno, no el tono. Es lo que hace que en una página
 * en blanco y negro se siga entendiendo cuál es la acción principal.
 */
const base =
	'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap ' +
	'transition-[background-color,color,box-shadow,transform] duration-200 ' +
	'ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.985] ' +
	'disabled:pointer-events-none disabled:opacity-40';

const variants: Record<Variant, string> = {
	primary: 'bg-ink-950 text-white hover:bg-ink-800',
	secondary:
		'bg-white text-ink-950 ring-1 ring-inset ring-paper-300 hover:bg-paper-200',
	onDark: 'bg-white text-ink-950 hover:bg-paper-200',
	onDarkGhost:
		'text-white ring-1 ring-inset ring-white/25 hover:bg-white/10 hover:ring-white/40',
};

const sizes: Record<Size, string> = {
	sm: 'h-9 px-4 text-sm',
	md: 'h-11 px-5 text-[0.9375rem]',
	lg: 'h-13 px-7 text-base',
};

type SharedProps = {
	variant?: Variant;
	size?: Size;
	className?: string;
	children: ReactNode;
};

type AsAnchor = SharedProps & { href: string } & Omit<
		AnchorHTMLAttributes<HTMLAnchorElement>,
		keyof SharedProps | 'href'
	>;

type AsButton = SharedProps & { href?: undefined } & Omit<
		ButtonHTMLAttributes<HTMLButtonElement>,
		keyof SharedProps
	>;

/** Renderiza `<a>` si recibe href, `<button>` si no. */
export function Button(props: AsAnchor | AsButton) {
	const { variant = 'primary', size = 'md', className, children, ...rest } = props;
	const classes = cn(base, variants[variant], sizes[size], className);

	if (rest.href !== undefined) {
		return (
			<a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
				{children}
			</a>
		);
	}

	// En esta rama `href` es undefined, así que React lo descarta al renderizar.
	return (
		<button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
			{children}
		</button>
	);
}

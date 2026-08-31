import type { SVGProps } from 'react';

/**
 * Iconografía propia, trazo de 1.5 y esquinas redondeadas.
 *
 * Son cinco y alcanzan. En una página en blanco y negro cada icono compite con
 * el texto, así que sólo sobreviven los que hacen falta para leer una acción o
 * una lista. `Storefront` es la excepción que confirma la regla: no acompaña a
 * ningún texto, va solo dentro del marcador del mapa, y ahí un icono no compite
 * con nada porque es lo único que hay.
 *
 * Nota deliberada: no usamos el logotipo de WhatsApp ni el de Google. Son
 * marcas registradas y reproducirlas insinúa una afiliación que no existe —
 * exactamente lo que hace fracasar una revisión de Meta. Los servicios se
 * nombran en texto.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			{children}
		</svg>
	);
}

export const ArrowRight = (p: IconProps) => (
	<Icon {...p}>
		<path d="M5 12h14M13 6l6 6-6 6" />
	</Icon>
);

export const Check = (p: IconProps) => (
	<Icon {...p}>
		<path d="m4.5 12.5 5 5 10-11" />
	</Icon>
);

export const ChevronDown = (p: IconProps) => (
	<Icon {...p}>
		<path d="m6 9.5 6 6 6-6" />
	</Icon>
);

export const ChatBubble = (p: IconProps) => (
	<Icon {...p}>
		<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.7 8.7 0 0 1-3.8-.9L3 21l1.9-5.6A8.7 8.7 0 0 1 4 11.5 8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
	</Icon>
);

/** El marcador del mapa: un local con su toldo. Ver `LocationPanel`. */
export const Storefront = (p: IconProps) => (
	<Icon {...p}>
		<path d="M4 9.5h16v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V9.5Z" />
		<path d="M4 9.5 5.5 4.5h13l1.5 5" />
		<path d="M9.75 20.5V15h4.5v5.5" />
	</Icon>
);

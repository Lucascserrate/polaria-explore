import { SiteHeader } from '@/components/layout/site-header';

/**
 * El buscador lleva la barra sólo en escritorio, y de borde a borde.
 *
 * En el teléfono el mapa ocupa la pantalla entera y la lista abre directamente
 * con las tarjetas; la salida de esta ruta es la flecha de `ExploreTopBar`. A
 * partir de `lg` el mapa es un panel al costado y no la pantalla, así que la
 * barra no le saca nada, y sacarla dejaría al buscador sin marca y sin forma de
 * entrar a la cuenta.
 *
 * Va **ancha** y no centrada: abajo no hay una columna con la que alinearse
 * sino la pantalla entera —el mapa llega hasta el borde derecho y la lista
 * hasta el izquierdo—, y una barra centrada arriba de eso deja el logo alineado
 * con nada.
 */
export default function ExploreLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<SiteHeader showFrom="lg" wide />
			{children}
		</>
	);
}

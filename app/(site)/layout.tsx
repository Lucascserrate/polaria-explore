import { SiteHeader } from '@/components/layout/site-header';

/**
 * La raíz del dominio, con la barra de Polaria arriba y a todo lo alto.
 *
 * Es el único lugar del sitio donde la barra se ve en cualquier ancho, y por
 * descarte: acá no hay abajo un mapa que quiera la pantalla entera ni la foto
 * de un local que quiera abrir a sangre. Ver `SiteHeader`.
 */
export default function SiteLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<SiteHeader forBusiness />
			{children}
		</>
	);
}

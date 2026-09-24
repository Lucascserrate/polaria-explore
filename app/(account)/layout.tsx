import { SiteHeader } from '@/components/layout/site-header';

/**
 * Las páginas de la cuenta de quien reserva.
 *
 * La barra se ve en cualquier ancho, y por descarte: acá no hay abajo la foto de
 * un local que quiera abrir a sangre ni un mapa que quiera la pantalla entera.
 * Es además la única salida de estas páginas, porque son las únicas del sitio a
 * las que se llega desde el menú de la cuenta y no desde un negocio.
 *
 * Sin el pie de "con tecnología de Polaria" que llevan las de reserva: ahí es la
 * firma de un tercero al final del local de otro, y acá el sitio es Polaria.
 */
export default function AccountLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex min-h-full flex-col bg-paper-50">
			<SiteHeader />
			<div className="flex-1">{children}</div>
		</div>
	);
}

import { QueryProvider } from '@/components/providers/query-provider';
import { SiteHeader } from '@/components/layout/site-header';
import { booking } from '@/content/booking';
import { site } from '@/config/site';

/**
 * Las páginas públicas de reserva: lo que va **debajo** de la barra.
 *
 * La barra del marketplace se pone acá, y **a partir de `sm`**: en el teléfono
 * la página abre con la foto del local a sangre y arriba de todo, que es lo que
 * alguien vino a ver, y una barra fija le roba ese lugar. La salida en ese
 * ancho es la flecha sobre la foto (`BackButton`). Ver `SiteHeader`.
 *
 * El pie es de estas páginas y no del sitio: la firma de Polaria al final de
 * una reserva.
 *
 * El visitante de este grupo de rutas es el cliente de una barbería, no un
 * negocio buscando software. Un encabezado que diga "Probá Polaria gratis"
 * arriba de su reserva sería publicidad de un tercero metida en el local de
 * otro, y el enlace más visible de la página llevaría fuera de ella justo
 * cuando lo único que hay que hacer es tocar "Reservar".
 *
 * Lo único que queda de Polaria es una línea al pie, del tamaño de una firma.
 */
export default function BookingLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex min-h-full flex-col bg-paper-50">
			<SiteHeader showFrom="sm" />

			{/* Sólo este grupo de rutas pide datos al backend desde el navegador. */}
			<QueryProvider>
				<div className="flex-1">{children}</div>
			</QueryProvider>

			<footer className="px-5 py-8 text-center text-sm text-ink-500">
				{booking.footer.poweredBy}{' '}
				<a
					href={site.landingUrl}
					className="font-medium text-ink-700 underline-offset-4 hover:underline"
				>
					{site.name}
				</a>
			</footer>
		</div>
	);
}

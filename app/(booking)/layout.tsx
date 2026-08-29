import Link from "next/link";
import { QueryProvider } from "@/components/providers/query-provider";
import { booking } from "@/content/booking";
import { site } from "@/config/site";

/**
 * Las páginas públicas de reserva, sin la navegación de la landing.
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
      {/* Sólo este grupo de rutas pide datos al backend desde el navegador. */}
      <QueryProvider>
        <div className="flex-1">{children}</div>
      </QueryProvider>

      <footer className="px-5 py-8 text-center text-sm text-ink-500">
        {booking.footer.poweredBy}{" "}
        <Link
          href="/"
          className="font-medium text-ink-700 underline-offset-4 hover:underline"
        >
          {site.name}
        </Link>
      </footer>
    </div>
  );
}

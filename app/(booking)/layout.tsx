import { QueryProvider } from "@/components/providers/query-provider";
import { CustomerBar } from "@/features/customer/CustomerBar";
import { getCustomerSession } from "@/services/customer/server/session";
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
export default async function BookingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /*
   * La sesión se resuelve acá y no en cada página: la barra tiene que estar en
   * las dos —la del negocio y la de reserva— y con `cache` de React esto y lo
   * que pide la pantalla de reserva son una sola consulta por render.
   */
  const session = await getCustomerSession();

  return (
    <div className="flex min-h-full flex-col bg-paper-50">
      <CustomerBar session={session} />

      {/* Sólo este grupo de rutas pide datos al backend desde el navegador. */}
      <QueryProvider>
        <div className="flex-1">{children}</div>
      </QueryProvider>

      <footer className="px-5 py-8 text-center text-sm text-ink-500">
        {booking.footer.poweredBy}{" "}
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

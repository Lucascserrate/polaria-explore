import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { site } from "@/config/site";
import { Navbar } from "@/components/layout/navbar";
import { getCustomerSession } from "@/services/customer/server/session";
import "./globals.css";

/**
 * Una sola familia en todo el sitio.
 *
 * El contraste tipográfico lo dan el tamaño y el peso —titulares muy grandes y
 * apretados contra un cuerpo tranquilo—, no la mezcla de familias. Geist quedó
 * afuera por lo contrario de un defecto: es correcta y no dice nada, y es la
 * fuente que usa media industria.
 *
 * `axes` no hace falta: la variable de peso viene completa en la variante
 * estándar, y se usa de 400 a 600.
 */
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

/**
 * El layout raíz: el documento y la barra del marketplace.
 *
 * La barra vive acá y no en `app/(booking)` porque es del **dominio**, no de
 * las páginas de reserva: cuando exista el buscador, la misma barra va a estar
 * arriba de él. Comparte la forma con la de `polaria-landing` —misma marca— y
 * no su contenido: en este dominio el visitante es el cliente de un negocio,
 * así que no hay enlaces ni botones que le hablen al dueño. Ver `Navbar`.
 *
 * **Leer la sesión acá vuelve dinámicas todas las páginas del dominio**,
 * incluida la raíz, que antes se prerenderizaba. Es el precio de que la barra
 * sepa quién está en sesión en cualquier página, y es un precio que ya
 * pagábamos en las de reserva. El día que sea un problema, la salida no es
 * mover la barra sino aislar su parte de cuenta con PPR.
 *
 * El pie sigue en `app/(booking)`: es la firma de la reserva, no del sitio.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getCustomerSession();

  return (
    <html
      lang="es"
      // Next 16 ya no fuerza el scroll instantáneo en navegación salvo que se
      // declare este atributo. Sin él, el scroll suave global se aplicaría
      // también a los cambios de ruta.
      data-scroll-behavior="smooth"
      className={`${instrumentSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/*
          Marca que JavaScript corre, antes de que se pinte nada. De esta clase
          cuelga el estado inicial de las apariciones al hacer scroll (ver
          globals.css): sin ella el contenido se ve completo y quieto, que es
          exactamente lo que queremos si el script no llega a ejecutarse.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <Navbar session={session} />
        {children}
      </body>
    </html>
  );
}

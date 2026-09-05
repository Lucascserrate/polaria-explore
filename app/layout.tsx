import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { site } from "@/config/site";
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
 * El layout raíz sólo arma el documento: fuente, estilos y `<body>`.
 *
 * El encabezado y el pie no están acá: los trae `app/(booking)`, que es el
 * único grupo de rutas que hay por ahora. La landing —con su navegación, su
 * pie y sus páginas legales— se fue al repositorio `polaria-landing`, así que
 * en este dominio no hay nada que le hable al dueño del negocio: el visitante
 * es su cliente, y una barra que diga "Probá Polaria gratis" sería publicidad
 * de un tercero encima de la reserva.
 *
 * Lo que se agregue acá lo hereda todo el dominio, incluido el buscador del
 * marketplace cuando exista. Antes de tocarlo: ¿esto es del documento?
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
        {children}
      </body>
    </html>
  );
}

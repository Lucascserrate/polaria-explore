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
 * El layout raíz: el documento y nada más.
 *
 * **La barra ya no está acá.** Vivía en este archivo porque es del dominio y no
 * de una pantalla, y funcionó mientras todas las pantallas la querían igual.
 * El buscador la quiere sólo en escritorio —en el teléfono el mapa ocupa todo y
 * la barra le come el alto—, y un layout no puede tener dos formas según quién
 * cuelgue de él. Así que bajó un piso: `app/(site)/layout.tsx` la pone para la
 * raíz y las reservas, `app/explore/layout.tsx` la pone escondida en el
 * teléfono. Es la misma barra y el mismo componente; lo que cambió es que ya no
 * la impone el documento.
 *
 * El pie sigue en `app/(site)/(booking)`: es la firma de la reserva, no del
 * sitio.
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

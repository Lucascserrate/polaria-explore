<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Polaria — sitio

Polaria es un asistente de WhatsApp para negocios que trabajan con citas. Este
repositorio es el sitio público: **la landing**, **las páginas de reserva de
cada negocio** (`polariahq.com/royal-barber`) y **las dos páginas legales** que
Meta revisa para aprobar WhatsApp Business API.

## Estado de la landing

La landing se rehízo desde cero. La anterior —hero animado, simulador de
conversación, calculadora— se borró completa; está commiteada en la rama
`landing-vieja` (commit `235efbd`) por si hace falta rescatar una pieza:
`git checkout landing-vieja -- <ruta>`.

Lo que hay ahora es **la primera versión estructural**: estructura, ritmo y
dirección visual resueltos; copy provisional. Antes de pulir una sección hay que
tener aprobada la dirección, no al revés.

- **El copy de la landing es un borrador y vive junto en `content/landing.ts`.**
  Cuando se trabaje en serio se parte en un archivo por sección, como el resto
  del proyecto.
- **Nada de cifras de tracción inventadas.** Todavía no hay clientes y éste es
  el sitio que Meta revisa.

## Comandos

```bash
npm run dev            # desarrollo
npm run check          # typecheck + lint
npm run build
node scripts/capture.mjs   # capturas del panel real (ver abajo)
```

## Variables de entorno

```bash
POLARIA_API_URL=http://localhost:3001   # API de Polaria (server-side, sin NEXT_PUBLIC_)
```

Sin `NEXT_PUBLIC_` a propósito: el navegador nunca llama a la API. Ver
`config/api.ts`.

## Dirección visual (lo que sostiene la landing nueva)

La referencia es Fresha: composición amplia, titulares enormes contra cuerpo
tranquilo, pocas cosas por sección y el producto mostrado en pantallas reales.
Lo que **no** se toma de la referencia es el color.

- **Negro, blanco y dos grises.** No hay color de marca. El único color de la
  página entra por las capturas del panel, que ya es blanco y negro.
- **El gris es jerarquía, no superficie.** Aparece en texto secundario, en
  líneas de 1px y en una sola banda de fondo (`Section tone="soft"`). Si algo se
  ve apagado, casi siempre es un gris que debería haber sido negro.
- **El negro aparece dos veces:** las cifras bajo el hero y el cierre. Usarlo en
  más lugares lo convierte en un fondo más.
- **Sin tarjetas, sin sombras, sin gradientes, sin iconos decorativos.** La
  estructura la dan el espacio y las líneas de 1px. Un bloque que necesita un
  borde para leerse suele estar mal espaciado.
- **Una sola animación:** opacidad y ocho píxeles al entrar en pantalla
  (`<Reveal>`). El estado escondido depende de la clase `js` que pone un script
  inline en `app/layout.tsx`: sin JavaScript la página se ve completa y quieta,
  nunca en blanco.
- **Ritmo vertical centralizado en `<Section>`.** Si una sección necesita otro
  aire, se cambia ahí, no con márgenes sueltos.

## Capturas de producto

Las imágenes de `public/product/` salen del panel real con
`scripts/capture.mjs` (necesita `polaria/client` corriendo con
`NEXT_PUBLIC_DEMO_DATA=1`). Los archivos `*-detalle.png` son recortes de esas
tomas encuadrados a la zona con información: el panel es una interfaz aireada y
la pantalla entera, a media columna, se lee como una mancha gris.

**Falta la captura de la agenda**, que es la mejor imagen posible para el hero
—es la pantalla que resume el producto—. Hoy el hero usa Analíticas.

## Mapa de rutas

`app/` está partido en grupos que no comparten nada más que el documento
(`app/layout.tsx`: fuente, estilos, `<body>` y el script de la clase `js`):

| Grupo             | Rutas                | Quién la lee                  |
| ----------------- | -------------------- | ----------------------------- |
| `app/(marketing)` | `/`                  | Un negocio evaluando Polaria  |
| `app/(booking)`   | `/[businessSlug]`    | **El cliente de ese negocio** |
| `app/(legal)`     | `/privacy`, `/terms` | Meta, y quien busque el aviso |

La navegación y el pie de la landing viven en `app/(marketing)/layout.tsx` y no
en el layout raíz. No es orden por orden: en una página de reserva, una barra
que diga "Probá Polaria gratis" es publicidad de un tercero metida en el local
de otro, y el enlace más visible llevaría fuera de la página justo cuando lo
único que hay que hacer es tocar "Reservar".

Las rutas estáticas ganan sobre `[businessSlug]`, así que `/privacy` sigue
siendo la política de privacidad. Esos nombres están reservados del lado del
backend (`RESERVED_SLUGS`) para que ningún negocio quede en una URL inalcanzable.

## Datos: `services/` y React Query

Todas las peticiones viven en `services/`, una por archivo, y ninguna en un
componente. La regla para saber dónde va algo: **si es una petición, es un
servicio; si es una petición que la pantalla observa, además tiene un hook.**

```
services/booking/
  types.ts            el contrato de la API (la única copia)
  request.ts          transporte del navegador → /api/booking/...
  keys.ts             las claves de React Query
  staff.ts  days.ts  slots.ts  bookings.ts      un servicio por archivo
  hooks/
    useStaff.ts  useDays.ts  useSlots.ts  useCreateBooking.ts
  server/
    request.ts        transporte del servidor → API de Polaria (server-only)
    business.ts  staff.ts  days.ts  slots.ts  bookings.ts
```

- **`services/booking/server/` es `server-only`.** Si alguien lo importa desde un
  componente de cliente, el build falla en lugar de mandar la URL interna de la
  API al navegador. El navegador habla con `app/api/booking/[slug]/*`, que son
  pasamanos: reenvían desde el servidor. Así no hay que abrirle CORS a este
  dominio.
- **El perfil del negocio no pasa por React Query.** Se pide en el servidor
  durante el render: cuando el HTML llega, el dato ya está en la página.
- **Los horarios no se cachean nunca** (`staleTime: 0`, `gcTime: 0` en
  `useSlots`). Un negocio abierto o un precio pueden llegar con un minuto de
  atraso; un turno que ya se ocupó, no. Lo demás —equipo, días con atención—
  vive cinco minutos.
- **Una clave por consulta reemplaza al `AbortController`.** El riesgo de que la
  respuesta de un día pise la de otro no se resuelve: deja de existir.
- **El `QueryClientProvider` sólo envuelve `app/(booking)`**
  (`components/providers/query-provider.tsx`). La landing no pide nada.

## La página de reservas

- **`features/booking/` es la interfaz, no los datos.** No importa nada de
  `sections/`, y sus peticiones salen de `services/booking/hooks/`.
- **No hay lógica de reservas acá.** Disponibilidad, asignación de profesional y
  creación de la cita las resuelve la API de Polaria, que es la misma que atiende
  WhatsApp y el panel. Si aparece un cálculo de horarios en este repo, está mal.
- **Sin fotos, y sin huecos de fotos.** `BusinessCover` es el lugar reservado
  para cuando existan; hoy es una banda neutra.
- Los pasos del flujo son los mismos que los de la reserva guiada de WhatsApp
  —servicio → profesional → fecha y hora → datos— porque son los datos que el
  backend necesita, en el orden en que dejan de ser ambiguos.

## Reglas del proyecto

- **`app/(marketing)/page.tsx` no lleva maquetación ni copy.** Sólo ordena
  secciones. Lo mismo vale para `app/(booking)/[businessSlug]/page.tsx`.
- **Todo el copy vive en `content/`.** Si estás escribiendo texto visible dentro
  de un `.tsx`, está en el lugar equivocado.
- **Server Components por defecto.** En la landing el único componente cliente
  es `<Reveal>`, y sólo porque necesita un observador.
- **Los CTA salen de `config/cta.ts`.** Hay un número real donde cualquiera
  puede probar el asistente; si cambia, se cambia ahí y en ningún otro lado.

## Antes de publicar

Buscar los `TODO` en `config/site.ts` y `content/legal.ts`: dominio, correo,
razón social y domicilio deben ser reales y verificables para la revisión de
Meta.

## Restricciones de marca (no negociables)

No usar el logotipo de WhatsApp, Meta ni Google, no imitar su interfaz al pixel
y no insinuar afiliación. El teléfono del hero evoca una conversación sin
copiar la interfaz de nadie y sin usar el verde de WhatsApp. El descargo va sí o
sí en el pie (`landing.footer.disclaimer` y `legalChrome.disclaimer`).

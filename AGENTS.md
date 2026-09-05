# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Polaria — explore

Polaria es un asistente de WhatsApp para negocios que trabajan con citas. Este
repositorio es el sitio público de **los negocios**: hoy, **la página de reserva
de cada uno** (`polariahq.com/royal-barber`); mañana, el **marketplace** donde se
los busca, se los lista y se los ve en un mapa.

**La landing no está acá.** Se fue al repositorio `polaria-landing`, junto con
las dos páginas legales (`/privacy`, `/terms`) que Meta revisa para aprobar
WhatsApp Business API. Ésa es la separación que hay que entender antes de tocar
nada: en este dominio el visitante es **el cliente del negocio**, no el dueño, y
no hay nada que venderle. Si estás por escribir copy que le habla a un negocio
sobre software, estás en el repositorio equivocado.

Lo único que queda de Polaria en este sitio es la firma al pie de la reserva,
que enlaza a la landing (`site.landingUrl`).

## Comandos

```bash
npm run dev            # desarrollo
npm run check          # typecheck + lint
npm run build
```

## Variables de entorno

```bash
POLARIA_API_URL=http://localhost:3001   # API de Polaria (server-side, sin NEXT_PUBLIC_)
MAPBOX_TOKEN=pk....                     # opcional: el mapa de "Dónde estamos"
MAPBOX_STYLE=mapbox://styles/mapbox/streets-v11 # opcional, ése es el valor por defecto
```

Sin `NEXT_PUBLIC_` a propósito: el navegador nunca llama a la API ni a Mapbox.
Ver `config/api.ts` y `config/map.ts`.

Sin `MAPBOX_TOKEN` no hay mapa y la sección "Dónde estamos" queda con la
dirección y el enlace, que es como estaba. **No es un error que haya que
arreglar para levantar el sitio**, y en desarrollo se puede trabajar sin él.

## Mapa de rutas

| Ruta               | Estado      | Quién la lee                     |
| ------------------ | ----------- | -------------------------------- |
| `/`                | provisional | Un cartel. Va a ser el buscador. |
| `/[businessSlug]`  | en pie      | **El cliente de ese negocio**    |
| `/api/booking/...` | en pie      | Nadie: pasamanos hacia la API    |
| `/api/map/[slug]`  | en pie      | Nadie: la imagen del mapa        |

`app/page.tsx` es un cartel provisional, no una landing: existe para que la raíz
del dominio no sea un 404 —las páginas de reserva cuelgan de ella y alguien va a
borrar el slug de la barra de direcciones para ver qué hay más arriba—. El copy
está en `content/home.ts` y se reemplaza entero cuando llegue el buscador.

**Los negocios van en la raíz** (`/royal-barber`, no `/n/royal-barber`), así que
los nombres que use el sitio siguen estando reservados del lado del backend
(`RESERVED_SLUGS`) para que ningún negocio quede en una URL inalcanzable. La
lista se achicó al irse la landing: ya no hay que reservar `/privacy` ni
`/terms`. Cada ruta estática nueva que se agregue acá es un slug menos
disponible; vale la pena pensarlo antes.

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
  (`components/providers/query-provider.tsx`).

## La página de reservas

- **`features/booking/` es la interfaz, no los datos.** Sus peticiones salen de
  `services/booking/hooks/`.
- **No hay lógica de reservas acá.** Disponibilidad, asignación de profesional y
  creación de la cita las resuelve la API de Polaria, que es la misma que atiende
  WhatsApp y el panel. Si aparece un cálculo de horarios en este repo, está mal.
- **Sin fotos, y sin huecos de fotos.**
- **El mapa de "Dónde estamos" es una imagen, no un mapa arrastrable.** Sale de
  la API de imágenes estáticas de Mapbox (`services/map/static-map.ts`) y la pide
  el servidor en `app/api/map/[slug]`. Dos razones: cero JavaScript en una página
  que se abre con datos móviles, y la clave de Mapbox no viaja al navegador.
  **Ese handler recibe un slug, nunca coordenadas** — con coordenadas sería un
  proxy abierto contra una cuenta que se factura por petición.
- **El mapa es la única parte de la página con color, y es a propósito.** Un mapa
  de calles se lee por el color —el verde es una plaza, el azul es el río— y en
  gris hay que leer los nombres para orientarse. Nadie lo confunde con color de
  marca. Va a zoom de barrio y no de cuadra: el número de la puerta lo dice la
  dirección escrita debajo.
- **El marcador lo dibuja el DOM, no Mapbox** (`LocationPanel`). Puede ir clavado
  al centro porque la imagen es un mapa centrado en el negocio. Los marcadores de
  Mapbox son gotas de un catálogo fijo; éste es un círculo negro con el icono
  `Storefront`.
- **Ojo con `MAPBOX_STYLE`:** la API de imágenes estáticas **no** dibuja los
  estilos armados sobre el basemap "Standard" de Mapbox. Devuelve una imagen en
  blanco, sin error. Ahí caen los que salen hoy de Mapbox Studio, incluido el del
  panel. Si se cambia el estilo, hay que mirar la imagen.
- Los pasos del flujo son los mismos que los de la reserva guiada de WhatsApp
  —servicio → profesional → fecha y hora → datos— porque son los datos que el
  backend necesita, en el orden en que dejan de ser ambiguos.

## Reglas del proyecto

- **`app/(booking)/[businessSlug]/page.tsx` no lleva copy.** Sólo ordena la
  página.
- **Todo el copy vive en `content/`.** Si estás escribiendo texto visible dentro
  de un `.tsx`, está en el lugar equivocado.
- **Server Components por defecto.**

## Pendientes conocidos

- **`app/opengraph-image.tsx` es de la landing vieja.** Dice "Contestá todos los
  mensajes sin soltar la tijera" sobre un fondo azul oscuro: era la dirección
  visual anterior y además le habla al dueño del negocio. Como las páginas de
  reserva no declaran su propia imagen, ésa es la vista previa que aparece
  cuando alguien pega el enlace de una barbería en WhatsApp. Hay que
  reemplazarla por una imagen por negocio (nombre y dirección) o por una
  neutra. `app/icon.tsx` arrastra el mismo azul (`#0b50e8`).
- **El buscador del marketplace**, y con él el sitemap: hoy `app/sitemap.ts`
  lista sólo la raíz, y el lugar donde habría que pedirle a la API la lista de
  negocios publicados está marcado ahí.

## Restricciones de marca (no negociables)

No usar el logotipo de WhatsApp, Meta ni Google, no imitar su interfaz al pixel
y no insinuar afiliación.

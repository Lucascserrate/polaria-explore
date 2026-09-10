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

**Polaria sí se muestra, pero como marketplace y no como software.** La barra
de arriba (`components/layout/navbar.tsx`) comparte la forma con la de
`polaria-landing` —misma marca, misma altura, misma línea de 1px— y no su
contenido: el logo lleva a la raíz y a la derecha va la cuenta de quien reserva
cuando hay sesión, más "Para negocios" **si el layout lo pide**.

**La barra no está en el layout raíz**, aunque sea del dominio y no de una
pantalla. Vivía ahí hasta que apareció el buscador, que la quiere sólo en
escritorio —en el teléfono el mapa ocupa la pantalla entera y la barra le come
el alto—, y un layout no puede tener dos formas según quién cuelgue de él.
Ahora la pone `app/(site)/layout.tsx` para la raíz y las reservas, y
`app/explore/layout.tsx` escondida bajo `lg`. El documento (`app/layout.tsx`)
no impone ningún encabezado.

Lo que sigue prohibido es lo de siempre, y es la parte que importa: **en la
página de un negocio, ningún enlace ni botón que le hable a su dueño.** Un
"Probá Polaria gratis" arriba de la reserva de una barbería es publicidad de un
tercero metida en el local de otro, y sería el enlace más visible de la página
justo cuando lo único que hay que hacer es reservar. Ahí Polaria aparece dos
veces y las dos chicas: la firma al pie (`site.landingUrl`) y "Para negocios"
dentro del menú de la cuenta, detrás de un clic.

**La raíz es la excepción, y por qué lo es importa.** `/` es la puerta del
marketplace: no es la página de nadie, no hay una reserva empezada que
interrumpir, y quien entra por la puerta bien puede ser un negocio que vino a
ver de qué se trata. Por eso ahí "Para negocios" está a la vista, arriba a la
derecha, y lleva a `site.landingUrl` (`business.polariahq.com`). No lo decide la
barra sino quién la pone: `forBusiness` es un prop **apagado por defecto** que
sólo prende `app/(site)/layout.tsx`. Si aparece prendido en el grupo de las
reservas, está mal.

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
NEXT_PUBLIC_MAPBOX_TOKEN=pk....         # opcional: el mapa interactivo del buscador
NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/mapbox/streets-v12 # opcional
```

**`NEXT_PUBLIC_MAPBOX_TOKEN` es la única variable de este repositorio que viaja
al navegador**, y es a propósito: Mapbox GL JS no puede funcionar sin ella. Tiene
que ser un token distinto del server-side y restringido por dominio. Ver
`config/map.ts` antes de tocarla.

La API nunca se llama desde el navegador —eso no cambió— y el mapa estático
tampoco. La excepción es el token del mapa interactivo, explicada abajo. Ver
`config/api.ts` y `config/map.ts`.

Sin `MAPBOX_TOKEN` no hay mapa y la sección "Dónde estamos" queda con la
dirección y el enlace, que es como estaba. **No es un error que haya que
arreglar para levantar el sitio**, y en desarrollo se puede trabajar sin él.

## Mapa de rutas

| Ruta               | Estado      | Quién la lee                        |
| ------------------ | ----------- | ----------------------------------- |
| `/`                | en pie      | **La entrada: el buscador**         |
| `/explore`         | en pie      | **Quien todavía no eligió negocio** |
| `/[businessSlug]`  | en pie      | **El cliente de ese negocio**       |
| `/api/booking/...` | en pie      | Nadie: pasamanos hacia la API       |
| `/api/map/[slug]`  | en pie      | Nadie: la imagen del mapa           |

**`app/(site)/page.tsx` dejó de ser un cartel.** Es la entrada: un titular, el
campo que baja la lista de rubros y esos mismos rubros como enlaces debajo. No
es una landing —no vende nada y no le habla al dueño de un negocio, salvo el
botón de la barra— y no es una pantalla de resultados: de acá se sale a
`/explore` con un rubro elegido, o directo a la página de un negocio cuando se
lo encontró por su nombre. El copy está en `content/home.ts`. Ver "La entrada"
más abajo.

**`/explore` es la pantalla de resultados, no la entrada.** Lista los negocios
publicados con un mapa al lado y filtra por rubro con la URL
(`/explore?rubro=BARBERSHOP`), que es a donde manda el campo de la raíz. Buscar
por texto sigue sin existir de este lado: la API no lo sabe hacer todavía. Ver
"El buscador" más abajo.

**Los negocios van en la raíz** (`/royal-barber`, no `/n/royal-barber`), así que
los nombres que use el sitio siguen estando reservados del lado del backend
(`RESERVED_SLUGS`) para que ningún negocio quede en una URL inalcanzable. La
lista se achicó al irse la landing —ya no hay que reservar `/privacy` ni
`/terms`— y volvió a crecer con `explore`. Cada ruta estática nueva que se
agregue acá es un slug menos disponible; vale la pena pensarlo antes, y hay que
reservarla en la API **antes** de desplegarla.

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
- **El `QueryClientProvider` sólo envuelve `app/(site)/(booking)`**
  (`components/providers/query-provider.tsx`).

## La página de reservas

- **`features/booking/` es la interfaz, no los datos.** Sus peticiones salen de
  `services/booking/hooks/`.
- **No hay lógica de reservas acá.** Disponibilidad, asignación de profesional y
  creación de la cita las resuelve la API de Polaria, que es la misma que atiende
  WhatsApp y el panel. Si aparece un cálculo de horarios en este repo, está mal.
- **Las fotos son opcionales, y sin fotos no hay hueco.** La galería
  (`BusinessGallery`) no dibuja nada cuando el negocio no subió ninguna, que es
  el caso de casi todos: la página tiene que verse terminada así. Las sube el
  dueño desde el panel (Configuración → Fotos del negocio), viven en Cloudinary
  y llegan en `profile.photos`, en orden y con sus medidas —que es lo que evita
  que la página salte mientras cargan—. La primera es la portada.
- **La vista previa del enlace es la portada del negocio.**
  `app/(site)/(booking)/[businessSlug]/opengraph-image.tsx` dibuja un PNG de 1200×630
  con `profile.photos[0]` de fondo y el nombre y la dirección encima; sin fotos
  queda la tarjeta negra con las iniciales, que también es una vista previa
  terminada. Ahí no va el estado de apertura: WhatsApp cachea la imagen durante
  días y un "Abierto hasta las 20:00" quemado en el PNG miente la mitad de la
  semana. El recorte lo pide Cloudinary (`c_fill,g_auto`), no satori.

- **La galería es la única parte cliente de la página**, junto al flujo de
  reserva. Necesita el índice actual del carrusel y las teclas del visor; el
  HTML igual llega con todas las fotos, así que sin JavaScript se ven y se
  desplazan con el dedo. Tiene dos formas —carrusel a sangre en el teléfono,
  grilla de portada más dos en escritorio— y **nunca** se avanza con la rueda
  del mouse: hay clientes cuyo mouse no la tiene.
- **Hay dos mapas y no se mezclan.** La página de reserva usa la imagen
  estática que pide el servidor; el buscador del marketplace va a usar
  `components/map/interactive-map.tsx` (Mapbox GL JS). La diferencia no es
  estética: la imagen la trae el servidor y el token nunca sale de ahí,
  mientras GL JS pide sus tiles desde el navegador y **obliga** a publicar un
  token. Por eso el interactivo lleva su propia variable
  (`NEXT_PUBLIC_MAPBOX_TOKEN`), que tiene que ser **otro** token y estar
  **restringido por dominio** en la cuenta de Mapbox: sin eso es una factura
  abierta, porque GL JS se cobra por carga de mapa. Ver `config/map.ts`.
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

## La entrada (`/`)

- **El campo se aprieta y baja una lista de rubros; no es un cursor esperando
  una palabra.** Es lo que hacen los marketplaces de citas y acá tiene una razón
  de más: quien llega no sabe qué escribir —"corte", "fade", "barbería" y
  "peluquería" son la misma intención— y la API sabe filtrar por rubro pero
  todavía no por texto. Un rubro elegido de la lista es una búsqueda que existe.
- **Escribir acorta la lista y encuentra negocios por nombre.** Los nombres ya
  llegaron todos en el render del servidor, así que buscar entre ellos no le pide
  nada a nadie: son veinte comparaciones sin acentos y en minúsculas. Un negocio
  encontrado por su nombre **no** va a los resultados, va a su página: quien ya
  sabe a dónde quiere ir no tiene por qué pasar por una lista de uno.
- **Los rubros que se ofrecen son los que existen**, igual que en `/explore` y
  por lo mismo: salen de los negocios cargados (`typeOptions`) y no del catálogo.
  Con menos de dos, la lista de rubros se cae y su lugar lo ocupan los negocios
  —"Todos los negocios" y un único rubro son la misma lista dos veces— para que
  apretar el campo no abra un panel de un solo renglón.
- **Todavía no hay "dónde" ni "cuándo".** La referencia tiene tres casilleros;
  dos de ellos acá serían decoración, porque la API no filtra por zona ni por
  fecha. Ver "Pendientes".
- **Los rubros aparecen dos veces, y una de las dos es la que funciona sin
  JavaScript.** El panel del campo necesita estado; la fila de píldoras de abajo
  son enlaces dibujados en el servidor. Y el campo es un `<form action="/explore">`
  de verdad: con JavaScript nunca se envía —`onSubmit` cancela y navega a la fila
  elegida—, sin JavaScript lleva a la lista completa. Ninguna parte de esta
  pantalla termina en un callejón sin salida.
- **La raíz y `/explore` piden la misma lista**, con el mismo caché de cinco
  minutos (`listBusinesses`), así que entrar por la puerta y pasar a los
  resultados es una sola petición a la API.
- **La píldora de un rubro es `components/ui/chip.tsx`**, compartida con el
  filtro de `/explore`: son el mismo control antes y después de elegir, y dos
  copias de esas clases terminan siendo dos alturas distintas.

## El buscador (`/explore`)

- **La lista la trae el servidor y no pasa por React Query.**
  `services/explore/server/businesses.ts` pide `GET /public/businesses` a la API
  —el `PublicDirectoryModule`, que es un módulo aparte del de reservas— y las
  tarjetas llegan dibujadas en el HTML. React Query sigue envolviendo sólo
  `app/(booking)`.
- **Quién entra en la lista lo decide la API, no esta pantalla.** Publicado es
  tener slug, cuenta activa y al menos un servicio; lo demás —fotos, dirección,
  coordenadas— falta en casi todos y no excluye a nadie. Si acá apareciera un
  filtro de "negocios que se ven bien", sería una segunda regla de publicación.
- **No hay estrellas ni reseñas, porque Polaria no las tiene.** La referencia
  visual (Fresha) las muestra; inventar un "4,9" en un listado de negocios
  reales sería lo peor que puede hacer esta página.
- **Los rubros que se ofrecen son los que existen.** Los chips salen de los
  negocios cargados, no del catálogo: uno que devuelve cero es una promesa
  incumplida y hace ver vacío un buscador que no lo está. Con menos de dos
  rubros distintos, la fila entera desaparece. Ver `typeOptions`.
- **El filtro va por la URL y el mapa por estado del navegador.** El rubro son
  enlaces —anda sin JavaScript, se comparte, el botón de atrás funciona—;
  mostrar u ocultar el mapa es una preferencia de quien mira y no una dirección.
  `ExploreLayout` es lo único cliente de la página.
- **Acá el mapa sí es interactivo**, al revés que en la reserva: arrastrarlo es
  la función. Usa `NEXT_PUBLIC_MAPBOX_TOKEN`, que viaja al navegador y tiene que
  estar restringido por dominio. Sin negocios con coordenadas no hay mapa ni
  botón: un mapa sin marcadores es media pantalla que no sirve para nada.
- **El panel del mapa se muestra y se esconde con CSS, así que el mapa se monta
  escondido.** Mapbox mide el contenedor una sola vez y después sólo escucha el
  `resize` de la ventana: sin el `ResizeObserver` de `InteractiveMap`, el mapa
  del teléfono nace con la medida de un contenedor en `display: none` y se ve
  recortado, con franjas blancas y sin ningún error en la consola.
- **El marcador es un círculo con el icono del rubro**, no una gota ni una
  burbuja con texto: hay veinte a la vez y lo que tiene que poder leerse debajo
  son las calles. Tocarlo abre la vista previa del negocio —un globo pegado al
  marcador en escritorio, una tarjeta al pie en el teléfono— y se dibuja **una**
  de las dos, elegida con `useMediaQuery`: dibujar las dos y esconder una
  dejaría la misma tarjeta dos veces en el HTML.
- **Los iconos de rubro son Material Symbols rellenos** (`react-icons/md`), y no
  los de contorno del resto de la interfaz: un trazo de 1,75px dentro de un
  marcador de 14px es una mancha gris con agujeros. La chapa de Polaria —lupa,
  flechas, mapa— sigue siendo `lucide-react`, que es lo que usa el panel. Ver
  `features/explore/business-type-icon.tsx`. Ninguno reemplaza a la etiqueta:
  ninguno de esos dibujos dice "depilación" solo.

## Reglas del proyecto

- **`app/(site)/(booking)/[businessSlug]/page.tsx` no lleva copy.** Sólo ordena
  la página.
- **Todo el copy vive en `content/`.** Si estás escribiendo texto visible dentro
  de un `.tsx`, está en el lugar equivocado.
- **Server Components por defecto.**

## Pendientes conocidos

- **`app/opengraph-image.tsx` sigue siendo de la landing vieja.** Dice "Contestá
  todos los mensajes sin soltar la tijera" sobre un fondo azul oscuro: era la
  dirección visual anterior y además le habla al dueño del negocio. Ya no es la
  vista previa de las reservas —cada negocio declara la suya, ver abajo—, pero
  sí la de la raíz y la de cualquier ruta nueva del dominio. Hay que
  reemplazarla por una neutra. `app/icon.tsx` arrastra el mismo azul
  (`#0b50e8`).
- **Buscar por zona, y por texto de verdad.** La raíz ya tiene su campo, pero lo
  que hace es elegir un rubro o encontrar un negocio por su nombre entre los que
  ya llegaron al navegador. Falta lo que necesita a la API: buscar por servicio
  ("corte de barba"), filtrar por zona, y "buscar en esta área" cuando se mueve
  el mapa. Los dos casilleros de la referencia —dónde y cuándo— entran al campo
  el día que la API sepa contestarlos, y no antes: un "Ubicación actual" que no
  cambia los resultados es una promesa que incumple la pantalla siguiente.
- **El sitemap no lista los negocios.** Ahora la API sabe enumerarlos
  (`listBusinesses`), así que es una línea; es una decisión aparte porque listar
  a un negocio ahí es pedirle a Google que lo indexe.
- **La tarjeta no muestra distancia ni si está abierto.** Lo primero necesita
  pedirle la ubicación al navegador; lo segundo obliga a que el listado deje de
  cachearse cinco minutos.

## Restricciones de marca (no negociables)

No usar el logotipo de WhatsApp, Meta ni Google, no imitar su interfaz al pixel
y no insinuar afiliación.

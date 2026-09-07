/**
 * El mapa de la página de reservas.
 *
 * Sin `NEXT_PUBLIC_`, igual que la API (ver `config/api.ts`): la clave de Mapbox
 * no viaja al navegador. La imagen la pide el servidor en `app/api/map/[slug]` y
 * la página sólo apunta a esa ruta. Un `pk.` escrito en el HTML de una página
 * pública es una factura abierta —la API de imágenes estáticas se cobra por
 * petición—, y restringir el token por dominio es una mitigación, no una
 * respuesta.
 *
 * Sin `MAPBOX_TOKEN` no hay mapa y la sección queda como estaba: la dirección y
 * el enlace de "Cómo llegar". No es un error que haya que arreglar para
 * levantar el sitio.
 */

export const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN?.trim() ?? "";

/**
 * El token del **mapa interactivo**, que sí viaja al navegador.
 *
 * Rompe la regla de arriba, y conviene entender por qué antes de usarlo: la API
 * de imágenes estáticas la puede llamar el servidor, pero Mapbox GL JS pide sus
 * tiles **desde el navegador**. No hay forma de tener un mapa que se arrastre y
 * hacer zoom sin que el token esté en el cliente; la única alternativa sería
 * proxyear cada tile por nuestro servidor, y son decenas por gesto.
 *
 * Entonces el trato es explícito:
 *
 * - Este token tiene que ser **distinto** del de arriba y estar **restringido
 *   por dominio** en la cuenta de Mapbox (URL restrictions: `polariahq.com` y
 *   `localhost` para desarrollo). Sin esa restricción es una factura abierta:
 *   GL JS se cobra por carga de mapa, y un `pk.` público lo puede usar
 *   cualquiera desde su propio sitio.
 * - **La página de reserva no lo usa.** Ahí el mapa sigue siendo la imagen que
 *   pide el servidor: es cero JavaScript en una página que se abre con datos
 *   móviles, y una imagen no se puede robar por carga. Lo interactivo es para
 *   el buscador del marketplace, donde arrastrar el mapa **es** la función.
 *
 * Sin token no hay mapa interactivo, y el componente lo dice en su lugar en vez
 * de dejar un rectángulo gris. Ver `InteractiveMap`.
 */
export const MAPBOX_PUBLIC_TOKEN =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim() ?? "";

/**
 * El estilo del mapa interactivo.
 *
 * `streets-v12` acá y `v11` en el estático, y no es una inconsistencia: la
 * limitación que obliga al `v11` es de la API de imágenes —no dibuja los
 * estilos armados sobre el basemap "Standard"—, y GL JS no la tiene. En un mapa
 * que se explora, la tipografía y el detalle de `v12` se leen mejor al hacer
 * zoom.
 */
export const MAPBOX_PUBLIC_STYLE =
  process.env.NEXT_PUBLIC_MAPBOX_STYLE?.trim() ||
  "mapbox://styles/mapbox/streets-v12";

/**
 * El estilo del mapa.
 *
 * `streets-v11` y no el gris de la landing: un mapa de calles se lee por el
 * color —el verde es una plaza, el azul es el río— y en gris hay que leer los
 * nombres para orientarse. Es la única parte de la página que trae color, y se
 * la banca que sea un mapa: nadie lo confunde con color de marca.
 *
 * `v11` y no `v12` después de mirar las dos: v12 tiñe el suelo de beige y v11 lo
 * deja blanco, que es lo que pega con el resto de la página.
 *
 * **No sirve cualquier estilo.** La API de imágenes estáticas no dibuja los
 * estilos armados sobre el basemap "Standard" de Mapbox —devuelve una imagen en
 * blanco, sin error—, y ahí caen los que salen hoy de Mapbox Studio, incluido el
 * del panel. Si se cambia esta variable, hay que mirar la imagen.
 *
 * `MAPBOX_STYLE` lo reemplaza; ver `staticStylePath` para las formas que se
 * aceptan.
 */
export const MAPBOX_STYLE =
  process.env.MAPBOX_STYLE?.trim() || "mapbox://styles/mapbox/streets-v11";

/**
 * Cuánto vive la imagen del mapa, contra el minuto del perfil
 * (`BUSINESS_PROFILE_REVALIDATE_SECONDS`).
 *
 * Un día, porque son datos distintos: lo que cambia seguido en el perfil es el
 * "abierto hasta las 20:00", y un local no se muda mientras alguien mira la
 * página. El costo es conocido: una mudanza tarda hasta un día en verse en la
 * imagen. La dirección escrita, que está justo debajo, se actualiza en un
 * minuto.
 */
export const STATIC_MAP_CACHE_SECONDS = 60 * 60 * 24;

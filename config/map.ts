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

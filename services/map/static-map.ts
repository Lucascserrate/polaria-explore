import "server-only";

import {
  MAPBOX_STYLE,
  MAPBOX_TOKEN,
  STATIC_MAP_CACHE_SECONDS,
} from "@/config/map";

/**
 * Servicio: la imagen del mapa de un negocio.
 *
 * No tiene la carpeta `server/` que sí tiene `services/booking/` porque no hay
 * mitad de navegador que separar: lo único que el cliente hace es pedir una
 * `<img>` a `app/api/map/[slug]`, y ese handler llama a esto.
 *
 * **Es una imagen, no un mapa arrastrable, y es la decisión de fondo.** El
 * argumento que estaba en `features/booking/location.ts` sigue en pie: esta
 * página se abre desde un teléfono con datos móviles, y mapbox-gl son cientos de
 * kilobytes de JavaScript para algo que nadie va a explorar —el negocio está
 * donde está—. Esto es una imagen, cero JavaScript, y el gesto que la gente hace
 * igual, tocar el mapa para que se lo abra la aplicación que sabe llegar, lo
 * resuelve el enlace que la envuelve.
 */

const STATIC_API = "https://api.mapbox.com/styles/v1";

/*
 * 640×260 a 2x.
 *
 * Una banda baja y ancha: en un teléfono, un mapa cuadrado empuja la dirección
 * y el "Cómo llegar" fuera de la pantalla, y son esos dos los que sirven para
 * algo. El 2x no es lujo —el nombre de las calles a 1x se ve sucio en cualquier
 * teléfono de los últimos diez años— y son los 1280px que la API permite como
 * máximo.
 */
const WIDTH = 640;
const HEIGHT = 260;

/** Se ve la cuadra y las calles que la cruzan, que es lo que ubica a alguien. */
const ZOOM = 15;

/** `ink-950`: el pin es el dato, y la única marca sobre un mapa gris. */
const PIN = "pin-s+0a0a0a";

/**
 * El estilo en la forma que pide la API de imágenes estáticas: `usuario/id`.
 *
 * Acepta las dos formas que uno tiene a mano —`mapbox://styles/usuario/id`, que
 * es lo que copia el estudio de Mapbox, y `usuario/id` ya listo— y devuelve
 * `null` para cualquier otra cosa.
 *
 * Que rechace en lugar de intentar arreglar es a propósito, y sale de un rato
 * perdido: en el panel, el valor de esta variable llegó a producción con el
 * nombre de la variable pegado adelante. No dio ningún error —se coló dentro de
 * una URL y devolvió un 404 que había que ir a buscar— y el mapa quedó gris. Un
 * estilo que no se entiende se descarta y el mapa no se dibuja, que se ve.
 */
export function staticStylePath(style: string): string | null {
  const value = style.trim().replace(/^mapbox:\/\/styles\//, "");

  return /^[\w-]+\/[\w-]+$/.test(value) ? value : null;
}

/** Si este entorno puede dibujar mapas. Sin esto, la sección va sin imagen. */
export function hasStaticMap(): boolean {
  return Boolean(MAPBOX_TOKEN) && staticStylePath(MAPBOX_STYLE) !== null;
}

/**
 * Pide la imagen a Mapbox.
 *
 * Devuelve la respuesta tal cual para que el handler decida qué hacer con un
 * fallo: acá no hay nada que interpretar, y un `catch` que devuelva una imagen
 * vacía escondería una clave vencida durante meses.
 */
export function fetchStaticMap(location: {
  latitude: number;
  longitude: number;
}): Promise<Response> {
  const style = staticStylePath(MAPBOX_STYLE);

  if (!style) {
    throw new Error(
      `MAPBOX_STYLE no es un estilo de Mapbox: ${MAPBOX_STYLE}. ` +
        'Se espera "mapbox://styles/usuario/id" o "usuario/id".',
    );
  }

  // Longitud primero: es el orden de la API de Mapbox, y al revés cae en el mar.
  const center = `${location.longitude},${location.latitude}`;

  const url =
    `${STATIC_API}/${style}/static/${PIN}(${center})/${center},${ZOOM},0` +
    `/${WIDTH}x${HEIGHT}@2x?access_token=${encodeURIComponent(MAPBOX_TOKEN)}`;

  /*
   * El logo de Mapbox y la atribución de OpenStreetMap van dentro de la imagen.
   * `logo=false` y `attribution=false` existen, pero sólo se pueden usar
   * mostrando la atribución en otro lado, y esta página no tiene dónde.
   */
  return fetch(url, { next: { revalidate: STATIC_MAP_CACHE_SECONDS } });
}

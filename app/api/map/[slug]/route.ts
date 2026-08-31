import { STATIC_MAP_CACHE_SECONDS } from "@/config/map";
import { getBusinessProfile } from "@/services/booking/server/business";
import { fetchStaticMap } from "@/services/map/static-map";

/**
 * La imagen del mapa de un negocio.
 *
 * Un pasamanos, como los de `app/api/booking/`, y por la misma razón de fondo:
 * que una credencial no viaje al navegador. Acá es la de Mapbox.
 *
 * **Recibe un slug y no un par de coordenadas, y eso es lo que lo cierra.** Con
 * coordenadas sería un proxy abierto: cualquiera podría generar imágenes de
 * cualquier lugar del mundo contra nuestra cuenta, que se factura por petición.
 * Con el slug, las coordenadas las pone el perfil del negocio y no quien pide.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const profile = await getBusinessProfile(slug);

  // Un negocio sin coordenadas no tiene mapa. La página ya lo sabe y no pide la
  // imagen; esto es para quien llegue a la URL por su cuenta.
  if (!profile?.location) return new Response(null, { status: 404 });

  try {
    const image = await fetchStaticMap(profile.location);

    if (!image.ok) {
      console.error("[polaria:map]", slug, image.status, await image.text());
      return new Response(null, { status: 502 });
    }

    return new Response(image.body, {
      headers: {
        "Content-Type": image.headers.get("Content-Type") ?? "image/png",
        /*
         * Para la CDN, que es la que evita que cada visita a la página sea una
         * petición facturada a Mapbox. `stale-while-revalidate` para que la
         * primera visita después del día no espere a Mapbox.
         */
        "Cache-Control": `public, max-age=0, s-maxage=${STATIC_MAP_CACHE_SECONDS}, stale-while-revalidate=${STATIC_MAP_CACHE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error("[polaria:map]", slug, error);
    return new Response(null, { status: 502 });
  }
}

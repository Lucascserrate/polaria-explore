import type { PublicBusinessProfile } from "@/services/booking/types";

/**
 * El enlace de "Cómo llegar".
 *
 * Sigue siendo el que resuelve el problema, incluso ahora que la sección
 * muestra un mapa: llegar es cosa de la aplicación que la persona ya tiene
 * abierta, que sabe salir desde donde está parada. Lo que se dibuja arriba es
 * una imagen —ver `services/map/static-map.ts`—, y por eso no volvió el costo
 * que este comentario descartaba: no hay biblioteca de mapas ni cientos de
 * kilobytes de JavaScript en una página que se abre con datos móviles.
 *
 * Las coordenadas ganan sobre el texto cuando están: una dirección escrita a
 * mano puede llevar a la cuadra equivocada, un par de coordenadas no.
 */
export function directionsUrl(
  profile: Pick<PublicBusinessProfile, "location" | "address" | "name">,
): string | null {
  if (profile.location) {
    const { latitude, longitude } = profile.location;
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }

  if (profile.address) {
    const query = encodeURIComponent(`${profile.name}, ${profile.address}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  // Sin ubicación ni dirección no hay a dónde mandar a nadie, y un enlace que
  // abre un mapa en el medio de la nada es peor que no tener enlace.
  return null;
}

import type { PublicBusinessProfile } from "./types";

/**
 * El enlace de "Cómo llegar".
 *
 * No se dibuja un mapa: hacerlo pediría una biblioteca, una clave de un
 * proveedor y unos cientos de kilobytes en la primera pantalla de una página
 * que se abre desde un teléfono con datos móviles. El botón manda a la
 * aplicación de mapas que la persona ya tiene abierta y usa todos los días, que
 * además sabe llegar desde donde está parada.
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

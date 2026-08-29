import { booking } from "@/content/booking";
import { directionsUrl } from "../location";
import type { PublicBusinessProfile } from "@/services/booking/types";
import { BookNowButton } from "./BookButton";
import { StatusPill } from "./BusinessHeader";

/**
 * La tarjeta fija del escritorio: el equivalente de la barra inferior del
 * teléfono.
 *
 * Repite el nombre, el estado y la dirección, y eso es a propósito: en una
 * pantalla ancha la lista de servicios es larga y el encabezado queda arriba
 * fuera de la vista, así que "Reservar ahora" tiene que llegar con el contexto
 * puesto. En el teléfono no se repite nada, porque ahí todo está a un scroll de
 * distancia y la barra sólo lleva el botón.
 *
 * Es un componente de servidor con un botón de cliente adentro. La tarjeta no
 * necesita interactividad; el botón sí.
 */
export function BookingSidebar({
  profile,
}: {
  profile: PublicBusinessProfile;
}) {
  const directions = directionsUrl(profile);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-8 space-y-5 rounded-3xl px-6 py-6 ring-1 ring-paper-300 ring-inset">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <StatusPill profile={profile} className="text-sm" />
        </div>

        <BookNowButton className="w-full" />

        {(profile.address || directions) && (
          <div className="space-y-1 border-t border-paper-300 pt-4 text-sm">
            {profile.address && (
              <p className="text-ink-600">{profile.address}</p>
            )}
            {directions && (
              <a
                href={directions}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent-600 underline-offset-4 hover:underline"
              >
                {booking.header.directions}
              </a>
            )}
          </div>
        )}

        <p className="text-sm text-ink-500">
          {booking.header.servicesCount(profile.services.length)}
        </p>
      </div>
    </aside>
  );
}

import { booking } from "@/content/booking";
import { cn } from "@/lib/utils";
import { describeStatus } from "../format";
import { directionsUrl } from "../location";
import type { PublicBusinessProfile } from "@/services/booking/types";

/**
 * Quién es el negocio y si está abierto. Nada más.
 *
 * Es lo que separa una página de reservas de la página institucional de un
 * local: no hay "sobre nosotros", ni historia, ni frases sobre la pasión por el
 * oficio. Alguien que llega desde un QR ya sabe adónde entró; lo que no sabe es
 * si puede ir hoy.
 */
export function BusinessHeader({
  profile,
}: {
  profile: PublicBusinessProfile;
}) {
  const directions = directionsUrl(profile);

  return (
    <header className="space-y-5">
      <BusinessCover />

      <div className="space-y-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold sm:text-4xl">{profile.name}</h1>
          {profile.businessType && (
            <p className="text-ink-500 capitalize">{profile.businessType}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <StatusPill profile={profile} />

          {profile.address && (
            <span className="text-ink-600">{profile.address}</span>
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
      </div>
    </header>
  );
}

/**
 * Abierto o cerrado, con un punto de color.
 *
 * El punto es el único color de toda la página junto al enlace: verde y ámbar
 * son los mismos que usa la agenda del panel para "confirmado" y "requiere tu
 * atención", así que no hay una paleta nueva que aprender.
 */
export function StatusPill({
  profile,
  className,
}: {
  profile: PublicBusinessProfile;
  className?: string;
}) {
  const { status } = profile;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 rounded-full",
          status.open ? "bg-confirm-500" : "bg-attention-500",
        )}
      />
      <span
        className={cn(
          "font-medium",
          status.open ? "text-confirm-700" : "text-attention-700",
        )}
      >
        {describeStatus(status)}
      </span>
    </span>
  );
}

/**
 * El lugar de las fotos, todavía sin fotos.
 *
 * Hoy es una banda neutra con la textura del sitio. Está acá —y no ausente—
 * porque el día que el negocio pueda subir imágenes, la página ya tiene dónde
 * ponerlas y con qué proporción: se reemplaza el interior de este componente y
 * no se rediseña el encabezado.
 *
 * No hay `<img>` ni ningún hueco de "subí tu foto": una página con marcos
 * vacíos se ve rota, y esto tiene que verse terminado sin una sola imagen.
 */
function BusinessCover() {
  return (
    <div
      aria-hidden="true"
      className="h-28 w-full rounded-3xl bg-ink-950 bg-starfield sm:h-40"
    />
  );
}

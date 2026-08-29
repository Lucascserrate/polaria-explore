"use client";

import { Button } from "@/components/ui/button";
import { booking } from "@/content/booking";
import { cn } from "@/lib/utils";
import { formatDuration, formatPrice } from "../format";
import type { PublicBusinessProfile, PublicService } from "@/services/booking/types";
import { useBooking } from "./BookingProvider";

/**
 * Los tres disparadores del flujo. Son lo único interactivo de la página.
 *
 * Cada uno es un componente mínimo alrededor de `useBooking()` para que las
 * secciones que los rodean —encabezado, servicios, horarios— sigan siendo de
 * servidor. La alternativa era volver cliente media página para que un botón
 * pudiera abrir un modal.
 */

/** El botón grande, sin servicio elegido: abre por el primer paso. */
export function BookNowButton({ className }: { className?: string }) {
  const { start } = useBooking();

  return (
    <Button size="lg" className={className} onClick={() => start()}>
      {booking.services.bookNow}
    </Button>
  );
}

/**
 * La lista de servicios.
 *
 * Es la sección más importante de la página y por eso va arriba de todo: la
 * pregunta que trae a alguien acá es "¿cuánto sale y cuándo puedo ir?", y las
 * dos se responden en la misma fila. Tocar "Reservar" acá entra al flujo con el
 * servicio ya elegido, que es lo que ahorra el paso más largo.
 */
export function ServiceList({ profile }: { profile: PublicBusinessProfile }) {
  const { start } = useBooking();

  if (profile.services.length === 0) {
    return (
      <p className="rounded-2xl bg-paper-200 px-5 py-6 text-ink-600">
        {booking.services.empty}
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {profile.services.map((service) => (
        <li key={service.id}>
          <ServiceRow
            service={service}
            currency={profile.currency}
            onBook={() => start(service)}
          />
        </li>
      ))}
    </ul>
  );
}

function ServiceRow({
  service,
  currency,
  onBook,
}: {
  service: PublicService;
  currency: string;
  onBook: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-2xl px-5 py-5",
        "ring-1 ring-paper-300 ring-inset transition-colors hover:bg-paper-100",
      )}
    >
      <div className="min-w-0">
        <p className="font-medium">{service.name}</p>
        <p className="mt-0.5 text-sm text-ink-500">
          {formatDuration(service.durationMinutes)}
        </p>
        <p className="mt-2 font-semibold tabular-nums">
          {formatPrice(service.price, currency)}
        </p>
      </div>

      <Button
        variant="secondary"
        onClick={onBook}
        aria-label={`${booking.services.book} ${service.name}`}
      >
        {booking.services.book}
      </Button>
    </div>
  );
}

/**
 * La barra fija del teléfono.
 *
 * Sólo en pantallas chicas: en el escritorio ese lugar lo ocupa la tarjeta
 * lateral, que además queda siempre a la vista sin tapar contenido. Acá, en
 * cambio, tapar dos centímetros del final de la página es el precio de que
 * "Reservar" esté siempre a un pulgar de distancia.
 */
export function MobileBookingBar({
  profile,
}: {
  profile: PublicBusinessProfile;
}) {
  const { start } = useBooking();

  if (profile.services.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-30 border-t border-paper-300 bg-paper-50/95 px-5 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-ink-600">
          {booking.header.servicesCount(profile.services.length)}
        </p>
        <Button onClick={() => start()}>{booking.services.bookNow}</Button>
      </div>
    </div>
  );
}

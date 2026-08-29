import type {
  CreateBookingInput,
  PublicBookingConfirmation,
  PublicSlot,
  PublicStaff,
} from "./types";

/**
 * Lo que el navegador le pide a la propia landing.
 *
 * Nunca a la API de Polaria: del otro lado de estas URLs están los route
 * handlers de `app/api/booking/`, que reenvían desde el servidor. Por eso acá
 * no hay ninguna URL configurable ni ninguna clave.
 *
 * Todas las funciones aceptan un `AbortSignal` porque el flujo cambia de
 * opinión seguido: alguien toca tres días seguidos del selector antes de
 * decidirse, y sin cancelar, la respuesta de la primera fecha puede llegar
 * después de la tercera y pisar la lista con horarios de otro día.
 */

export class BookingRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BookingRequestError";
  }

  /** El horario se ocupó mientras el cliente completaba el formulario. */
  get isSlotTaken(): boolean {
    return this.status === 409;
  }
}

async function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw await toError(response);
  return (await response.json()) as T;
}

async function toError(response: Response): Promise<BookingRequestError> {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  return new BookingRequestError(
    response.status,
    body?.message ?? "No pudimos completar la operación.",
  );
}

const base = (slug: string) => `/api/booking/${encodeURIComponent(slug)}`;

export function fetchStaff(
  slug: string,
  serviceId: string,
  signal?: AbortSignal,
): Promise<PublicStaff[]> {
  return get(`${base(slug)}/staff?serviceId=${serviceId}`, signal);
}

export function fetchDays(
  slug: string,
  params: { serviceId: string; staffId?: string },
  signal?: AbortSignal,
): Promise<string[]> {
  const query = new URLSearchParams({ serviceId: params.serviceId });
  if (params.staffId) query.set("staffId", params.staffId);

  return get(`${base(slug)}/days?${query}`, signal);
}

export function fetchSlots(
  slug: string,
  params: { serviceId: string; date: string; staffId?: string },
  signal?: AbortSignal,
): Promise<PublicSlot[]> {
  const query = new URLSearchParams({
    serviceId: params.serviceId,
    date: params.date,
  });
  if (params.staffId) query.set("staffId", params.staffId);

  return get(`${base(slug)}/slots?${query}`, signal);
}

export async function submitBooking(
  slug: string,
  input: CreateBookingInput,
): Promise<PublicBookingConfirmation> {
  const response = await fetch(`${base(slug)}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw await toError(response);
  return (await response.json()) as PublicBookingConfirmation;
}

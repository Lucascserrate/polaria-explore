import "server-only";

import {
  BUSINESS_PROFILE_REVALIDATE_SECONDS,
  POLARIA_API_URL,
} from "@/config/api";
import type {
  CreateBookingInput,
  PublicBookingConfirmation,
  PublicBusinessProfile,
  PublicSlot,
  PublicStaff,
} from "./types";

/**
 * El único lugar de la landing que habla con la API de Polaria.
 *
 * `server-only` no es decorativo: si alguien importa esto desde un componente
 * de cliente, el build falla en lugar de mandar la URL interna de la API al
 * navegador. Todo lo que el navegador necesita pasa por los route handlers de
 * `app/api/booking/`, que llaman a estas mismas funciones.
 *
 * No hay lógica de reservas acá. Disponibilidad, asignación de profesional y
 * creación de la cita son del backend, que es el mismo que atiende WhatsApp y
 * el panel. Esta capa traduce HTTP y nada más.
 */

/**
 * Un error de la API con su código, para que el llamador decida.
 *
 * El caso que importa es el 409: el horario se ocupó entre que se mostró la
 * lista y el cliente tocó "Confirmar". No es una falla, es la carrera normal de
 * una agenda compartida, y la pantalla tiene que poder distinguirlo de "se cayó
 * internet" para ofrecer otro horario en lugar de un mensaje de error.
 */
export class BookingApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BookingApiError";
  }
}

type FetchOptions = {
  /** Segundos de caché. Omitirlo pide siempre en vivo. */
  revalidate?: number;
};

async function request<T>(
  path: string,
  init?: RequestInit & FetchOptions,
): Promise<T> {
  const { revalidate, ...rest } = init ?? {};

  const response = await fetch(`${POLARIA_API_URL}${path}`, {
    ...rest,
    headers: { "Content-Type": "application/json", ...rest.headers },
    // Sin `revalidate` explícito, en vivo: es lo correcto para todo lo que
    // depende de la agenda, que cambia mientras el cliente mira la pantalla.
    cache: revalidate === undefined ? "no-store" : undefined,
    next: revalidate === undefined ? undefined : { revalidate },
  });

  if (!response.ok) {
    throw new BookingApiError(response.status, await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

/**
 * El mensaje que mandó la API, o uno genérico.
 *
 * Nest devuelve `message` en el cuerpo del error, y ese texto está escrito para
 * el cliente final —"Ese horario se acaba de ocupar"—, así que se muestra tal
 * cual. Si el cuerpo no se puede leer, el genérico: nunca un `undefined` en
 * pantalla.
 */
async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: unknown };
    if (typeof body.message === "string") return body.message;
    if (Array.isArray(body.message) && typeof body.message[0] === "string") {
      return body.message[0];
    }
  } catch {
    // Cuerpo vacío o no-JSON: cae al genérico de abajo.
  }

  return "No pudimos completar la operación. Probá de nuevo.";
}

/**
 * Traduce un fallo de la API a la respuesta que devuelve un route handler.
 *
 * Vive acá y no repetido en cada handler para que el 409 —el horario que se
 * ocupó mientras el cliente elegía— llegue siempre al navegador como 409 y con
 * su texto. Es el único código que la pantalla trata distinto.
 */
export function toErrorResponse(error: unknown): Response {
  if (error instanceof BookingApiError) {
    return Response.json(
      { message: error.message },
      { status: error.status === 404 ? 404 : error.status },
    );
  }

  console.error("[polaria:booking]", error);
  return Response.json(
    { message: "No pudimos completar la operación. Probá de nuevo." },
    { status: 502 },
  );
}

const businessPath = (slug: string) =>
  `/public/businesses/${encodeURIComponent(slug)}`;

/**
 * El perfil del negocio. Devuelve `null` cuando el slug no existe, para que la
 * página responda un 404 de verdad en lugar de una pantalla de error.
 */
export async function getBusinessProfile(
  slug: string,
): Promise<PublicBusinessProfile | null> {
  try {
    return await request<PublicBusinessProfile>(businessPath(slug), {
      revalidate: BUSINESS_PROFILE_REVALIDATE_SECONDS,
    });
  } catch (error) {
    if (error instanceof BookingApiError && error.status === 404) return null;
    throw error;
  }
}

export function getStaffForService(
  slug: string,
  serviceId: string,
): Promise<PublicStaff[]> {
  const query = new URLSearchParams({ serviceId });
  return request<PublicStaff[]>(`${businessPath(slug)}/staff?${query}`);
}

export function getSlots(
  slug: string,
  params: { serviceId: string; date: string; staffId?: string },
): Promise<PublicSlot[]> {
  const query = new URLSearchParams({
    serviceId: params.serviceId,
    date: params.date,
  });
  if (params.staffId) query.set("staffId", params.staffId);

  return request<PublicSlot[]>(`${businessPath(slug)}/slots?${query}`);
}

/** Los días que el negocio atiende, de hoy en adelante. */
export function getServiceableDays(
  slug: string,
  params: { serviceId: string; staffId?: string; days?: number },
): Promise<string[]> {
  const query = new URLSearchParams({ serviceId: params.serviceId });
  if (params.staffId) query.set("staffId", params.staffId);
  if (params.days) query.set("days", String(params.days));

  return request<string[]>(`${businessPath(slug)}/days?${query}`);
}

export function createBooking(
  slug: string,
  input: CreateBookingInput,
): Promise<PublicBookingConfirmation> {
  return request<PublicBookingConfirmation>(`${businessPath(slug)}/bookings`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

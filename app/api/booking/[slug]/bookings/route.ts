import { createBooking } from "@/services/booking/server/bookings";
import { toErrorResponse } from "@/services/booking/server/request";
import { customerCookieHeader } from "@/services/customer/server/session";
import type { CreateBookingInput } from "@/services/booking/types";

/**
 * Crea la reserva.
 *
 * Lo único que hace acá es comprobar que estén los campos, y no porque haga
 * falta: la API los valida de nuevo con sus DTO y, sobre todo, revalida el
 * horario contra la agenda antes de escribir nada. El chequeo está para
 * devolver un 400 sin dar un salto de red por un formulario a medio llenar.
 *
 * Lo que **no** viaja desde el navegador: la duración, el precio y el
 * profesional definitivo. Los tres los resuelve el servidor a partir del
 * servicio y de la disponibilidad real.
 *
 * Con sesión de cliente tampoco viajan el nombre ni el teléfono: los toma la
 * API de la cuenta. Por eso el chequeo de campos de abajo depende de si hay
 * cookie —exigirlos igual dejaría a quien inició sesión sin poder reservar—, y
 * si el navegador los manda de todas formas, la API los ignora.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const body = (await request.json().catch(() => null)) as Partial<
    Record<keyof CreateBookingInput, unknown>
  > | null;

  const serviceIds = asIds(body?.serviceIds);
  const staffIds = asIds(body?.staffIds);
  const startTime = asText(body?.startTime);
  const customerName = asText(body?.customerName);
  const customerPhone = asText(body?.customerPhone);
  const cookie = customerCookieHeader(request.headers.get("cookie"));

  const missingCustomer = !cookie && (!customerName || !customerPhone);
  if (serviceIds.length === 0 || !startTime || missingCustomer) {
    return Response.json({ message: "Faltan datos" }, { status: 400 });
  }

  /*
   * Las dos listas se emparejan por posición, así que una más corta dejaría al
   * último servicio con "cualquier profesional" sin que nadie lo haya pedido.
   * La API lo rechaza igual; devolverlo acá evita el salto de red.
   */
  if (staffIds.length > 0 && staffIds.length !== serviceIds.length) {
    return Response.json(
      { message: "Falta el profesional de alguno de los servicios" },
      { status: 400 },
    );
  }

  try {
    const { data, setCookie } = await createBooking(
      slug,
      {
        serviceIds,
        ...(staffIds.length > 0 ? { staffIds } : {}),
        startTime,
        // Con sesión no se mandan: los pone la API desde la cuenta.
        ...(cookie ? {} : { customerName, customerPhone }),
      },
      cookie,
    );

    const response = Response.json(data, { status: 201 });

    /*
     * Las cookies de la API se reenvían tal cual. Sin sesión viene una que dice
     * que este navegador creó el turno, y es lo único que después permite
     * pasárselo a la cuenta si la persona inicia sesión desde la pantalla de
     * confirmación. Se copian sin mirarlas: quien decide qué poner, cuánto dura
     * y con qué dominio es quien las firma. Ver `BookingClaimService`.
     */
    for (const value of setCookie) {
      response.headers.append("set-cookie", value);
    }

    return response;
  } catch (error) {
    return toErrorResponse(error);
  }
}

const asText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const asIds = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(asText).filter(Boolean) : [];

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

  const serviceId = asText(body?.serviceId);
  const startTime = asText(body?.startTime);
  const customerName = asText(body?.customerName);
  const customerPhone = asText(body?.customerPhone);
  const cookie = customerCookieHeader(request.headers.get("cookie"));

  const missingCustomer = !cookie && (!customerName || !customerPhone);
  if (!serviceId || !startTime || missingCustomer) {
    return Response.json({ message: "Faltan datos" }, { status: 400 });
  }

  try {
    return Response.json(
      await createBooking(
        slug,
        {
          serviceId,
          staffId: asText(body?.staffId) || undefined,
          startTime,
          // Con sesión no se mandan: los pone la API desde la cuenta.
          ...(cookie ? {} : { customerName, customerPhone }),
        },
        cookie,
      ),
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

const asText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

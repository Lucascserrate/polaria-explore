import { createBooking } from "@/services/booking/server/bookings";
import { toErrorResponse } from "@/services/booking/server/request";
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

  if (!serviceId || !startTime || !customerName || !customerPhone) {
    return Response.json({ message: "Faltan datos" }, { status: 400 });
  }

  try {
    return Response.json(
      await createBooking(slug, {
        serviceId,
        staffId: asText(body?.staffId) || undefined,
        startTime,
        customerName,
        customerPhone,
      }),
      { status: 201 },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

const asText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

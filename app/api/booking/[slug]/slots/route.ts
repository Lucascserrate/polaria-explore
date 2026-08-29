import { getSlots } from "@/services/booking/server/slots";
import { toErrorResponse } from "@/services/booking/server/request";

/** Horarios disponibles para un servicio y una fecha. Ver `staff/route.ts`. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const query = new URL(request.url).searchParams;

  const serviceId = query.get("serviceId");
  const date = query.get("date");

  if (!serviceId || !date) {
    return Response.json(
      { message: "Faltan serviceId o date" },
      { status: 400 },
    );
  }

  try {
    return Response.json(
      await getSlots(slug, {
        serviceId,
        date,
        // Ausente es "cualquier profesional", que es una opción real y no un
        // dato faltante: quién atiende lo resuelve el servidor al confirmar.
        staffId: query.get("staffId") ?? undefined,
      }),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

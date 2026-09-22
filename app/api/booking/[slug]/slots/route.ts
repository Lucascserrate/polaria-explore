import { getSlots } from "@/services/booking/server/slots";
import { toErrorResponse } from "@/services/booking/server/request";
import { readSelection } from "@/services/booking/selection";

/** Horarios disponibles para una reserva y una fecha. Ver `staff/route.ts`. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const query = new URL(request.url).searchParams;

  // `staffIds` ausente es "cualquier profesional", que es una opción real y no
  // un dato faltante: quién atiende lo resuelve el servidor al confirmar.
  const selection = readSelection(query);
  const date = query.get("date");

  if (!selection || !date) {
    return Response.json(
      { message: "Faltan los servicios o la fecha" },
      { status: 400 },
    );
  }

  try {
    return Response.json(await getSlots(slug, { ...selection, date }));
  } catch (error) {
    return toErrorResponse(error);
  }
}

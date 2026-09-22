import { getServiceableDays } from "@/services/booking/server/days";
import { toErrorResponse } from "@/services/booking/server/request";
import { readSelection } from "@/services/booking/selection";

/**
 * Los días que el negocio atiende, para no dejar tocar una fecha que no lleva a
 * ninguna parte. Ver `staff/route.ts`.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const query = new URL(request.url).searchParams;

  const selection = readSelection(query);
  if (!selection) {
    return Response.json({ message: "Faltan los servicios" }, { status: 400 });
  }

  const days = Number(query.get("days"));

  try {
    return Response.json(
      await getServiceableDays(slug, {
        ...selection,
        days: Number.isFinite(days) && days > 0 ? days : undefined,
      }),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

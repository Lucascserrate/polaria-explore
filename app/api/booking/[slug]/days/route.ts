import { getServiceableDays } from "@/services/booking/server/days";
import { toErrorResponse } from "@/services/booking/server/request";

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

  const serviceId = query.get("serviceId");
  if (!serviceId) {
    return Response.json({ message: "Falta serviceId" }, { status: 400 });
  }

  const days = Number(query.get("days"));

  try {
    return Response.json(
      await getServiceableDays(slug, {
        serviceId,
        staffId: query.get("staffId") ?? undefined,
        days: Number.isFinite(days) && days > 0 ? days : undefined,
      }),
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}

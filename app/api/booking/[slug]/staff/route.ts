import { getStaffForService } from "@/services/booking/server/staff";
import { toErrorResponse } from "@/services/booking/server/request";

/**
 * Los profesionales que hacen un servicio.
 *
 * Los handlers de `app/api/booking/` son pasamanos: reciben lo que el navegador
 * necesita preguntar y se lo delegan a la API de Polaria desde el servidor.
 * Ninguno decide nada —ni disponibilidad, ni precios, ni quién atiende— y
 * ninguno acepta un parámetro que la API no vaya a validar de nuevo.
 *
 * Existen por dos razones concretas: que la URL de la API no viaje al
 * navegador, y que no haya que abrirle CORS a este dominio.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const serviceId = new URL(request.url).searchParams.get("serviceId");

  if (!serviceId) {
    return Response.json({ message: "Falta serviceId" }, { status: 400 });
  }

  try {
    return Response.json(await getStaffForService(slug, serviceId));
  } catch (error) {
    return toErrorResponse(error);
  }
}

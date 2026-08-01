/**
 * Captura de contactos para el acceso anticipado.
 *
 * ESTADO: sin persistencia. Valida y registra en el log del servidor para que
 * el flujo de la interfaz sea real, pero todavía no guarda en ningún lado.
 * TODO: conectar a la base de datos, hoja de cálculo o CRM antes de publicar,
 * o los contactos se pierden.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const contact =
    body && typeof body.contact === "string" ? body.contact.trim() : "";
  const source =
    body && typeof body.source === "string" ? body.source.slice(0, 40) : "desconocido";

  if (contact.length < 6 || contact.length > 80) {
    return Response.json(
      { ok: false, error: "Contacto inválido" },
      { status: 400 },
    );
  }

  console.info("[polaria:waitlist]", { contact, source });

  return Response.json({ ok: true });
}

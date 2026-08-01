export const benefits = {
  eyebrow: "Beneficios",
  title: "Lo que cambia en tu día",
  description:
    "No es tener un chatbot. Es dejar de perder citas y dejar de mirar el teléfono cada cinco minutos.",

  items: [
    {
      icon: "moon" as const,
      title: "La noche deja de ser tiempo perdido",
      body: "El mensaje que llega a las once de la noche ya no espera hasta mañana. Para cuando abrís, la cita está tomada.",
    },
    {
      icon: "chat" as const,
      title: "No cortás lo que estás haciendo",
      body: "Nadie suelta la máquina a mitad de un fade para contestar «¿tenés lugar hoy?».",
    },
    {
      icon: "clock" as const,
      title: "Menos ausencias",
      body: "Polaria manda el recordatorio antes de cada cita y reacomoda al que avisa que no llega.",
    },
    {
      icon: "calendar" as const,
      title: "La agenda deja de estar en tu cabeza",
      body: "Cada cita queda anotada con nombre, servicio y hora. Y la podés ver desde el teléfono.",
    },
  ],

  /**
   * Reemplaza a la sección de precios, que todavía no existe. Mantiene la
   * conversación económica sin comprometer un número, y de paso devuelve datos
   * reales para validar cuánto cobrar.
   */
  calculator: {
    title: "¿Cuánto te cuesta no contestar?",
    question: "Mensajes que recibís por día",
    resultLabel: "Citas que probablemente estés perdiendo por mes",
    // La honestidad del supuesto es lo que hace creíble al número.
    disclaimer:
      "Estimación, no una medición: asumimos que 1 de cada 3 mensajes llega fuera de horario y que 1 de cada 3 de esos no vuelve a escribir.",
    footnote:
      "Si el número te parece alto, es porque los mensajes sin responder no se anotan en ningún lado.",
  },
} as const;

/** Supuestos de la calculadora, explicitados arriba en el disclaimer. */
export const calculatorAssumptions = {
  outsideHoursRate: 1 / 3,
  neverReturnsRate: 1 / 3,
  daysPerMonth: 26,
  min: 5,
  max: 60,
  default: 20,
} as const;

export function estimateLostAppointments(messagesPerDay: number) {
  const { outsideHoursRate, neverReturnsRate, daysPerMonth } = calculatorAssumptions;
  return Math.round(
    messagesPerDay * daysPerMonth * outsideHoursRate * neverReturnsRate,
  );
}

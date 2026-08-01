/**
 * Guion de la reproducción automática.
 *
 * Recorre la reserva guiada completa —menú, servicio, profesional, horario—
 * porque ése es el producto real, no una charla suelta con un chatbot. Pasa
 * por el MISMO motor que el visitante: no hay un camino "de demo" aparte.
 *
 * Cinco pasos, la mayoría toques: el flujo guiado es rápido justamente porque
 * casi no hay que escribir.
 */
export type AutoplayStep =
  | { kind: "type"; text: string; delayBefore: number }
  | { kind: "tap"; actionId: string; label: string; delayBefore: number };

export const autoplayScript: AutoplayStep[] = [
  { kind: "type", text: "Hola", delayBefore: 650 },
  { kind: "tap", actionId: "menu:reservar", label: "Reservar una cita", delayBefore: 950 },
  { kind: "tap", actionId: "service:corte-barba", label: "Corte + barba", delayBefore: 850 },
  { kind: "tap", actionId: "barber:martin", label: "Martín", delayBefore: 850 },
  { kind: "tap", actionId: "slot:14:30", label: "14:30", delayBefore: 950 },
];

/** Milisegundos por carácter mientras el guion "tipea". */
export const typingSpeedMs = 30;

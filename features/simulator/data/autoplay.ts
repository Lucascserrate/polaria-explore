import { beat } from "@/features/simulator/data/pacing";

/**
 * Guion de la reproducción automática.
 *
 * Recorre la reserva guiada completa —menú, servicio, profesional, horario—
 * porque ése es el producto real, no una charla suelta con un chatbot. Pasa
 * por el MISMO motor que el visitante: no hay un camino "de demo" aparte.
 *
 * Cinco pasos, la mayoría toques: el flujo guiado es rápido justamente porque
 * casi no hay que escribir.
 *
 * `delayBefore` es tiempo de lectura, no relleno: cada toque llega después de
 * que se pueda recorrer con la vista la lista que Polaria acaba de ofrecer. Los
 * valores pasan por `beat()`, así que `PACE` en `data/pacing.ts` los mueve a
 * todos juntos.
 */
export type AutoplayStep =
  | { kind: "type"; text: string; delayBefore: number }
  | { kind: "tap"; actionId: string; label: string; delayBefore: number };

export const autoplayScript: AutoplayStep[] = [
  { kind: "type", text: "Hola", delayBefore: beat(800) },
  {
    kind: "tap",
    actionId: "menu:reservar",
    label: "Reservar una cita",
    delayBefore: beat(1250),
  },
  {
    kind: "tap",
    actionId: "service:corte-barba",
    label: "Corte + barba",
    delayBefore: beat(1200),
  },
  {
    kind: "tap",
    actionId: "barber:martin",
    label: "Martín",
    delayBefore: beat(1200),
  },
  { kind: "tap", actionId: "slot:14:30", label: "14:30", delayBefore: beat(1300) },
];

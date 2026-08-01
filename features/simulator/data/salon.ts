import type { AgendaSlot, Barber, BarberId } from "@/features/simulator/types";

/**
 * El negocio ficticio de la simulación.
 *
 * Todo lo específico de mercado vive acá: moneda, precios, nombres, horarios.
 * Adaptar la demo a otro país o a otro rubro es editar este archivo, no la UI.
 */
export const salon = {
  name: "Barbería Aurora",
  owner: "Martín",
  clientName: "Nico",
  currency: "Bs",

  /** El detalle que explica el producto entero: el mensaje llega con todo cerrado. */
  today: "domingo",
  targetDay: "mañana, lunes 12",
  shortDay: "lun 12",
  /** Reloj de arranque de la conversación, en minutos desde medianoche (22:14). */
  startClock: 22 * 60 + 14,

  hours: "Lunes a sábado, 9:00 a 20:00",
  closedNote: "Los domingos está cerrado.",

  services: [
    { key: "corte", label: "Corte", price: 50, minutes: 30 },
    { key: "corte-barba", label: "Corte + barba", price: 70, minutes: 45 },
    { key: "barba", label: "Barba", price: 35, minutes: 20 },
    { key: "nino", label: "Corte niño", price: 40, minutes: 30 },
  ],
} as const;

export type ServiceKey = (typeof salon.services)[number]["key"];

/**
 * Dos profesionales con agendas deliberadamente distintas.
 *
 * En una barbería real la gente vuelve siempre con el mismo barbero, y cada
 * uno tiene su propia disponibilidad. Que el visitante vea cambiar los
 * horarios al cambiar de profesional es lo que demuestra que Polaria gestiona
 * agendas de verdad y no sólo contesta mensajes.
 */
export const barbers: Barber[] = [
  { id: "martin", name: "Martín", role: "Fade, barba y diseño" },
  { id: "rocio", name: "Rocío", role: "Color, corte y peinado" },
];

export const ANY_BARBER = "any" as const;

export function barberById(id: BarberId | null | undefined) {
  return barbers.find((b) => b.id === id) ?? barbers[0];
}

export function serviceByKey(key: string | null | undefined) {
  return salon.services.find((s) => s.key === key) ?? salon.services[0];
}

export function formatPrice(amount: number) {
  return `${salon.currency} ${amount}`;
}

/** Agenda inicial de cada profesional para el lunes. */
export const initialAgendas: Record<BarberId, AgendaSlot[]> = {
  // Martín está casi lleno: es el que todos piden.
  martin: [
    { time: "09:00", state: "busy", label: "Corte · Álvaro" },
    { time: "10:00", state: "busy", label: "Barba · Rubén" },
    { time: "11:30", state: "free" },
    { time: "14:30", state: "free" },
    { time: "16:00", state: "busy", label: "Corte + barba · Diego" },
    { time: "17:00", state: "busy", label: "Corte · Iván" },
    { time: "18:30", state: "busy", label: "Corte · Seba" },
  ],
  // Rocío tiene otros huecos. El contraste es el punto de la demo.
  rocio: [
    { time: "09:00", state: "free" },
    { time: "10:00", state: "busy", label: "Color · Vale" },
    { time: "11:30", state: "busy", label: "Corte · Ana" },
    { time: "14:30", state: "busy", label: "Peinado · Luz" },
    { time: "16:00", state: "free" },
    { time: "17:00", state: "free" },
    { time: "18:30", state: "busy", label: "Color · Mica" },
  ],
};

/** Cuántos horarios se ofrecen como botones. WhatsApp permite tres. */
export const MAX_OFFERED_SLOTS = 3;

export function freeSlotsOf(
  agendas: Record<BarberId, AgendaSlot[]>,
  barberId: BarberId,
) {
  return (agendas[barberId] ?? [])
    .filter((slot) => slot.state === "free")
    .map((slot) => slot.time);
}

/** Unión ordenada de huecos libres, para cuando no hay preferencia. */
export function freeSlotsAnyBarber(agendas: Record<BarberId, AgendaSlot[]>) {
  const times = new Set<string>();
  for (const barber of barbers) {
    for (const time of freeSlotsOf(agendas, barber.id)) times.add(time);
  }
  return [...times].sort();
}

/** Primer profesional con ese horario libre. Resuelve el "sin preferencia". */
export function firstBarberFreeAt(
  agendas: Record<BarberId, AgendaSlot[]>,
  time: string,
): BarberId {
  const match = barbers.find((barber) =>
    agendas[barber.id]?.some((slot) => slot.time === time && slot.state === "free"),
  );
  return match?.id ?? barbers[0].id;
}

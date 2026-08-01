import type { AgendaSlot } from "@/features/simulator/types";

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

export function serviceByKey(key: string) {
  return salon.services.find((s) => s.key === key) ?? salon.services[0];
}

export function formatPrice(amount: number) {
  return `${salon.currency} ${amount}`;
}

/** Lista de precios lista para pegar en un mensaje. */
export function priceList() {
  return salon.services
    .map((s) => `${s.label} — ${formatPrice(s.price)}`)
    .join("\n");
}

/** Agenda inicial del lunes. Los huecos libres son los que se pueden reservar. */
export const initialAgenda: AgendaSlot[] = [
  { time: "09:00", state: "busy", label: "Corte · Álvaro" },
  { time: "10:00", state: "busy", label: "Barba · Rubén" },
  { time: "11:30", state: "free" },
  { time: "14:30", state: "free" },
  { time: "16:00", state: "busy", label: "Corte + barba · Diego" },
  { time: "17:00", state: "free" },
  { time: "18:30", state: "busy", label: "Color · Vale" },
];

/** Horarios que Polaria ofrece primero. Deben existir y estar libres arriba. */
export const defaultOfferedSlots = ["11:30", "14:30"];

/** Horarios alternativos cuando alguien quiere mover una cita ya tomada. */
export const alternativeSlots = ["11:30", "17:00"];

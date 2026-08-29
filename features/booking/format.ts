import { booking, dayNames } from "@/content/booking";
import type { BusinessStatus } from "@/services/booking/types";

/**
 * Formato de precios, duraciones y horas.
 *
 * Todo se resuelve con `Intl` y con la zona horaria **del negocio**, nunca con
 * la del navegador. No es un detalle: un cliente que abre el enlace desde otro
 * país tiene que leer "sábado a las 15:00" igual que quien lo abre desde la
 * cuadra de al lado, porque esa es la hora a la que tiene que estar ahí.
 *
 * Acá no hay texto: los literales viven en `content/booking.ts`. Esto sólo
 * decide cómo se ven los números.
 */

/**
 * Un solo locale para toda la página: precios, fechas y horas.
 *
 * Es el del sitio (`site.locale`). Tenerlo en una constante y no repetido en
 * cada `Intl` es lo que evita que la lista de horarios y el comprobante escriban
 * la misma fecha de dos maneras distintas.
 */
const LOCALE = "es-BO";

/**
 * Precio con la moneda del negocio, sin centavos.
 *
 * Los centavos sólo agregan ruido en una lista de servicios: nadie cobra
 * Bs 79,60 por un corte. Es la misma decisión que toma el backend cuando arma
 * los mensajes de WhatsApp.
 */
export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Un código de moneda inválido haría explotar `Intl`. Antes que romper la
    // página entera, se muestra el número solo.
    return new Intl.NumberFormat(LOCALE, {
      maximumFractionDigits: 0,
    }).format(amount);
  }
}

/** "45 min", "1 h", "1 h 30 min". Las horas redondas no arrastran "0 min". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** `HH:MM` de un instante, en la zona del negocio. */
export function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** "sábado 29 de agosto". Para el resumen y el comprobante. */
export function formatLongDate(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(iso));
}

/**
 * Las tres piezas de una tarjeta de día del selector.
 *
 * Van separadas y no como una cadena armada porque el diseño las apila —día de
 * la semana arriba, número grande al medio, mes abajo— y partir una cadena
 * formateada para volver a componerla sería trabajar en contra de `Intl`.
 */
export function formatDayChip(
  date: string,
  timeZone: string,
): { weekday: string; day: string; month: string } {
  // Mediodía en UTC: cualquier zona del continente cae en el mismo día de
  // calendario, así que la tarjeta nunca muestra el día anterior.
  const reference = new Date(`${date}T12:00:00Z`);

  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(LOCALE, { timeZone, ...options })
      .format(reference)
      .replace(/\.$/, "");

  return {
    weekday: part({ weekday: "short" }),
    day: part({ day: "numeric" }),
    month: part({ month: "short" }),
  };
}

/** La fecha de calendario (`YYYY-MM-DD`) de un instante, en la zona del negocio. */
export function toCalendarDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** El día de la semana (0 = domingo) que se está viviendo en esa zona. */
export function currentDayOfWeek(timeZone: string, now: Date): number {
  const [year, month, day] = toCalendarDate(now, timeZone)
    .split("-")
    .map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

/** "09:00" a partir del "09:00:00" que puede llegar del backend. */
export function trimSeconds(time: string): string {
  const [hours = "00", minutes = "00"] = time.split(":");
  return `${hours.padStart(2, "0")}:${minutes}`;
}

/**
 * El estado del negocio, ya escrito.
 *
 * El backend manda el hecho —abierto hasta las 20:00, cerrado y abre el sábado
 * a las 9:00— y acá se elige la frase. Que la cuenta la haga el servidor es lo
 * que hace que "hoy" signifique lo mismo para todos.
 */
export function describeStatus(status: BusinessStatus): string {
  if (status.open) return booking.status.open(status.closesAt);
  if (!status.opensAt) return booking.status.unknown;

  const { daysAhead, time, dayOfWeek } = status.opensAt;

  if (daysAhead === 0) return booking.status.closedToday(time);
  if (daysAhead === 1) return booking.status.closedTomorrow(time);

  return booking.status.closedOn(dayNames[dayOfWeek], time);
}

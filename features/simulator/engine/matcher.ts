import { normalizeText } from "@/lib/utils";
import { intents, type IntentId } from "@/features/simulator/engine/intents";

/**
 * Reconocimiento de intención por puntaje.
 *
 * No hay LLM detrás y no hace falta: la demo tiene que ser predecible. Lo que
 * sí importa es que nunca falle de forma visible, y de eso se encarga el
 * fallback a derivación humana en graph.ts.
 */

export type IntentMatch = { id: IntentId; score: number };

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Coincidencia como palabra completa: "corte" no debe activarse en "cortesía". */
function hasWord(haystack: string, word: string) {
  return new RegExp(`(?:^|\\s)${escapeRegExp(word)}(?:\\s|$)`).test(haystack);
}

export function matchIntent(input: string): IntentMatch | null {
  const text = normalizeText(input);
  if (!text) return null;

  let best: IntentMatch | null = null;

  for (const intent of intents) {
    let score = 0;

    // Las frases son señal fuerte y escalan con su longitud.
    for (const phrase of intent.phrases) {
      if (text.includes(phrase)) score += 2 + phrase.split(" ").length;
    }

    // Las palabras sueltas son señal débil.
    for (const token of intent.tokens) {
      if (hasWord(text, token)) score += 1;
    }

    if (score > 0 && (best === null || score > best.score)) {
      best = { id: intent.id, score };
    }
  }

  return best;
}

/**
 * Elección de horario. Corre ANTES del matcher de intenciones cuando Polaria
 * está esperando que se elija un hueco, porque "las 5" o "la primera" no son
 * una intención: son una respuesta a la pregunta anterior.
 */
export function matchSlotChoice(input: string, offered: string[]): string | null {
  if (offered.length === 0) return null;
  const text = normalizeText(input);
  if (!text) return null;

  // 1. Hora con minutos, en 24h o en 12h: "14:30", "2:30", "9:00".
  //    Se recorre `offered` en orden, así que un "2:30" no puede quedarse con
  //    el hueco de las 11:30 antes de llegar al de las 14:30.
  for (const slot of offered) {
    const [rawHour, minutes] = slot.split(":");
    const hour = Number(rawHour);

    const forms = new Set([slot, `${hour}:${minutes}`]);
    if (hour > 12) forms.add(`${hour - 12}:${minutes}`);

    for (const form of forms) {
      if (text.includes(form)) return slot;
    }
  }

  // 2. Sólo la hora, en formato 24h o 12h: "a las 14", "las 5", "5 pm".
  for (const slot of offered) {
    const hour = Number(slot.split(":")[0]);
    const candidates = hour > 12 ? [hour, hour - 12] : [hour];
    for (const candidate of candidates) {
      if (new RegExp(`(?:^|\\s)${candidate}(?::00)?(?:\\s*(?:hs?|pm|am))?(?:\\s|$)`).test(text)) {
        return slot;
      }
    }
  }

  // 3. Ordinales: "la primera", "el segundo", "el último".
  if (/(?:^|\s)(?:el |la )?(?:primer|primero|primera)(?:\s|$)/.test(text)) return offered[0];
  if (/(?:^|\s)(?:el |la )?(?:segundo|segunda)(?:\s|$)/.test(text)) {
    return offered[1] ?? offered[0];
  }
  if (/(?:^|\s)(?:el |la )?(?:ultimo|ultima)(?:\s|$)/.test(text)) {
    return offered[offered.length - 1];
  }

  // 4. Franja horaria. Nota: "manana" sola es ambigua (mañana = día siguiente),
  //    así que sólo aceptamos las formas que sí desambiguan.
  const isMorning = /(?:por|en) la manana|temprano/.test(text);
  const isAfternoon = /(?:por|en) la tarde|mas tarde/.test(text);

  if (isMorning) {
    const morning = offered.find((s) => Number(s.split(":")[0]) < 12);
    if (morning) return morning;
  }
  if (isAfternoon) {
    const afternoon = offered.find((s) => Number(s.split(":")[0]) >= 12);
    if (afternoon) return afternoon;
  }

  return null;
}

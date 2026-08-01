import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Une clases condicionales resolviendo conflictos de Tailwind. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Quita acentos, signos y espacios extra. Es la base del matcher de intents:
 * "¿Cuánto está el corte?" -> "cuanto esta el corte".
 */
export function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    // Se conservan los ":" a propósito: el matcher necesita leer "14:30".
    .replace(/[¿?¡!.,;()"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

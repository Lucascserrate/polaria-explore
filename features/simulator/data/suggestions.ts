/** Chips sugeridos. Nadie escribe primero en una landing: hay que darle a mano. */

export const openingSuggestions = [
  "¿Tienen cita para mañana?",
  "¿Cuánto cuesta un corte?",
  "¿Hasta qué hora atienden?",
];

export const afterBookingSuggestions = [
  "Quiero cambiar mi cita",
  "¿Aceptan tarjeta?",
  "Gracias",
];

export const browsingSuggestions = [
  "¿Tienen cita para mañana?",
  "¿Atienden niños?",
  "¿Dónde están?",
];

/** Cuando Polaria ofreció horarios, los chips son los horarios mismos. */
export function slotSuggestions(slots: string[]) {
  return [...slots, "¿Cuánto cuesta?"];
}

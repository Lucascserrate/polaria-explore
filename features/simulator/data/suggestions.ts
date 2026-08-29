/**
 * Chips sugeridos. Nadie escribe primero en una landing: hay que darle a mano.
 *
 * Sólo proponen cosas que Polaria hace. La versión anterior invitaba a preguntar
 * por medios de pago, ubicación o si atienden niños —"¿Aceptan tarjeta?",
 * "¿Dónde están?"—, y el producto no contesta nada de eso: responde con el menú.
 * Un chip es una promesa; estos son los que se pueden cumplir.
 */

export const openingSuggestions = [
	"Quiero sacar un turno",
	"¿Tenés lugar mañana?",
	"Hablar con alguien",
];

export const afterBookingSuggestions = [
	"Quiero cambiar mi cita",
	"Quiero cancelar",
	"Gracias",
];

export const browsingSuggestions = [
	"Quiero sacar un turno",
	"¿Tenés lugar hoy?",
	"Hablar con alguien",
];

/** Cuando Polaria ofreció horarios, los chips son los horarios mismos. */
export function slotSuggestions(slots: string[]) {
	return [...slots, "Otro horario"];
}

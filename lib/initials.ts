/**
 * Hasta dos iniciales: "Lucas Camacho" → "LC", "Carlos" → "C".
 *
 * Se salta lo que no empieza con letra —un apodo entre comillas, un emoji en el
 * nombre— porque una inicial que no es una letra no dice nada. Si no queda
 * ninguna devuelve cadena vacía, y el círculo se ve liso: mejor que un signo
 * raro.
 *
 * Vive en `lib/` porque lo usan dos cosas distintas: el avatar de un
 * profesional en la reserva y el de la cuenta en la barra. Dos copias de esta
 * función significarían que el mismo nombre se abrevia distinto en la misma
 * pantalla.
 */
export function initials(name: string): string {
	return name
		.split(/\s+/)
		.map((word) => word.trim())
		.filter((word) => /^\p{L}/u.test(word))
		.slice(0, 2)
		.map((word) => word[0].toUpperCase())
		.join('');
}

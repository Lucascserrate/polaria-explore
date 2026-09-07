/**
 * El texto del mapa interactivo.
 *
 * Poco, porque un mapa se explica solo. Lo que sí necesita palabras es lo que
 * no se ve: el aviso de que no está configurado, y lo que un lector de pantalla
 * anuncia al llegar a un marcador.
 */
export const map = {
	/**
	 * Cuando falta el token.
	 *
	 * Se lo dice al visitante en su idioma y sin culpar a nadie: para él el mapa
	 * simplemente no está. El detalle técnico —qué variable falta— va al log del
	 * despliegue, no a la pantalla de un cliente.
	 */
	notConfigured: 'El mapa no está disponible por ahora.',

	/** El marcador es un botón: hay que decir a qué negocio lleva. */
	pinLabel: (name: string) => `Ver ${name}`,
};

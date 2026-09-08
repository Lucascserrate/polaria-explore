import { useCallback, useSyncExternalStore } from 'react';

/**
 * Si la pantalla cumple una media query, como valor de React.
 *
 * Existe para las decisiones que **no** se pueden tomar con clases de CSS:
 * cuando de un tamaño a otro no cambia el aspecto de algo sino qué se dibuja.
 * El caso que lo trajo es la vista previa del mapa —un globo pegado al
 * marcador en escritorio, una tarjeta al pie de la pantalla en el teléfono—:
 * son dos elementos distintos en dos lugares distintos del árbol, y dibujar los
 * dos para esconder uno deja la misma tarjeta dos veces en el HTML, que un
 * lector de pantalla lee dos veces.
 *
 * **Todo lo que sí se pueda resolver con una clase responsive va con una
 * clase.** Esto mide en el navegador, así que durante el render del servidor
 * contesta `false`; usarlo para algo que se ve al abrir la página haría que se
 * dibuje una vez mal y otra bien. Es seguro sólo donde el resultado aparece
 * después de que alguien toque algo, o dentro de un componente que no se
 * renderiza en el servidor.
 */
export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onChange: () => void) => {
			const list = window.matchMedia(query);
			list.addEventListener('change', onChange);

			return () => list.removeEventListener('change', onChange);
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	);
}

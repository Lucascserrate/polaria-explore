/**
 * El marcador del negocio: una burbuja con el piquito apoyado en la coordenada.
 *
 * **La punta es el punto, no el centro de la burbuja.** Por eso el contenedor va
 * `-translate-y-full`: su borde de abajo queda sobre el centro de la imagen, que
 * es donde está el negocio. Centrar la burbuja correría el local media burbuja
 * hacia el sur.
 *
 * Se dibuja en el DOM y no dentro de la imagen porque los marcadores de la API
 * de Mapbox son gotas de un catálogo fijo. Acá además queda nítido en cualquier
 * pantalla y no cuesta una petición más.
 *
 * Es un solo `<svg>` y no una burbuja con el icono encima: así la geometría
 * —dónde termina el piquito, dónde va el local adentro— vive en un lugar y no
 * repartida entre dos elementos que hay que mantener alineados a mano.
 *
 * El blanco de abajo es el contorno: la misma forma un poco más grande, dibujada
 * primero. Sobre un mapa con calles y manzanas, una burbuja negra a secas se
 * confunde con una cuadra oscura, y así se despega sin usar una sombra.
 */

const MapMarker = () => {
	return (
		<svg
			viewBox="0 0 40 48"
			aria-hidden="true"
			className="pointer-events-none absolute top-1/2 left-1/2 h-12 w-10 -translate-x-1/2 -translate-y-full"
		>
			<g className="fill-paper-50">
				<circle cx="20" cy="19" r="19" />
				<path d="M11.5 30 20 47 28.5 30Z" />
			</g>

			<g className="fill-ink-950">
				<circle cx="20" cy="19" r="16.5" />
				<path d="M13.8 29 20 43 26.2 29Z" />
			</g>

			{/* El local. Escalado y corrido para quedar centrado en la burbuja. */}
			<g
				transform="translate(9.5 8.1) scale(0.875)"
				fill="none"
				stroke="currentColor"
				strokeWidth={1.7}
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-paper-50"
			>
				<path d="M4 9.5h16v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V9.5Z" />
				<path d="M4 9.5 5.5 4.5h13l1.5 5" />
				<path d="M9.75 20.5V15h4.5v5.5" />
			</g>
		</svg>
	);
};

export default MapMarker;

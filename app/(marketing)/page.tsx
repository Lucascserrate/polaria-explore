import { Features, FinalCta, Hero, Overview, Verticals } from '@/sections';

/**
 * La página no contiene maquetación ni copy: sólo ordena secciones.
 *
 * El recorrido, en cinco movimientos: qué es (hero), para quién (rubros), qué
 * hace (tres columnas), cómo se ve (dos filas de producto) y probalo (cierre).
 * Reordenar la landing es mover líneas acá.
 */
export default function HomePage() {
	return (
		<main id="top">
			<Hero />
			<Verticals />
			<Overview />
			<Features />
			<FinalCta />
		</main>
	);
}

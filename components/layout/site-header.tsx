import { Navbar } from '@/components/layout/navbar';
import { getCustomerSession } from '@/services/customer/server/session';

/**
 * Desde qué ancho se ve la barra.
 *
 * Las clases van escritas enteras y no armadas con plantillas porque Tailwind
 * lee el código fuente: una clase que se concatena en tiempo de ejecución no
 * existe en el CSS.
 */
const VISIBILITY = {
	/** La raíz: no hay nada abajo que le pelee el alto. */
	always: '',
	/**
	 * La página de un negocio. En el teléfono abre con la foto del local a
	 * sangre y arriba de todo, que es lo que hay que ver; a partir de `sm` el
	 * diseño cambia —el nombre pasa a ir arriba de las fotos— y la barra vuelve.
	 */
	sm: 'hidden sm:block',
	/**
	 * El buscador. Hasta `lg` el mapa ocupa la pantalla entera, y sesenta
	 * píxeles fijos de barra son sesenta píxeles de mapa menos.
	 */
	lg: 'hidden lg:block',
} as const;

/**
 * La barra de Polaria, con la sesión ya leída.
 *
 * Existe porque la barra dejó de estar en el layout raíz: cada zona del sitio
 * la quiere desde un ancho distinto, y un layout no puede tener dos formas
 * según quién cuelgue de él. Lo que sí puede haber es un solo lugar donde se
 * lee la sesión y se decide cómo se dibuja, que es esto.
 *
 * **Se esconde con una clase y no se deja de renderizar.** Qué ancho tiene la
 * pantalla lo sabe CSS; decidirlo en JavaScript significaría dibujar la página
 * una vez con barra y otra sin ella. El costo es que el HTML la trae igual: es
 * una barra, no una lista de negocios.
 *
 * **Leer la sesión vuelve dinámica a la página que lo use.** Es el precio de
 * que la barra sepa quién está en sesión, y se pagaba desde antes. El día que
 * moleste, la salida no es mover la barra sino aislar su parte de cuenta con
 * PPR.
 */
export async function SiteHeader({
	showFrom = 'always',
	wide = false,
	forBusiness = false,
}: {
	showFrom?: keyof typeof VISIBILITY;
	/** De borde a borde. Ver `Navbar`. */
	wide?: boolean;
	/**
	 * El botón "Para negocios". Sólo la raíz lo prende: es la puerta del
	 * marketplace y no la página de un negocio. Ver `Navbar`.
	 */
	forBusiness?: boolean;
}) {
	const session = await getCustomerSession();
	const navbar = (
		<Navbar session={session} wide={wide} forBusiness={forBusiness} />
	);

	if (showFrom === 'always') return navbar;

	return <div className={VISIBILITY[showFrom]}>{navbar}</div>;
}

export default SiteHeader;

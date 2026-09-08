import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/layout/logo';
import { account } from '@/content/account';
import { CustomerMenu } from '@/components/layout/customer-menu';
import type { CustomerSession } from '@/services/customer/types';

/**
 * La barra del marketplace: la misma forma que la de la landing, con otro
 * contenido.
 *
 * Comparte con su gemela de `polaria-landing` la estructura —barra fija,
 * blanca, con una línea de 1px abajo, el logo a la izquierda dentro del
 * `Container`— porque los dos sitios son la misma marca y tienen que abrir
 * igual. Lo que **no** comparte es lo que va del logo hacia la derecha, y ahí
 * está toda la diferencia:
 *
 * - La landing le habla a un negocio que evalúa un software: sus enlaces son
 *   anclas a "qué hace" y su botón lleva a probarlo.
 * - Esto le habla al cliente de un negocio, que vino a sacar un turno. Un
 *   "Probá Polaria gratis" arriba de su reserva sería publicidad de un tercero
 *   metida en el local de otro, y el enlace más visible de la página llevaría
 *   fuera de ella justo cuando lo único que hay que hacer es reservar.
 *
 * Por eso a la derecha va sólo la cuenta, y sólo cuando hay sesión. El logo
 * lleva a la raíz, que hoy es un cartel y mañana es el buscador del
 * marketplace: es el lugar natural donde va a estar, y por eso esta barra vive
 * en el layout raíz y no en el grupo de la reserva.
 */
export function Navbar({
	session,
	wide = false,
}: {
	session: CustomerSession | null;
	/**
	 * De borde a borde, en lugar de centrada en la columna del sitio.
	 *
	 * Es para el buscador, que abajo no tiene una columna sino la pantalla
	 * entera: el mapa llega hasta el borde derecho y la lista hasta el
	 * izquierdo. Una barra centrada arriba de eso deja el logo flotando en el
	 * medio de la nada, alineado con nada. Las páginas que sí tienen una columna
	 * —la raíz, la reserva— siguen con la barra centrada sobre ella.
	 */
	wide?: boolean;
}) {
	return (
		<header className="sticky top-0 z-50 border-b border-paper-300 bg-white">
			<Container className={wide ? 'max-w-none' : 'max-w-6xl'}>
				<nav
					aria-label={account.nav.label}
					className="flex h-16 items-center justify-between gap-6 sm:h-18"
				>
					<Link href="/" className="flex shrink-0 rounded-full">
						<Logo />
						<span className="sr-only">{account.nav.home}</span>
					</Link>

					{session && <CustomerMenu session={session} />}
				</nav>
			</Container>
		</header>
	);
}

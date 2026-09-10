import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { account } from '@/content/account';
import { site } from '@/config/site';
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
 * Por eso a la derecha va la cuenta —y sólo cuando hay sesión— y, si el layout
 * lo pide, "Para negocios". **Ese botón no lo decide la barra sino quién la
 * pone**, y de ahí que sea un prop apagado por defecto: en la raíz es legítimo
 * —es la puerta del marketplace, ahí no hay reserva empezada ni local de nadie,
 * y quien entra por la puerta bien puede ser un negocio— y en las páginas de
 * reserva no entra. Con el prop apagado, la única forma de llegar a la landing
 * desde la reserva sigue siendo la que ya había: el menú de la cuenta y la
 * firma al pie.
 *
 * El logo lleva a la raíz, que es el buscador del marketplace.
 */
export function Navbar({
	session,
	wide = false,
	forBusiness = false,
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
	/**
	 * El botón "Para negocios", a la derecha.
	 *
	 * Apagado por defecto **a propósito**: la barra la usan las páginas de
	 * reserva, y ahí este botón no va. Lo prende el layout de la raíz. Ver el
	 * comentario de arriba y `AGENTS.md`.
	 */
	forBusiness?: boolean;
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

					<div className="flex items-center gap-2 sm:gap-3">
						{forBusiness && (
							<Button
								href={site.landingUrl}
								variant="secondary"
								size="sm"
								className="font-medium"
							>
								{account.forBusiness}
							</Button>
						)}

						{session && <CustomerMenu session={session} />}
					</div>
				</nav>
			</Container>
		</header>
	);
}

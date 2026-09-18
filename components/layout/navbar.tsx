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
 * Por eso a la derecha va la cuenta —la de quien reserva— y, si el layout lo
 * pide, "Para negocios". **Ese botón no lo decide la barra sino quién la
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
					className="flex h-16 items-center justify-between gap-3 sm:h-18 sm:gap-6"
				>
					<Link href="/" className="flex shrink-0 rounded-full">
						<Logo />
						<span className="sr-only">{account.nav.home}</span>
					</Link>

					<div className="flex items-center gap-2 sm:gap-3">
						{/*
						 * "Para negocios" es un enlace de texto y no una píldora, y eso
						 * pasó a importar cuando apareció "Acceder" al lado: dos píldoras
						 * blancas iguales no dicen cuál es la de quien vino a reservar, que
						 * es todo el mundo menos la excepción. Sigue estando a la vista
						 * arriba a la derecha —lo que `AGENTS.md` pide de la raíz—, pero es
						 * el más callado de los dos, que es el orden correcto: le habla al
						 * dueño de un negocio y se va del dominio.
						 *
						 * De paso es lo que hace entrar las dos cosas en un teléfono
						 * angosto: un enlace mide lo que dice, una píldora mide eso más
						 * dos paddings.
						 */}
						{forBusiness && (
							<a
								href={site.landingUrl}
								className="shrink-0 rounded-full px-1 text-sm font-medium text-ink-700 transition-colors hover:text-ink-950"
							>
								{account.forBusiness}
							</a>
						)}

						{/*
						 * Con sesión, la cuenta; sin sesión, la puerta para entrar a ella.
						 *
						 * Antes acá no había nada sin sesión y la única forma de entrar era
						 * el atajo de Google del paso de identidad, o sea que había que
						 * empezar a reservar para poder acceder. Quien ya tiene cuenta no
						 * viene a eso: viene a que sus datos ya estén cargados.
						 *
						 * Es `secondary` y no negro sólido a propósito. Esta barra también
						 * se dibuja arriba de la página de una barbería, y ahí el botón
						 * lleno tiene que ser uno solo, el de reservar. Un "Acceder" negro
						 * arriba de un local ajeno pondría la cuenta de Polaria por delante
						 * del turno, que es justo lo que se decidió no hacer cuando el
						 * login dejó de ser obligatorio para reservar.
						 *
						 * Sin `returnTo`: el pasamanos vuelve a la página de donde salió
						 * leyendo el `Referer`, igual que hace el de cerrar sesión. Así el
						 * enlace es estático y la barra sigue siendo un componente de
						 * servidor —no hay `window` que consultar ni JavaScript del que
						 * dependa entrar a la cuenta. Ver `app/api/customer/login`.
						 */}
						{session ? (
							<CustomerMenu session={session} />
						) : (
							<Button
								href="/api/customer/login"
								variant="secondary"
								size="sm"
								className="shrink-0 font-medium"
							>
								{account.login}
							</Button>
						)}
					</div>
				</nav>
			</Container>
		</header>
	);
}

import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/layout/logo';
import { whatsappUrl } from '@/config/cta';
import { landing } from '@/content/landing';
import { nav } from '@/config/site';

/**
 * Barra fija, blanca, con una línea de 1px abajo.
 *
 * Nada de fondo translúcido ni de barra que cambia al hacer scroll: la página
 * es blanca de arriba a abajo salvo dos bandas negras, y una barra que se
 * transforma al bajar es movimiento que nadie pidió.
 *
 * En móvil quedan el logo y el botón. Los tres enlaces son anclas a secciones
 * por las que se pasa scrolleando igual, y un menú hamburguesa para eso es más
 * interfaz que contenido.
 */
export function Navbar() {
	return (
		<header className="sticky top-0 z-50 border-b border-paper-300 bg-white">
			<Container>
				<nav
					aria-label="Principal"
					className="flex h-16 items-center justify-between gap-6 sm:h-18"
				>
					<div className="flex items-center gap-10">
						<Link href="/" className="flex shrink-0 rounded-full">
							<Logo />
							<span className="sr-only">Polaria, ir al inicio</span>
						</Link>

						<ul className="hidden items-center gap-8 md:flex">
							{nav.map((link) => (
								<li key={link.href}>
									<a
										href={link.href}
										className="text-[0.9375rem] text-ink-600 transition-colors hover:text-ink-950"
									>
										{link.label}
									</a>
								</li>
							))}
						</ul>
					</div>

					<Button
						href={whatsappUrl()}
						size="sm"
						target="_blank"
						rel="noopener noreferrer"
					>
						{landing.hero.primary}
					</Button>
				</nav>
			</Container>
		</header>
	);
}

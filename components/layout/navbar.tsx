import { Container } from '@/components/ui/container';
import { Cta } from '@/components/ui/cta';
import { Logo } from '@/components/layout/logo';
import { getPrimaryCta } from '@/config/cta';
import { footerLinks } from '@/config/site';

/**
 * Barra flotante oscura. Se mantiene igual sobre el hero oscuro y sobre las
 * secciones claras, así que no necesita escuchar el scroll ni volverse Client
 * Component para cambiar de color.
 *
 * En móvil los enlaces se ocultan y queda sólo el CTA: son tres anclas a
 * secciones por las que se pasa scrolleando igual, y un menú hamburguesa sería
 * más interfaz de la que el contenido justifica.
 */
export function Navbar() {
	const primary = getPrimaryCta();

	return (
		<header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
			<Container width="wide">
				<nav
					aria-label="Principal"
					className="flex items-center justify-between gap-4 rounded-full bg-ink-900/70 py-2 pl-5 pr-2 ring-1 ring-inset ring-white/10 backdrop-blur-md"
				>
					<a href="#top" className="flex shrink-0 rounded-full">
						<Logo tone="light" className="text-[0.9375rem]" />
						<span className="sr-only-live">Polaria, ir al inicio</span>
					</a>

					<ul className="hidden items-center gap-7 md:flex">
						{footerLinks.producto.map((link) => (
							<li key={link.href}>
								<a
									href={link.href}
									className="text-sm text-white/60 transition-colors hover:text-white"
								>
									{link.label}
								</a>
							</li>
						))}
					</ul>

					<Cta action={primary} variant="onDark" size="sm" withArrow={false} />
				</nav>
			</Container>
		</header>
	);
}

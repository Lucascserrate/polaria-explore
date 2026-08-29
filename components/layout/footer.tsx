import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/layout/logo';
import { footerLinks, site } from '@/config/site';
import { landing } from '@/content/landing';

const footer = landing.footer;

/**
 * Pie.
 *
 * Blanco, con una línea arriba. El cierre negro ya está una sección más arriba;
 * repetir el negro acá le quitaría fuerza y convertiría el final de la página en
 * un bloque de doscientos píxeles de nada.
 *
 * El descargo de marcas no es letra chica opcional: es requisito de la revisión
 * de Meta y por eso vive en el pie de todas las páginas, no sólo en las legales.
 */
export function Footer() {
	return (
		<footer className="border-t border-paper-300 bg-white py-16 sm:py-20">
			<Container>
				<div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
					<div className="max-w-xs">
						<Logo />
						<p className="mt-4 text-pretty text-sm leading-relaxed text-ink-600">
							{footer.blurb}
						</p>
					</div>

					<FooterColumn title={footer.producto} links={footerLinks.producto} />
					<FooterColumn title={footer.legal} links={footerLinks.legal} />
				</div>

				<div className="mt-14 flex flex-col gap-6 border-t border-paper-300 pt-8">
					<p className="max-w-3xl text-pretty text-xs leading-relaxed text-ink-500">
						{footer.disclaimer}
					</p>

					<p className="text-xs text-ink-500">
						© {new Date().getFullYear()} {site.legal.entity} · {site.legal.city},{' '}
						{site.legal.country}
					</p>
				</div>
			</Container>
		</footer>
	);
}

function FooterColumn({
	title,
	links,
}: {
	title: string;
	links: readonly { label: string; href: string }[];
}) {
	return (
		<div>
			<p className="text-sm font-medium text-ink-950">{title}</p>

			<ul className="mt-4 flex flex-col gap-3">
				{links.map((link) => (
					<li key={link.href}>
						<Link
							href={link.href}
							className="text-sm text-ink-600 transition-colors hover:text-ink-950"
						>
							{link.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

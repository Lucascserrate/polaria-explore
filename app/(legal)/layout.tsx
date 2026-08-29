import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Logo } from '@/components/layout/logo';
import { site } from '@/config/site';
import { legalChrome } from '@/content/legal';

/**
 * Las páginas legales: /privacy y /terms.
 *
 * Antes eran un rincón de la landing y heredaban su navegación. La landing ya
 * no existe, así que este grupo se sostiene solo — y no le sobra nada: un
 * wordmark que no lleva a ninguna parte (no hay home) y un pie con el titular,
 * el contacto y el descargo de marcas.
 *
 * No es una sección de relleno a la espera de la landing nueva: son las dos
 * URL que Meta abre para aprobar WhatsApp Business API, y tienen que existir y
 * ser verificables por sí mismas.
 */
export const metadata = {
	robots: { index: true, follow: true },
};

/**
 * Datos estructurados del titular. Deliberadamente sin valoraciones ni
 * reseñas: todavía no hay clientes, y marcar prueba social inexistente es
 * exactamente el tipo de cosa que hunde una revisión de plataforma.
 */
const organizationJsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Organization',
	name: site.name,
	url: site.url,
	description: site.description,
	email: site.contactEmail,
	address: {
		'@type': 'PostalAddress',
		addressLocality: site.legal.city,
		addressCountry: 'BO',
	},
};

export default function LegalLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<div className="flex min-h-full flex-col bg-paper-50">
			<script
				type="application/ld+json"
				// El contenido es una constante local, no entrada de usuario.
				dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
			/>

			<header className="border-b border-paper-300">
				<Container width="narrow" className="flex h-16 items-center">
					<Logo className="text-[0.9375rem]" />
				</Container>
			</header>

			<div className="flex-1">{children}</div>

			<footer className="border-t border-paper-300 py-10">
				<Container width="narrow" className="flex flex-col gap-4">
					<nav
						aria-label="Legales"
						className="flex flex-wrap items-center gap-x-6 gap-y-2"
					>
						{legalChrome.nav.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-sm font-medium text-ink-700 underline-offset-4 hover:underline"
							>
								{link.label}
							</Link>
						))}
					</nav>

					<p className="text-sm text-ink-600">{legalChrome.issuer}</p>
					<p className="text-sm text-ink-600">{legalChrome.contact}</p>

					<p className="max-w-2xl text-pretty text-xs leading-relaxed text-ink-500">
						{legalChrome.disclaimer}
					</p>
				</Container>
			</footer>
		</div>
	);
}

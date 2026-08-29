import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { site } from '@/config/site';

/**
 * La landing: lo que se le muestra a un negocio que todavía no es cliente.
 *
 * Vive en un grupo de rutas propio para que su navegación no llegue a las
 * páginas públicas de reserva, que están en el mismo dominio y en el mismo
 * repositorio pero se dirigen a otra persona: ahí el visitante es el cliente
 * del negocio, no el dueño, y no hay nada que venderle.
 */
export const metadata: Metadata = {
	alternates: { canonical: '/' },
	openGraph: {
		type: 'website',
		locale: 'es_BO',
		url: site.url,
		siteName: site.name,
		title: `${site.name} — ${site.tagline}`,
		description: site.description,
	},
	twitter: {
		card: 'summary_large_image',
		title: `${site.name} — ${site.tagline}`,
		description: site.description,
	},
};

/**
 * Datos estructurados. Deliberadamente sin valoraciones ni reseñas: todavía no
 * hay clientes, y marcar prueba social inexistente es exactamente el tipo de
 * cosa que hunde una revisión de plataforma.
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

export default function MarketingLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			<script
				type="application/ld+json"
				// El contenido es una constante local, no entrada de usuario.
				dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
			/>
			<Navbar />
			{children}
			<Footer />
		</>
	);
}

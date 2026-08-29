import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { landing } from '@/content/landing';

const overview = landing.overview;

/**
 * Qué hace, en tres columnas de texto.
 *
 * Sin tarjetas, sin iconos y sin bordes: tres títulos y tres párrafos sobre una
 * banda gris. Es el bloque más simple de la referencia y el que mejor envejece
 * — un icono genérico arriba de cada columna no agrega información, sólo ruido
 * que hay que rediseñar cada vez que cambia el copy.
 *
 * Abre la historia del producto, así que se lleva el ancla `#producto`: es
 * donde aterriza "Ver cómo funciona" desde el hero.
 */
export function Overview() {
	return (
		<Section id="producto" tone="soft" labelledBy="overview-title">
			<Container>
				<SectionHeading
					id="overview-title"
					title={overview.title}
					lead={overview.lead}
					align="left"
				/>

				<div className="mt-16 grid gap-12 sm:mt-20 lg:grid-cols-3 lg:gap-8">
					{overview.columns.map((column, index) => (
						<Reveal key={column.title} delay={index * 80} className="max-w-sm">
							<h3 className="text-xl font-semibold text-ink-950">{column.title}</h3>
							<p className="mt-3 text-pretty leading-relaxed text-ink-600">
								{column.body}
							</p>
						</Reveal>
					))}
				</div>
			</Container>
		</Section>
	);
}

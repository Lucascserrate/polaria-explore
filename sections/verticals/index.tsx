import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Reveal } from '@/components/ui/reveal';
import { landing } from '@/content/landing';

const verticals = landing.verticals;

/**
 * Para quién es.
 *
 * La referencia resuelve esto con una grilla de fotos por rubro. Nosotros no
 * tenemos fotos propias y las de banco se notan a un kilómetro, así que va la
 * lista en texto: los nombres son lo único que el visitante busca acá —
 * encontrarse a sí mismo— y con una línea de 1px basta para ordenarlos.
 *
 * Cuando existan fotos reales de negocios usando Polaria, este es su lugar.
 */
export function Verticals() {
	return (
		<Section id="rubros" labelledBy="rubros-title">
			<Container>
				<SectionHeading
					id="rubros-title"
					title={verticals.title}
					lead={verticals.lead}
				/>

				<ul className="mt-16 grid grid-cols-2 gap-x-8 gap-y-7 sm:mt-20 lg:grid-cols-4">
					{verticals.items.map((item, index) => (
						<Reveal
							as="li"
							key={item}
							delay={(index % 4) * 60}
							className="border-t border-paper-300 pt-4 text-lg font-medium text-ink-950"
						>
							{item}
						</Reveal>
					))}
				</ul>
			</Container>
		</Section>
	);
}

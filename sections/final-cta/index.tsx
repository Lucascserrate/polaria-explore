import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { whatsappUrl } from '@/config/cta';
import { landing } from '@/content/landing';

const cta = landing.finalCta;

/**
 * El cierre.
 *
 * Negro, centrado y con una sola acción. Es la segunda —y última— vez que la
 * página se pone negra: la primera fueron las cifras del hero. Ese eco cierra
 * el recorrido sin que haga falta anunciarlo.
 */
export function FinalCta() {
	return (
		<Section id="empezar" tone="dark" labelledBy="final-cta-title">
			<Container>
				<Reveal className="mx-auto flex max-w-2xl flex-col items-center text-center">
					<h2
						id="final-cta-title"
						className="text-[2.25rem] font-semibold leading-[1.05] text-white sm:text-5xl"
					>
						{cta.title}
					</h2>

					<p className="mt-5 max-w-lg text-pretty leading-relaxed text-white/60">
						{cta.lead}
					</p>

					<Button
						href={whatsappUrl()}
						variant="onDark"
						size="lg"
						target="_blank"
						rel="noopener noreferrer"
						className="mt-9"
					>
						{cta.primary}
					</Button>
				</Reveal>
			</Container>
		</Section>
	);
}

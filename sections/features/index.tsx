import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/ui/reveal';
import { Check } from '@/components/ui/icons';
import { landing } from '@/content/landing';
import { cn } from '@/lib/utils';

/**
 * Las dos filas de producto.
 *
 * Texto a un lado, pantalla real al otro, y la segunda invertida. La alternancia
 * no es decoración: es lo que evita que dos bloques seguidos con la misma
 * estructura se lean como una lista.
 *
 * Las capturas son del panel de verdad, salidas de `scripts/capture.mjs`. No hay
 * mockups dibujados a mano ni pantallas inventadas: si algo no existe todavía,
 * no aparece.
 */
export function Features() {
	return (
		<Section className="flex flex-col gap-28 sm:gap-36 lg:gap-44">
			{landing.features.map((feature, index) => (
				<FeatureRow key={feature.title} feature={feature} flipped={index % 2 === 1} />
			))}
		</Section>
	);
}

type Feature = (typeof landing.features)[number];

function FeatureRow({ feature, flipped }: { feature: Feature; flipped: boolean }) {
	return (
		<Container>
			<div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
				<Reveal className={cn('max-w-lg', flipped && 'lg:order-2 lg:justify-self-end')}>
					<h2 className="text-[2rem] font-semibold leading-[1.08] text-ink-950 sm:text-[2.5rem]">
						{feature.title}
					</h2>

					<p className="mt-5 text-pretty leading-relaxed text-ink-600">
						{feature.body}
					</p>

					<ul className="mt-8 flex flex-col gap-3.5">
						{feature.bullets.map((bullet) => (
							<li key={bullet} className="flex gap-3 text-[0.9375rem] text-ink-900">
								<Check className="mt-0.5 size-4 shrink-0 text-ink-950" />
								{bullet}
							</li>
						))}
					</ul>
				</Reveal>

				{/*
					Recortes encuadrados a la zona con información, no la pantalla
					entera: el panel es una interfaz muy aireada y a media columna se
					vería sobre todo espacio en blanco. El recorte se genera a partir de
					la captura original (ver `content/landing.ts`).
				*/}
				<Reveal delay={100} className={cn(flipped && 'lg:order-1')}>
					<Image
						src={feature.image.src}
						alt={feature.image.alt}
						width={feature.image.width}
						height={feature.image.height}
						sizes="(min-width: 1024px) 34rem, 100vw"
						className="w-full rounded-2xl ring-1 ring-inset ring-paper-300"
					/>
				</Reveal>
			</div>
		</Container>
	);
}

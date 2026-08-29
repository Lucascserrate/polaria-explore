import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import { whatsappUrl } from '@/config/cta';
import { landing } from '@/content/landing';
import { PhoneCard } from '@/sections/hero/PhoneCard';

const hero = landing.hero;

/**
 * Hero.
 *
 * Composición tomada de la referencia: todo centrado y en una sola columna
 * —titular enorme, bajada chica, dos botones— y debajo el producto a lo ancho,
 * apoyado sobre una banda que empieza detrás de la captura.
 *
 * Esa banda es negra y no de color. Es el único cambio de fondo del primer
 * scroll y hace dos trabajos: corta la página en dos para que la captura flote,
 * y le da a la promesa un pie de cuatro datos verificables sin abrir otra
 * sección.
 *
 * En móvil la captura del panel no se muestra: un panel de escritorio a 320px
 * es una mancha gris. Va el teléfono solo, que es exactamente lo que ve el
 * cliente y se lee perfecto a ese tamaño.
 */
export function Hero() {
	return (
		<section className="bg-white">
			<Container className="pt-32 sm:pt-36 lg:pt-40">
				<div className="mx-auto flex max-w-3xl flex-col items-center text-center">
					<Reveal>
						<h1 className="text-[2.5rem] font-semibold leading-[1.02] text-ink-950 sm:text-6xl lg:text-[4.25rem]">
							{hero.title}
						</h1>
					</Reveal>

					<Reveal delay={80}>
						<p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-600">
							{hero.lead}
						</p>
					</Reveal>

					<Reveal delay={160}>
						<div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
							<Button
								href={whatsappUrl()}
								size="lg"
								target="_blank"
								rel="noopener noreferrer"
							>
								{hero.primary}
							</Button>
							<Button href="#producto" variant="secondary" size="lg">
								{hero.secondary}
							</Button>
						</div>
					</Reveal>

					<Reveal delay={240}>
						<p className="mt-4 text-sm text-ink-500">{hero.note}</p>
					</Reveal>
				</div>
			</Container>

			{/* El producto, apoyado sobre el borde de la banda negra. */}
			<Container className="relative z-10 -mb-24 mt-16 sm:-mb-32 sm:mt-20">
				<Reveal delay={320} className="mx-auto max-w-5xl">
					<div className="relative hidden lg:block">
						<Image
							src="/product/analiticas.png"
							alt={hero.shotAlt}
							width={3360}
							height={2000}
							priority
							sizes="(min-width: 1024px) 64rem, 100vw"
							className="w-full rounded-2xl ring-1 ring-paper-300"
						/>
						<PhoneCard className="absolute -bottom-12 -right-4 xl:-right-10" />
					</div>

					<div className="flex justify-center lg:hidden">
						<PhoneCard />
					</div>
				</Reveal>
			</Container>

			<div className="bg-ink-950 pb-20 pt-40 sm:pb-24 sm:pt-52">
				<Container>
					<dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
						{landing.proof.map((item, index) => (
							<Reveal key={item.value} delay={index * 70}>
								<dt className="text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
									{item.value}
								</dt>
								<dd className="mt-2 max-w-[16rem] text-pretty text-sm leading-relaxed text-white/65">
									{item.label}
								</dd>
							</Reveal>
						))}
					</dl>
				</Container>
			</div>
		</section>
	);
}

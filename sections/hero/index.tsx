import { Container } from "@/components/ui/container";
import { Cta, CtaHint } from "@/components/ui/cta";
import { Reveal } from "@/components/ui/reveal";
import { Check } from "@/components/ui/icons";
import { getHeroCtas } from "@/config/cta";
import { hero } from "@/content/hero";
import { HeroShowcase } from "@/sections/hero/HeroShowcase";

/**
 * Hero.
 *
 * Dos mitades: a la izquierda la promesa en tres líneas, a la derecha el
 * producto funcionando. La demostración no es un adorno del copy — es el
 * argumento, y por eso ocupa la mitad del cuadro en lugar de esperar un scroll.
 *
 * Fondo claro a propósito. El oscuro anterior hacía ver "landing de software";
 * este tiene que hacer ver "esto es lo que le pasa a tu WhatsApp".
 */
export function Hero() {
  const { primary, secondary } = getHeroCtas();

  return (
    <section className="relative overflow-hidden bg-paper-100 pb-14 pt-28 sm:pb-20 sm:pt-32">
      <LightBackdrop />

      <Container width="wide" className="relative">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-ink-700 ring-1 ring-inset ring-paper-300">
                <span className="size-1.5 rounded-full bg-brand-500" />
                {hero.badge}
              </span>
            </Reveal>

            <Reveal delay={0.06}>
              <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-ink-900 sm:text-5xl xl:text-[3.5rem]">
                {hero.title.lead}{" "}
                <span className="text-brand-600">{hero.title.accent}</span>
              </h1>
            </Reveal>

            <Reveal delay={0.12}>
              <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-ink-600">
                {hero.subtitle}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
                <Cta action={primary} variant="primary" size="lg" />
                <Cta
                  action={secondary}
                  variant="secondary"
                  size="lg"
                  withArrow={false}
                />
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <CtaHint action={primary} className="mt-3.5" />
            </Reveal>

            {/* Las tres objeciones que frenan la decisión, contestadas antes
                del primer scroll. */}
            <Reveal delay={0.3}>
              <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 lg:justify-start">
                {hero.trust.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-1.5 text-sm text-ink-600"
                  >
                    <Check className="size-4 shrink-0 text-brand-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <HeroShowcase />
          </Reveal>
        </div>

        <Verticals />
      </Container>
    </section>
  );
}

/**
 * La franja de rubros.
 *
 * Es el posicionamiento dicho con ejemplos: quien entra tiene que encontrar su
 * negocio en la lista sin que le expliquemos nada. La demo de arriba usa una
 * barbería porque hace falta un caso concreto para que un flujo se entienda;
 * esta franja evita que ese caso se lea como el límite del producto.
 */
function Verticals() {
  return (
    <Reveal className="mt-14 border-t border-paper-300 pt-8 sm:mt-16">
      <div className="flex flex-col items-center gap-4 text-center lg:flex-row lg:items-center lg:gap-6 lg:text-left">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
          {hero.verticals.label}
        </p>

        <ul className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          {hero.verticals.items.map((item) => (
            <li
              key={item}
              className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-ink-700 ring-1 ring-inset ring-paper-300"
            >
              {item}
            </li>
          ))}
          <li className="px-1 text-sm text-ink-500">{hero.verticals.more}</li>
        </ul>
      </div>
    </Reveal>
  );
}

/**
 * Fondo del hero. Malla tenue, un halo azul detrás del teléfono y un lavado
 * de aurora abajo a la izquierda. Puramente decorativo.
 */
function LightBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-mesh opacity-70" />
      <div className="absolute -right-40 -top-40 size-144 rounded-full bg-[radial-gradient(closest-side,rgb(31_107_255/0.12),transparent)] blur-3xl motion-safe:animate-aurora" />
      <div className="absolute -bottom-56 -left-40 size-120 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.09),transparent)] blur-3xl" />
      {/* Desvanece la malla hacia el borde inferior, donde arranca la demo. */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-paper-100" />
    </div>
  );
}

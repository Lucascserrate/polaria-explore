import { Container } from "@/components/ui/container";
import { Cta, CtaHint } from "@/components/ui/cta";
import { Reveal } from "@/components/ui/reveal";
import { Check } from "@/components/ui/icons";
import { getPrimaryCta, getSecondaryCta } from "@/config/cta";
import { sectionIds } from "@/config/site";
import { hero } from "@/content/hero";
import { Simulator } from "@/features/simulator/components/Simulator";

/**
 * Hero y simulador van fusionados a propósito.
 *
 * Si la demo es el activo más fuerte de la landing, dejarla a un scroll de
 * distancia es regalar el segundo más valioso de la página.
 */
export function Hero() {
  const primary = getPrimaryCta();
  const secondary = getSecondaryCta();

  return (
    <section className="relative overflow-hidden bg-ink-950 pb-20 pt-28 text-white sm:pb-24 sm:pt-32">
      <AuroraBackdrop />

      <Container width="wide" className="relative">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-1.5 text-xs font-medium text-white/75 ring-1 ring-inset ring-white/10">
              <span className="size-1.5 rounded-full bg-brand-400" />
              {hero.badge}
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl md:text-6xl">
              {hero.title}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/65">
              {hero.subtitle}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Cta action={primary} variant="onDark" size="lg" />
              <Cta action={secondary} variant="onDarkGhost" size="lg" withArrow={false} />
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <CtaHint action={primary} tone="dark" className="mt-3.5" />
          </Reveal>

          {/* Las tres objeciones que frenan la decisión, contestadas antes del
              primer scroll. */}
          <Reveal delay={0.3}>
            <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
              {hero.trust.map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-sm text-white/55">
                  <Check className="size-4 shrink-0 text-brand-400" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div id={sectionIds.simulador} tabIndex={-1} className="mt-14 scroll-mt-24 outline-none sm:mt-16">
          <Reveal className="mx-auto mb-5 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">
              {hero.simulator.eyebrow}
            </span>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
              {hero.simulator.title}
            </h2>
            <p className="mx-auto mt-2.5 max-w-lg text-pretty text-sm leading-relaxed text-white/55 sm:text-base">
              {hero.simulator.description}
            </p>
          </Reveal>

          <div className="mx-auto max-w-5xl">
            <Simulator />
          </div>
        </div>
      </Container>
    </section>
  );
}

/** Resplandor de aurora + malla de estrellas. Puramente decorativo. */
function AuroraBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-starfield opacity-[0.16]" />
      <div className="absolute left-1/2 top-[-20rem] h-[34rem] w-[52rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(31_107_255/0.38),transparent)] blur-3xl motion-safe:animate-[aurora_18s_ease-in-out_infinite]" />
      <div className="absolute right-[-12rem] top-[8rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.2),transparent)] blur-3xl" />
      <div className="absolute bottom-[-14rem] left-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(closest-side,rgb(34_211_238/0.14),transparent)] blur-3xl" />
    </div>
  );
}

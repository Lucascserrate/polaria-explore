import { Container } from "@/components/ui/container";
import { Cta, CtaHint } from "@/components/ui/cta";
import { Reveal } from "@/components/ui/reveal";
import { getPrimaryCta } from "@/config/cta";
import { finalCta } from "@/content/final-cta";

/** Cierra el bookend oscuro que abrió el hero. */
export function FinalCta() {
  const primary = getPrimaryCta();

  return (
    <section className="relative overflow-hidden bg-ink-950 py-24 text-white sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-starfield opacity-[0.14]" />
        <div className="absolute left-1/2 top-1/2 h-[26rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(31_107_255/0.3),transparent)] blur-3xl" />
      </div>

      <Container className="relative">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <Reveal>
            <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-4xl md:text-5xl">
              {finalCta.title}
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-white/65">
              {finalCta.description}
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-9">
              <Cta action={primary} variant="onDark" size="lg" />
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <CtaHint action={primary} tone="dark" className="mt-3.5" />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

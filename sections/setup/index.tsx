import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { sectionIds } from "@/config/site";
import { setup } from "@/content/setup";

export function Setup() {
  return (
    <Section id={sectionIds.comoFunciona} tone="muted" labelledBy="setup-title">
      <Container>
        <SectionHeading
          id="setup-title"
          eyebrow={setup.eyebrow}
          title={setup.title}
          description={setup.description}
        />

        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {setup.steps.map((step, index) => (
            <Reveal
              as="li"
              key={step.number}
              delay={index * 0.08}
              className="relative flex flex-col rounded-2xl bg-white p-6 ring-1 ring-inset ring-paper-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold tabular-nums text-brand-600">
                  {step.number}
                </span>
                <span className="rounded-full bg-paper-200 px-2.5 py-1 font-mono text-xs tabular-nums text-ink-600">
                  {step.duration}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-ink-900">
                {step.title}
              </h3>
              <p className="mt-2 text-pretty leading-relaxed text-ink-600">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

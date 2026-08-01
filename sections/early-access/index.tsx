import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { Check } from "@/components/ui/icons";
import { WaitlistForm } from "@/sections/early-access/WaitlistForm";
import { sectionIds } from "@/config/site";
import { earlyAccess } from "@/content/early-access";

export function EarlyAccess() {
  return (
    <Section
      id={sectionIds.accesoAnticipado}
      tone="light"
      labelledBy="early-access-title"
    >
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              id="early-access-title"
              eyebrow={earlyAccess.eyebrow}
              title={earlyAccess.title}
              description={earlyAccess.description}
              align="left"
            />

            <Reveal delay={0.1} className="mt-10">
              <div className="rounded-2xl bg-paper-100 p-6 ring-1 ring-inset ring-paper-300">
                <p className="text-base font-semibold text-ink-900">
                  {earlyAccess.formTitle}
                </p>
                <p className="mt-1 text-sm text-ink-600">{earlyAccess.formBody}</p>
                <div className="mt-5">
                  <WaitlistForm />
                </div>
              </div>
            </Reveal>
          </div>

          <ul className="flex flex-col gap-6">
            {earlyAccess.perks.map((perk, index) => (
              <Reveal as="li" key={perk.title} delay={index * 0.08} className="flex gap-3.5">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                  <Check className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink-900">{perk.title}</h3>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-ink-600">
                    {perk.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

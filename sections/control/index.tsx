import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ChatBubble, Handoff, Shield, Sliders } from "@/components/ui/icons";
import { sectionIds } from "@/config/site";
import { control } from "@/content/control";

const icons = {
  shield: Shield,
  handoff: Handoff,
  chat: ChatBubble,
  sliders: Sliders,
};

export function Control() {
  return (
    <Section id={sectionIds.control} tone="light" labelledBy="control-title">
      <Container>
        <SectionHeading
          id="control-title"
          eyebrow={control.eyebrow}
          title={control.title}
          description={control.description}
        />

        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {control.items.map((item, index) => {
            const Icon = icons[item.icon];

            return (
              <Reveal
                as="li"
                key={item.title}
                delay={index * 0.06}
                className="rounded-2xl bg-paper-100 p-6 ring-1 ring-inset ring-paper-300 transition-shadow hover:shadow-[0_18px_40px_-24px_rgb(15_23_42/0.35)]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-inset ring-brand-100">
                  <Icon className="size-5" />
                </span>

                <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em] text-ink-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-pretty leading-relaxed text-ink-600">
                  {item.body}
                </p>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}

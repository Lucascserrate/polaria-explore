import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CalendarIcon, ChatBubble, Clock, Moon } from "@/components/ui/icons";
import { LostAppointmentsCalculator } from "@/sections/benefits/LostAppointmentsCalculator";
import { sectionIds } from "@/config/site";
import { benefits } from "@/content/benefits";

const icons = {
  moon: Moon,
  chat: ChatBubble,
  clock: Clock,
  calendar: CalendarIcon,
};

export function Benefits() {
  return (
    <Section id={sectionIds.beneficios} tone="light" labelledBy="benefits-title">
      <Container>
        <SectionHeading
          id="benefits-title"
          eyebrow={benefits.eyebrow}
          title={benefits.title}
          description={benefits.description}
        />

        <ul className="mt-14 grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {benefits.items.map((item, index) => {
            const Icon = icons[item.icon];

            return (
              <Reveal as="li" key={item.title} delay={index * 0.06} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
                  <Icon className="size-5" />
                </span>

                <div className="min-w-0">
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-pretty leading-relaxed text-ink-600">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-16">
          <LostAppointmentsCalculator />
        </Reveal>
      </Container>
    </Section>
  );
}

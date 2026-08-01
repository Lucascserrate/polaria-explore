import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { CalendarIcon, ChatBubble, Plug } from "@/components/ui/icons";
import { sectionIds } from "@/config/site";
import { integrations } from "@/content/integrations";

const marks = [ChatBubble, CalendarIcon];

export function Integrations() {
  return (
    <Section id={sectionIds.integraciones} tone="muted" labelledBy="integrations-title">
      <Container>
        <SectionHeading
          id="integrations-title"
          eyebrow={integrations.eyebrow}
          title={integrations.title}
          description={integrations.description}
        />

        <ul className="mt-14 grid gap-4 md:grid-cols-2">
          {integrations.live.map((item, index) => {
            const Mark = marks[index] ?? Plug;

            return (
              <Reveal
                as="li"
                key={item.name}
                delay={index * 0.06}
                className="flex gap-4 rounded-2xl bg-white p-6 ring-1 ring-inset ring-paper-300"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-950 text-white">
                  <Mark className="size-5" />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-ink-900">{item.name}</h3>
                    <span className="rounded-full bg-confirm-50 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-confirm-700">
                      Activo
                    </span>
                  </div>
                  <p className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-600">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </ul>

        <Reveal className="mt-4 rounded-2xl border border-dashed border-paper-400 p-6">
          <p className="text-sm font-semibold text-ink-700">Próximamente</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {integrations.soon.map((item) => (
              <li
                key={item}
                className="rounded-full bg-paper-100 px-3 py-1.5 text-sm text-ink-600 ring-1 ring-inset ring-paper-300"
              >
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Requisito de la revisión de Meta: nada puede sugerir afiliación. */}
        <Reveal className="mt-6">
          <p className="text-pretty text-xs leading-relaxed text-ink-500">
            {integrations.disclaimer}
          </p>
        </Reveal>
      </Container>
    </Section>
  );
}

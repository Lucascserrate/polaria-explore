import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { ChevronDown } from "@/components/ui/icons";
import { sectionIds } from "@/config/site";
import { faq } from "@/content/faq";

/**
 * Acordeón con <details> nativo: accesible por defecto, navegable con teclado
 * y funciona sin JavaScript, así que la sección sigue siendo Server Component.
 * Una versión con estado en React sería más código para un resultado peor.
 */
export function Faq() {
  return (
    <Section id={sectionIds.faq} tone="muted" labelledBy="faq-title">
      <Container width="narrow">
        <SectionHeading id="faq-title" eyebrow={faq.eyebrow} title={faq.title} />

        <div className="mt-12 flex flex-col gap-3">
          {faq.items.map((item, index) => (
            <Reveal key={item.question} delay={Math.min(index * 0.04, 0.2)}>
              <details className="group rounded-2xl bg-white ring-1 ring-inset ring-paper-300 open:ring-paper-400">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left font-medium text-ink-900 [&::-webkit-details-marker]:hidden">
                  <span className="text-pretty">{item.question}</span>
                  <ChevronDown className="size-5 shrink-0 text-ink-500 transition-transform duration-300 group-open:-rotate-180" />
                </summary>

                <div className="px-5 pb-5">
                  <p className="text-pretty leading-relaxed text-ink-600">
                    {item.answer}
                  </p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

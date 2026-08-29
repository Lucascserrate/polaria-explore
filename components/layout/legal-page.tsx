import { Container } from "@/components/ui/container";
import { lastUpdated, type LegalSection } from "@/content/legal";

/** Plantilla compartida por /privacy y /terms. */
export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <main className="pb-24 pt-16 sm:pt-20">
      <Container width="narrow">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
          Última actualización: {lastUpdated}
        </p>

        <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.035em] text-ink-900 sm:text-5xl">
          {title}
        </h1>

        <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-600">{intro}</p>

        <div className="mt-14 flex flex-col gap-11">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink-900">
                {section.title}
              </h2>

              <div className="mt-3 flex flex-col gap-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-pretty leading-relaxed text-ink-600">
                    {paragraph}
                  </p>
                ))}
              </div>

              {section.bullets && (
                <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 marker:text-ink-500">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="text-pretty leading-relaxed text-ink-600">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}

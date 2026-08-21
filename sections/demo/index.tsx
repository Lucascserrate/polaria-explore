import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionIds } from "@/config/site";
import { demo } from "@/content/demo";
import { Simulator } from "@/features/simulator/components/Simulator";

/**
 * La demo interactiva, que hasta ahora vivía pegada al hero.
 *
 * Sigue sobre fondo oscuro: el simulador está diseñado para flotar sobre una
 * superficie oscura (sombras profundas, controles en blanco translúcido), y
 * mudarlo a claro sería rediseñarlo. Al mismo tiempo, el contraste con el hero
 * claro le da a la demo el peso de una sección propia.
 *
 * Conserva el ancla `#simulador`: la navegación, el CTA secundario del hero y
 * el cierre de la página siguen apuntando acá.
 */
export function Demo() {
  return (
    <Section id={sectionIds.simulador} tone="dark" labelledBy="demo-title">
      <Container width="wide">
        <SectionHeading
          id="demo-title"
          eyebrow={demo.eyebrow}
          title={demo.title}
          description={demo.description}
          tone="dark"
          className="mx-auto max-w-2xl"
        />

        <div className="mx-auto mt-12 max-w-5xl">
          <Simulator />
        </div>
      </Container>
    </Section>
  );
}

import {
  Benefits,
  Control,
  EarlyAccess,
  Faq,
  FinalCta,
  Hero,
  Integrations,
  Setup,
} from "@/sections";

/**
 * La página no contiene maquetación ni copy: sólo ordena secciones.
 * Reordenar la landing es mover líneas acá.
 */
export default function HomePage() {
  return (
    <main id="top">
      <Hero />
      <Control />
      <Setup />
      <Benefits />
      <Integrations />
      <EarlyAccess />
      <Faq />
      <FinalCta />
    </main>
  );
}

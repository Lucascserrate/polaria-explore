import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { terms } from "@/content/legal";

export const metadata: Metadata = {
  title: terms.title,
  description:
    "Condiciones de uso de Polaria: alcance del servicio, responsabilidades, disponibilidad y baja.",
};

export default function TermsPage() {
  return <LegalPage title={terms.title} intro={terms.intro} sections={terms.sections} />;
}

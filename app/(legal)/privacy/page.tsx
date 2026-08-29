import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { privacy } from "@/content/legal";

export const metadata: Metadata = {
  title: privacy.title,
  description:
    "Qué datos trata Polaria, para qué los usa, con quién los comparte y cómo ejercer tus derechos.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title={privacy.title} intro={privacy.intro} sections={privacy.sections} />
  );
}

import { sectionIds } from "@/config/site";

/**
 * El CTA principal de Polaria es una capa de configuración, no un componente.
 *
 * Existe un problema de huevo y gallina: el CTA ideal ("escribile a Polaria por
 * WhatsApp") necesita un número de WhatsApp Business API, y ese número necesita
 * que Meta apruebe este mismo sitio. Así que la landing nace en modo
 * `simulador` y pasa a `whatsapp` cambiando UNA constante, sin tocar secciones.
 */
export type CtaMode = "simulador" | "whatsapp";

export const CTA_MODE: CtaMode = "simulador";

/** Se activa cuando el número esté aprobado. Sólo se usa si CTA_MODE = "whatsapp". */
export const whatsapp = {
  // TODO: número en formato internacional sin signos, ej. "59170000000".
  number: "",
  greeting: "Hola Polaria, quiero probarte",
} as const;

export type CtaAction =
  | { kind: "scroll"; targetId: string; label: string; hint?: string }
  | { kind: "link"; href: string; label: string; hint?: string; external?: boolean };

export function buildWhatsAppUrl() {
  return `https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.greeting)}`;
}

/** CTA principal. Todo botón primario de la página consume esto. */
export function getPrimaryCta(): CtaAction {
  if (CTA_MODE === "whatsapp" && whatsapp.number) {
    return {
      kind: "link",
      href: buildWhatsAppUrl(),
      label: "Escribile a Polaria",
      hint: "Se abre WhatsApp",
      external: true,
    };
  }

  return {
    kind: "scroll",
    targetId: sectionIds.simulador,
    label: "Probar Polaria",
    hint: "Simulación en vivo, sin registro",
  };
}

/** CTA secundario. Cambia de rol según el modo para no repetir el primario. */
export function getSecondaryCta(): CtaAction {
  if (CTA_MODE === "whatsapp" && whatsapp.number) {
    return {
      kind: "scroll",
      targetId: sectionIds.simulador,
      label: "Ver cómo funciona",
    };
  }

  return {
    kind: "scroll",
    targetId: sectionIds.accesoAnticipado,
    label: "Quiero acceso anticipado",
  };
}

/**
 * Texto del formulario de captura dentro del simulador. En modo "whatsapp" el
 * formulario deja de tener sentido y el cierre invita a la conversación real.
 */
export function getSimulatorOutro() {
  if (CTA_MODE === "whatsapp" && whatsapp.number) {
    return {
      title: "Esto fue una simulación.",
      body: "La Polaria de verdad está a un mensaje de distancia.",
      showForm: false as const,
    };
  }

  return {
    title: "Esto fue una simulación.",
    body: "Dejanos tu WhatsApp y te avisamos cuando puedas hablar con la Polaria real.",
    showForm: true as const,
  };
}

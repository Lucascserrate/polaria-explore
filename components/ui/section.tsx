import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "light" | "muted" | "dark";

const tones: Record<Tone, string> = {
  light: "bg-paper-50 text-ink-900",
  muted: "bg-paper-200 text-ink-900",
  dark: "bg-ink-950 text-white",
};

/**
 * Envoltorio semántico de sección. Centraliza el ritmo vertical para que todas
 * las secciones respiren igual.
 */
export function Section({
  id,
  tone = "light",
  className,
  children,
  labelledBy,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      // tabIndex -1 para que el foco aterrice acá al navegar por ancla.
      tabIndex={id ? -1 : undefined}
      className={cn(
        "scroll-mt-20 py-20 outline-none sm:py-28",
        tones[tone],
        className,
      )}
    >
      {children}
    </section>
  );
}

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";

/** Encabezado de sección: antetítulo, título y bajada. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  tone = "light",
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  id?: string;
  tone?: "light" | "dark";
  align?: "center" | "left";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.14em]",
            dark ? "text-brand-300" : "text-brand-600",
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2
        id={id}
        className={cn(
          "max-w-2xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.035em] sm:text-4xl md:text-[2.75rem]",
          dark ? "text-white" : "text-ink-900",
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            "max-w-xl text-pretty text-base leading-relaxed sm:text-lg",
            dark ? "text-white/65" : "text-ink-600",
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

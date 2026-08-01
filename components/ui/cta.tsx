import { Button } from "@/components/ui/button";
import { ArrowRight } from "@/components/ui/icons";
import type { CtaAction } from "@/config/cta";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "onDark" | "onDarkGhost";

/**
 * Renderiza un CtaAction. Las secciones nunca deciden a dónde apunta un CTA:
 * lo consultan a config/cta.ts y lo pasan por acá.
 *
 * El modo "scroll" usa un ancla nativa — el scroll suave lo resuelve CSS, así
 * que no hace falta JavaScript ni convertir la sección en Client Component.
 */
export function Cta({
  action,
  variant = "primary",
  size = "lg",
  className,
  withArrow = true,
}: {
  action: CtaAction;
  variant?: Variant;
  size?: "sm" | "md" | "lg";
  className?: string;
  withArrow?: boolean;
}) {
  const content = (
    <>
      {action.label}
      {withArrow && <ArrowRight className="size-4 shrink-0" />}
    </>
  );

  if (action.kind === "link") {
    return (
      <Button
        href={action.href}
        variant={variant}
        size={size}
        className={className}
        target={action.external ? "_blank" : undefined}
        rel={action.external ? "noopener noreferrer" : undefined}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      href={`#${action.targetId}`}
      variant={variant}
      size={size}
      className={className}
    >
      {content}
    </Button>
  );
}

/** Aclaración breve debajo del CTA ("sin registro", "se abre WhatsApp"). */
export function CtaHint({
  action,
  tone = "light",
  className,
}: {
  action: CtaAction;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (!action.hint) return null;

  return (
    <p
      className={cn(
        "text-sm",
        tone === "dark" ? "text-white/50" : "text-ink-500",
        className,
      )}
    >
      {action.hint}
    </p>
  );
}

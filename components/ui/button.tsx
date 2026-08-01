import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "onDarkGhost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-[transform,background-color,border-color,box-shadow,color] duration-200 " +
  "ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] " +
  "disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_1px_2px_rgb(11_80_232/0.24),0_8px_24px_-8px_rgb(11_80_232/0.5)] " +
    "hover:bg-brand-700 hover:shadow-[0_1px_2px_rgb(11_80_232/0.3),0_12px_32px_-10px_rgb(11_80_232/0.6)]",
  secondary:
    "bg-paper-50 text-ink-900 ring-1 ring-paper-400 ring-inset hover:bg-paper-100 hover:ring-paper-400",
  ghost: "text-ink-700 hover:bg-paper-200 hover:text-ink-900",
  onDark:
    "bg-white text-ink-900 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.6)] hover:bg-paper-200",
  onDarkGhost:
    "text-white/85 ring-1 ring-white/15 ring-inset hover:bg-white/10 hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-13 px-7 text-base",
};

type SharedProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

type AsAnchor = SharedProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    keyof SharedProps | "href"
  >;

type AsButton = SharedProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    keyof SharedProps
  >;

/**
 * Renderiza <a> si recibe href, <button> si no. Un solo lugar donde vive el
 * aspecto de todos los botones de la landing.
 */
export function Button(props: AsAnchor | AsButton) {
  const { variant = "primary", size = "md", className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (rest.href !== undefined) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  // En esta rama `href` es undefined, así que React lo descarta al renderizar.
  return (
    <button className={classes} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}

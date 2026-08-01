import type { SVGProps } from "react";

/**
 * Iconografía propia, trazo de 1.5 y esquinas redondeadas.
 *
 * Nota deliberada: no usamos el logotipo de WhatsApp ni el de Google. Son
 * marcas registradas y reproducirlas insinúa una afiliación que no existe —
 * exactamente lo que hace fracasar una revisión de Meta. Usamos símbolos
 * genéricos y nombramos los servicios en texto.
 */

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);

export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Icon>
);

export const ChatBubble = (p: IconProps) => (
  <Icon {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.7 8.7 0 0 1-3.8-.9L3 21l1.9-5.6A8.7 8.7 0 0 1 4 11.5 8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" />
  </Icon>
);

export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Icon>
);

export const Bell = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 9a6 6 0 1 0-12 0c0 4.5-1.5 6-1.5 6h15S18 13.5 18 9Z" />
    <path d="M10.3 19a2 2 0 0 0 3.4 0" />
  </Icon>
);

export const Send = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12 20 4.5 15 20l-3.4-6.1L4.5 12Z" />
  </Icon>
);

export const Clock = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </Icon>
);

export const Shield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
    <path d="m9.2 12.2 2 2 3.6-4" />
  </Icon>
);

export const Handoff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v3" />
    <path d="M20 6l-5.5 5.5" />
    <path d="M9 20H6a2 2 0 0 1-2-2v-3" />
    <path d="M4 18l5.5-5.5" />
  </Icon>
);

export const Plug = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 3v6M15 3v6" />
    <path d="M6 9h12v3a6 6 0 0 1-12 0V9Z" />
    <path d="M12 18v3" />
  </Icon>
);

export const Sliders = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="8" cy="17" r="2" />
  </Icon>
);

export const Moon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </Icon>
);

export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9.5 6 6 6-6" />
  </Icon>
);

export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9.5 6 6 6-6 6" />
  </Icon>
);

export const Scissors = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="6" cy="18" r="2.5" />
    <path d="M8 7.5 20 18M20 6 8 16.5" />
  </Icon>
);

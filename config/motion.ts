import type { Transition, Variants } from "motion/react";

/**
 * Presets de movimiento compartidos.
 *
 * Regla del proyecto: sólo viven acá las curvas y variantes que se usan en más
 * de una sección. Las variantes específicas de una sección viven junto a ella.
 * Una carpeta global de animaciones siempre termina siendo un cementerio.
 */

export const easeOutSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeInOutSoft: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const transitions = {
  soft: { duration: 0.7, ease: easeOutSoft },
  quick: { duration: 0.28, ease: easeOutSoft },
  spring: { type: "spring", stiffness: 380, damping: 32, mass: 0.8 },
} satisfies Record<string, Transition>;

/** Entrada estándar de bloques al hacer scroll. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: transitions.soft },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.soft },
};

/** Contenedor que escalona la entrada de sus hijos. */
export function stagger(delayChildren = 0, staggerChildren = 0.08): Variants {
  return {
    hidden: {},
    visible: { transition: { delayChildren, staggerChildren } },
  };
}

/** Config de viewport por defecto: animar una sola vez, ya bien entrado el bloque. */
export const viewportOnce = { once: true, amount: 0.25 } as const;

"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { fadeUp, transitions, viewportOnce } from "@/config/motion";
import { cn } from "@/lib/utils";

/**
 * Entrada al hacer scroll. Con movimiento reducido se renderiza estático:
 * el contenido nunca depende de la animación para ser visible.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ ...transitions.soft, delay }}
    >
      {children}
    </MotionTag>
  );
}

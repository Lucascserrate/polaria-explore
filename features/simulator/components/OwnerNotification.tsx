"use client";

import { motion, useReducedMotion } from "motion/react";
import type { OwnerAlert } from "@/features/simulator/types";
import { Bell, CalendarIcon, Check, Handoff } from "@/components/ui/icons";
import { easeOutSoft } from "@/config/motion";
import { cn } from "@/lib/utils";

const styles: Record<
  OwnerAlert["kind"],
  { icon: typeof Bell; ring: string; text: string; bg: string }
> = {
  booked: {
    icon: Check,
    ring: "ring-brand-200",
    text: "text-brand-700",
    bg: "bg-brand-50",
  },
  moved: {
    icon: CalendarIcon,
    ring: "ring-brand-200",
    text: "text-brand-700",
    bg: "bg-brand-50",
  },
  cancelled: {
    icon: CalendarIcon,
    ring: "ring-paper-400",
    text: "text-ink-600",
    bg: "bg-paper-200",
  },
  // El único que pide algo del dueño. Va en ámbar por eso.
  handoff: {
    icon: Handoff,
    ring: "ring-attention-400/60",
    text: "text-attention-700",
    bg: "bg-attention-50",
  },
};

export function OwnerNotification({ alert }: { alert: OwnerAlert }) {
  const reduced = useReducedMotion();
  const style = styles[alert.kind];
  const Icon = style.icon;

  return (
    <motion.li
      initial={reduced ? false : { opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.34, ease: easeOutSoft }}
      className={cn(
        "flex items-start gap-2.5 rounded-xl px-3 py-2.5 ring-1 ring-inset",
        style.bg,
        style.ring,
      )}
    >
      <Icon className={cn("mt-px size-4 shrink-0", style.text)} />
      <p className="min-w-0 flex-1 text-[0.8125rem] leading-snug text-ink-700">
        {alert.text}
      </p>
      <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-ink-500">
        {alert.time}
      </span>
    </motion.li>
  );
}

"use client";

import { Children, createElement, type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const ITEM: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

export type AnimatedGroupProps = {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  /** Seconds between items (mock cadence ~50–70ms). */
  stagger?: number;
  /** Cap the staggered count — paint the rest immediately (long lists). */
  max?: number;
};

/**
 * List paint-in (motion-primitives `AnimatedGroup`). ~50–70ms stagger,
 * translateY + fade, spring. Stagger on FIRST paint / mode-switch only — never
 * on scroll re-entry of already-seen cards. Reduced-motion = no stagger.
 */
export function AnimatedGroup({
  children,
  className,
  as = "div",
  stagger = 0.06,
  max = 6,
}: AnimatedGroupProps) {
  const reduced = usePrefersReducedMotion();
  const items = Children.toArray(children);

  if (reduced) {
    return createElement(as, { className }, children);
  }

  const MotionTag = motion[as as "div"];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: stagger } } }}
    >
      {items.map((child, i) => (
        <motion.div key={i} variants={i < max ? ITEM : undefined}>
          {child}
        </motion.div>
      ))}
    </MotionTag>
  );
}

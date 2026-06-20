"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants, type Transition } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const DEFAULT_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const DEFAULT_TRANSITION: Transition = { duration: 0.5, ease: [0.23, 1, 0.32, 1] };

export type InViewProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  transition?: Transition;
  /** Root margin for the trigger. */
  margin?: `${number}px` | string;
};

/**
 * Fire-once viewport gate (motion-primitives `InView`). Triggers count-ups +
 * dataviz fills ONCE on viewport-enter (matches the mock's 0.5s ease-out
 * reveal). Reduced-motion renders children at final state immediately.
 */
export function InView({
  children,
  className,
  variants = DEFAULT_VARIANTS,
  transition = DEFAULT_TRANSITION,
  margin = "0px 0px -10% 0px",
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inView = useInView(ref, { once: true, margin: margin as any });

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

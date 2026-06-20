"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform, type SpringOptions } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
  /**
   * Custom formatter — CLIENT components only (functions can't cross the
   * server→client boundary). Server components should use the serializable
   * prefix/suffix/decimals/locale props instead.
   */
  format?: (n: number) => string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Thousands grouping (default true). */
  locale?: boolean;
};

const DEFAULT_SPRING: SpringOptions = { stiffness: 150, damping: 20, mass: 0.7 };

function defaultFormat(n: number, decimals: number, locale: boolean): string {
  if (locale) {
    return n.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return n.toFixed(decimals);
}

/**
 * Count-up on reveal (motion-primitives `AnimatedNumber`). Gentle spring, no
 * bounce, fires once. HONESTY RULE: only ever pass REAL values — never animate
 * a fabricated metric. Reduced-motion renders the final value immediately.
 */
export function AnimatedNumber({
  value,
  className,
  springOptions,
  format,
  prefix = "",
  suffix = "",
  decimals = 0,
  locale = true,
}: AnimatedNumberProps) {
  const reduced = usePrefersReducedMotion();
  // Start at 0 so the value counts UP on reveal (fire-once); animates on change after.
  const spring = useSpring(0, springOptions ?? DEFAULT_SPRING);
  const render = (n: number) =>
    format ? format(n) : `${prefix}${defaultFormat(n, decimals, locale)}${suffix}`;
  const display = useTransform(spring, render);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (reduced) return <span className={className}>{render(value)}</span>;

  return <motion.span className={className}>{display}</motion.span>;
}

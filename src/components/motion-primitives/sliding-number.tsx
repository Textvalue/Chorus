"use client";

import { motion, type Transition } from "motion/react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const ROLL: Transition = { type: "spring", stiffness: 280, damping: 32 };

function Digit({ value, place }: { value: number; place: number }) {
  const digit = Math.floor(value / place) % 10;
  return (
    <span className="relative inline-block h-[1em] w-[0.62ch] overflow-hidden align-baseline">
      {/* sizing ghost */}
      <span className="invisible">0</span>
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          animate={{ y: `${(i - digit) * 100}%` }}
          transition={ROLL}
        >
          {i}
        </motion.span>
      ))}
    </span>
  );
}

export type SlidingNumberProps = { value: number; className?: string };

/**
 * Odometer digit-roll (motion-primitives `SlidingNumber`). Roll on REAL value
 * change only (streak, core-memory count). Reduced-motion = plain tabular-nums.
 */
export function SlidingNumber({ value, className }: SlidingNumberProps) {
  const reduced = usePrefersReducedMotion();
  const intValue = Math.max(0, Math.round(value));

  if (reduced) {
    return <span className={cn("tabular-nums", className)}>{intValue.toLocaleString()}</span>;
  }

  const places: number[] = [];
  let p = 1;
  while (p <= intValue) {
    places.push(p);
    p *= 10;
  }
  if (places.length === 0) places.push(1);

  return (
    <span className={cn("inline-flex tabular-nums", className)}>
      {places.reverse().map((place) => (
        <Digit key={place} value={intValue} place={place} />
      ))}
    </span>
  );
}

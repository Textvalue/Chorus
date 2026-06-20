"use client";

import { createElement } from "react";
import { motion, type Variants } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

type Preset = "fade-in-blur" | "fade";

const ITEM: Record<Preset, Variants> = {
  "fade-in-blur": {
    hidden: { opacity: 0, y: 6, filter: "blur(6px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
};

export type TextEffectProps = {
  children: string;
  /** word is the default — per-char reads gimmicky for body copy. */
  per?: "word" | "char";
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  preset?: Preset;
  /** Seconds before the reveal starts. */
  delay?: number;
  /** Seconds between segments. */
  stagger?: number;
  /** Gate the reveal (e.g. fire on resolve). Fires ONCE — never loops. */
  trigger?: boolean;
};

/**
 * The "AI is composing" reveal (motion-primitives `TextEffect`). per:word,
 * fade-in-blur, quiet, fires ONCE on resolve. Used for post body, comment
 * draft, onboarding hero, rotating question. Reduced-motion = plain text.
 */
export function TextEffect({
  children,
  per = "word",
  as = "p",
  className,
  preset = "fade-in-blur",
  delay = 0,
  stagger = 0.026,
  trigger = true,
}: TextEffectProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced || !children) {
    return createElement(as, { className }, children);
  }

  const segments = per === "word" ? children.split(/(\s+)/) : Array.from(children);
  const item = ITEM[preset];

  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const MotionTag = motion[as as "p"];

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate={trigger ? "visible" : "hidden"}
      variants={container}
      aria-label={children}
    >
      {segments.map((seg, i) =>
        /^\s+$/.test(seg) ? (
          <span key={i} className="whitespace-pre-wrap" aria-hidden>
            {seg}
          </span>
        ) : (
          <motion.span
            key={i}
            className="inline-block whitespace-pre [will-change:transform,filter,opacity]"
            variants={item}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            aria-hidden
          >
            {seg}
          </motion.span>
        ),
      )}
    </MotionTag>
  );
}

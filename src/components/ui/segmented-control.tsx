"use client";

import type { ReactNode } from "react";
import { AnimatedBackground } from "@/components/motion-primitives/animated-background";
import { cn } from "@/lib/utils";

export type SegOption = { value: string; label: ReactNode; icon?: ReactNode };

export type SegmentedControlProps = {
  options: SegOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
  /** accent = electric-violet-soft pill (filters); surface = white pill (author switch). */
  tone?: "accent" | "surface";
  size?: "sm" | "md";
  "aria-label"?: string;
};

/**
 * The CANONICAL segmented control (consistency table). shadcn Toggle Group
 * semantics + Motion-Primitives `Animated Background` sliding pill (one shared
 * `layoutId` per instance). Used on Create author switch, Ideas 3-mode, Queue
 * filter, Analytics range. Voice tabs reuse the same pill via Tabs.
 */
export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
  tone = "accent",
  size = "md",
  ...rest
}: SegmentedControlProps) {
  return (
    <div
      role="tablist"
      aria-label={rest["aria-label"]}
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--paper-2)] p-1",
        className,
      )}
    >
      <AnimatedBackground
        defaultValue={value}
        onValueChange={(id) => {
          if (id) onValueChange(id);
        }}
        className={cn(
          "rounded-[10px]",
          tone === "accent"
            ? "bg-[var(--accent-soft)]"
            : "bg-[var(--surface)] shadow-[var(--shadow-1)]",
        )}
      >
        {options.map((o) => (
          <button
            key={o.value}
            data-id={o.value}
            type="button"
            role="tab"
            aria-selected={value === o.value}
            className={cn(
              "rounded-[10px] font-semibold whitespace-nowrap transition-colors",
              size === "sm" ? "h-7 px-3 text-[13px]" : "h-8 px-3.5 text-[13.5px]",
              "text-[var(--text-muted)]",
              tone === "accent"
                ? "data-[checked=true]:text-[var(--accent-ink)]"
                : "data-[checked=true]:text-[var(--text-strong)]",
              "[&>span>svg]:size-4",
            )}
          >
            {o.icon}
            {o.label}
          </button>
        ))}
      </AnimatedBackground>
    </div>
  );
}

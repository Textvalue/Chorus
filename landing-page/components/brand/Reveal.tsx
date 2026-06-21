"use client";

import { useInView } from "@/lib/hooks";
import { cn } from "@/lib/utils";

/**
 * Entrance grammar. Content always renders; only the entrance transition is gated.
 * SSR / reduced-motion → settled final frame (opacity 1, no offset).
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as never}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
      className={cn(
        "transition-all duration-700 ease-out",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className
      )}
    >
      {children}
    </Tag>
  );
}

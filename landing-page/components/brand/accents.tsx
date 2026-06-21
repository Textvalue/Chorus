import { cn } from "@/lib/utils";

/** VioletWord — the brand thread. ONE load-bearing noun per section. ev-800 for AA on light. */
export const VioletWord = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <span className={cn("text-violet-deep font-semibold", className)}>{children}</span>;

/** VioletHighlight — the highlighter. ONE per page, max. A soft wash with ink text on top (not a button). */
export const VioletHighlight = ({ children }: { children: React.ReactNode }) => (
  <mark className="rounded-[3px] bg-violet-soft px-1.5 text-violet-deep">{children}</mark>
);

/** Eyebrow — General Sans 600, tracked uppercase. */
export const Eyebrow = ({
  children,
  className,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) => (
  <p className={cn("label", dark ? "text-violet-bright" : "text-violet-deep", className)}>
    {children}
  </p>
);

/** Pill — small bordered tag. */
export const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-rule bg-paper px-3 py-1 text-caption text-ink-soft">
    <span className="h-1.5 w-1.5 rounded-full bg-violet" aria-hidden />
    {children}
  </span>
);

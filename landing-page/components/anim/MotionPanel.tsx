import { cn } from "@/lib/utils";

/**
 * Same browser-chrome frame as ScreenFrame, but holds a live concept animation
 * instead of a "screenshot goes here" placeholder. Used where an abstract
 * capability (voice, repurpose, the learning loop) reads better as motion than
 * as a static screenshot. Pure-CSS children settle under prefers-reduced-motion.
 */
export function MotionPanel({
  label,
  ratio = "4/3",
  children,
  className,
}: {
  label: string;
  ratio?: "16/10" | "4/3" | "16/9";
  children: React.ReactNode;
  className?: string;
}) {
  const aspect =
    ratio === "4/3" ? "aspect-[4/3]" : ratio === "16/9" ? "aspect-video" : "aspect-[16/10]";
  return (
    <div className={cn("overflow-hidden rounded-xl border border-rule bg-paper", className)}>
      <div className="flex items-center gap-2 border-b border-rule bg-bone/70 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-sand" />
        <span className="h-2.5 w-2.5 rounded-full bg-sand" />
        <span className="h-2.5 w-2.5 rounded-full bg-sand" />
        <span className="ml-2 truncate text-caption text-ink-faint">{label}</span>
      </div>
      <div className={cn("relative grid place-items-center overflow-hidden bg-bone", aspect)}>
        {children}
      </div>
    </div>
  );
}

import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Honest, swap-ready placeholder for a real product screenshot.
 * App/browser chrome frame + a neutral empty state that clearly reads
 * "a screenshot goes here" — no decorative gradient, nothing pretending to be UI.
 */
export function ScreenFrame({
  label,
  ratio = "16/10",
  className,
}: {
  label: string;
  ratio?: "16/10" | "4/3" | "16/9";
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
      <div className={cn("relative grid place-items-center bg-bone", aspect)}>
        <div className="flex flex-col items-center gap-2.5 text-center">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-rule bg-paper text-ink-faint">
            <Monitor size={18} />
          </span>
          <span className="text-caption text-ink-faint">Screenshot goes here</span>
        </div>
      </div>
    </div>
  );
}

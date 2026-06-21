import { Reveal } from "@/components/brand/Reveal";
import { ScreenFrame } from "@/components/shared/ScreenFrame";
import { cn } from "@/lib/utils";

/** One feature presented as an alternating image+text row (the standard SaaS zig-zag). */
export function FeatureRow({
  title,
  body,
  shot,
  flip = false,
  note,
  visual,
}: {
  title: string;
  body: string;
  shot?: string;
  flip?: boolean;
  note?: string;
  visual?: React.ReactNode;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className={cn(flip && "lg:order-2")}>
        <h2 className="font-display text-h2 font-semibold text-ink">{title}</h2>
        <p className="mt-4 max-w-md text-body-l text-ink-soft">{body}</p>
        {note && (
          <p className="mt-4 max-w-md border-l-2 border-violet pl-4 text-body text-ink">{note}</p>
        )}
      </div>
      <Reveal className={cn(flip && "lg:order-1")}>
        {visual ?? <ScreenFrame label={shot ?? ""} ratio="4/3" />}
      </Reveal>
    </div>
  );
}

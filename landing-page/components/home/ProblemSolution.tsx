import { Check } from "lucide-react";
import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { cn } from "@/lib/utils";

function Bar({ w, flagged = false }: { w: string; flagged?: boolean }) {
  return (
    <span
      className={cn(
        "block h-2 rounded-full",
        flagged ? "bg-warning/25 ring-1 ring-warning/40" : "bg-linen"
      )}
      style={{ width: w }}
    />
  );
}

function MiniDraft({
  label,
  note,
  clean,
  bars,
}: {
  label: string;
  note: string;
  clean: boolean;
  bars: { w: string; flagged?: boolean }[];
}) {
  return (
    <div className="rounded-xl border border-rule bg-paper p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption font-medium text-ink">{label}</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
            clean ? "bg-violet-soft text-violet-deep" : "bg-warning/15 text-warning"
          )}
        >
          {clean && <Check size={11} />}
          {note}
        </span>
      </div>
      <div className="mt-3.5 space-y-2">
        {bars.map((b, i) => (
          <Bar key={i} w={b.w} flagged={b.flagged} />
        ))}
      </div>
    </div>
  );
}

export function ProblemSolution() {
  return (
    <Section tint>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHead title="Everyone can tell when a post was written by AI." />
          <div className="mt-6 max-w-md space-y-4">
            <p className="text-body text-ink-soft">
              The stock phrases, the over-tidy rhythm, the em dash in every other line. Your network
              spots it in a second, and a post that reads as AI costs you more than staying quiet.
            </p>
            <p className="text-body text-ink">
              Penkala checks every draft against those tells and rewrites the ones that slip through.
              What you post reads like you wrote it, because it started from how you write.
            </p>
          </div>
        </div>
        <Reveal className="space-y-3 rounded-2xl border border-rule bg-paper/60 p-5 sm:p-6">
          <MiniDraft
            label="A typical AI draft"
            note="AI tells found"
            clean={false}
            bars={[
              { w: "100%" },
              { w: "92%", flagged: true },
              { w: "80%" },
              { w: "88%", flagged: true },
              { w: "64%" },
            ]}
          />
          <MiniDraft
            label="Your draft"
            note="No AI tells, checked"
            clean
            bars={[{ w: "100%" }, { w: "85%" }, { w: "94%" }, { w: "70%" }]}
          />
        </Reveal>
      </div>
    </Section>
  );
}

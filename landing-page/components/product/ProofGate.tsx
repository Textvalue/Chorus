import { Check } from "lucide-react";
import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";

const checks = [
  "Forced rule of three",
  "Contrast reframes",
  "Throat-clearing transitions",
  "Em-dash overuse",
];

const body =
  "Sounding AI-written is the fastest way to lose a reader, and you rarely catch it in your own draft. Penkala runs every draft through a fixed check: a kill-list, banned phrases, the structural tells. A draft that trips it gets rewritten and re-checked until it reads clean.";

/** The proof gate beat: the deterministic clean-check, shown as the real confidence strip. */
export function ProofGate() {
  return (
    <Section tint>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHead title="Every draft passes the same check." />
          <p className="mt-6 max-w-md text-body text-ink-soft">{body}</p>
        </div>

        <Reveal>
          <div className="rounded-2xl border border-rule bg-paper p-5 sm:p-6">
            {/* a draft, post-check */}
            <div className="space-y-2.5">
              <span className="block h-2 w-full rounded-full bg-linen" />
              <span className="block h-2 w-[92%] rounded-full bg-linen" />
              <span className="block h-2 w-[78%] rounded-full bg-linen" />
              <span className="block h-2 w-[85%] rounded-full bg-linen" />
            </div>

            {/* confidence strip — the real, deterministic part (no fabricated score) */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-violet-soft bg-violet-soft/60 px-3.5 py-3">
              <span className="inline-flex items-center gap-2 text-caption font-medium text-violet-deep">
                <Check size={15} aria-hidden /> No AI tells, checked
              </span>
              <span className="text-caption text-violet-deep/70 underline underline-offset-2">
                why?
              </span>
            </div>

            <div className="mt-5">
              <p className="text-caption text-ink-faint">What it checks for</p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {checks.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-rule bg-bone px-2.5 py-1 text-[0.75rem] text-ink-soft"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

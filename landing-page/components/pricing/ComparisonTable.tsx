import { Check, Minus } from "lucide-react";
import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { cn } from "@/lib/utils";

type Cell = boolean | string;
type Row = { f: string; free: Cell; pro: Cell; team: Cell };

const rows: Row[] = [
  { f: "Voice and beliefs captured", free: true, pro: true, team: true },
  { f: "Posts in your own voice", free: true, pro: true, team: true },
  { f: "The clean AI-tells check on every draft", free: true, pro: true, team: true },
  { f: "Ideas and repurpose", free: false, pro: true, team: true },
  { f: "The warm engagement feed", free: false, pro: true, team: true },
  { f: "Core Memory of your edits", free: false, pro: true, team: true },
  { f: "One shared company brand", free: false, pro: false, team: true },
  { f: "Team review and roles", free: false, pro: false, team: true },
  { f: "Billing", free: "Free", pro: "Flat", team: "Per poster" },
];

const COLS = "grid grid-cols-[1.7fr_1fr_1.05fr_1fr]";

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check size={18} className="text-violet" aria-label="Included" />;
  if (value === false)
    return <Minus size={16} className="text-ink-faint/40" aria-label="Not included" />;
  return <span className="text-caption font-medium text-ink-soft">{value}</span>;
}

export function ComparisonTable() {
  return (
    <Section tint>
      <SectionHead title="A closer look at each plan." center className="mx-auto" />
      <Reveal className="mx-auto mt-12 max-w-3xl overflow-x-auto pb-1">
        <div className="min-w-[560px] overflow-hidden rounded-2xl border border-rule bg-paper">
          {/* header */}
          <div className={cn(COLS, "items-end")}>
            <div className="p-5" />
            <div className="p-5 pb-4 text-center">
              <span className="font-display text-h3 font-semibold text-ink">Free</span>
            </div>
            <div className="rounded-t-xl bg-violet-soft/50 p-5 pb-4 text-center">
              <span className="font-display text-h3 font-semibold text-violet-deep">Pro</span>
              <span className="mt-1 block text-[0.68rem] font-semibold uppercase tracking-wider text-violet">
                Recommended
              </span>
            </div>
            <div className="p-5 pb-4 text-center">
              <span className="font-display text-h3 font-semibold text-ink">Team</span>
            </div>
          </div>

          {rows.map((r, i) => (
            <div key={r.f} className={cn(COLS, "items-center border-t border-rule")}>
              <div className="px-5 py-4 text-body text-ink-soft">{r.f}</div>
              <div className="grid place-items-center px-3 py-4">
                <CellValue value={r.free} />
              </div>
              <div
                className={cn(
                  "grid place-items-center self-stretch bg-violet-soft/50 px-3 py-4",
                  i === rows.length - 1 && "rounded-b-xl"
                )}
              >
                <CellValue value={r.pro} />
              </div>
              <div className="grid place-items-center px-3 py-4">
                <CellValue value={r.team} />
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

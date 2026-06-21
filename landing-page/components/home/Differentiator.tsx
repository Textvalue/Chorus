import { Check, Minus } from "lucide-react";
import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { cn } from "@/lib/utils";

const dimensions = [
  "What it knows about you",
  "Who it sounds like",
  "AI tells",
  "Your team",
  "Where it leaves you",
];

const chatgpt = [
  "Only what you paste, every time",
  "Generic AI, the same for everyone",
  "You catch and fix them yourself",
  "Everyone starts from a blank prompt",
  "Reads like AI",
];

const penkala = [
  "Your beliefs and voice, captured once",
  "You, and each person on your team",
  "Checked and cleaned before you see it",
  "One shared brand, every person's voice",
  "Sounds like you, and builds pipeline",
];

function ComparePanel({
  name,
  values,
  highlight = false,
}: {
  name: string;
  values: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border p-6 sm:p-7",
        highlight ? "border-violet ring-1 ring-violet bg-paper" : "border-rule bg-paper"
      )}
    >
      <p
        className={cn(
          "font-display text-h3 font-semibold",
          highlight ? "text-violet-deep" : "text-ink-faint"
        )}
      >
        {name}
      </p>
      <ul className="mt-5 space-y-4">
        {values.map((v, i) => (
          <li key={i} className="flex flex-col gap-1">
            <span className="text-caption text-ink-faint">{dimensions[i]}</span>
            <span className="flex items-start gap-2 text-body text-ink">
              {highlight ? (
                <Check size={16} className="mt-1 shrink-0 text-violet" aria-hidden />
              ) : (
                <Minus size={16} className="mt-1 shrink-0 text-ink-faint/50" aria-hidden />
              )}
              <span className={highlight ? "text-ink" : "text-ink-soft"}>{v}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Differentiator() {
  return (
    <Section>
      <SectionHead
        title="Penkala vs ChatGPT."
        intro="Most people open ChatGPT and ask it to write a post. Here is what changes when the tool knows your team and what each person believes."
        center
        className="mx-auto"
      />
      <Reveal className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
        <ComparePanel name="ChatGPT" values={chatgpt} />
        <ComparePanel name="Penkala" values={penkala} highlight />
      </Reveal>
    </Section>
  );
}

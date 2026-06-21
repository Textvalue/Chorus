import { Pencil, Brain, Sparkles } from "lucide-react";
import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { MotionPanel } from "@/components/anim/MotionPanel";
import { LearningLoopViz } from "@/components/anim/concepts";

const steps = [
  {
    icon: Pencil,
    t: "You fix a draft",
    b: "Reword a line, cut a hook you'd never use, approve one as-is.",
  },
  {
    icon: Brain,
    t: "It keeps the correction",
    b: "Penkala stores the change and the reason behind it, tied to your voice.",
  },
  {
    icon: Sparkles,
    t: "The next draft needs less fixing",
    b: "Each round starts closer to what you'd have written yourself.",
  },
];

export function LearningLoop() {
  return (
    <Section tint>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <SectionHead
            title="It remembers every edit you make."
            intro="Most AI tools forget you the moment you close the tab, so you fix the same thing every week. Penkala keeps a Core Memory for your team: every edit and approval becomes a correction it carries forward, so each draft starts closer to what you would publish."
          />
          <div className="mt-8 space-y-5">
            {steps.map((s, i) => (
              <Reveal key={s.t} delay={i * 90} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-rule bg-paper text-violet">
                  <s.icon size={18} />
                </span>
                <div>
                  <p className="font-medium text-ink">{s.t}</p>
                  <p className="mt-1 text-body text-ink-soft">{s.b}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-body-l font-medium text-ink">
            The more your team writes, the less you change.
          </p>
        </div>

        <Reveal>
          <MotionPanel label="Core Memory · every edit makes the next draft sharper" ratio="4/3">
            <LearningLoopViz />
          </MotionPanel>
        </Reveal>
      </div>
    </Section>
  );
}

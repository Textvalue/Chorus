import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { ScreenFrame } from "@/components/shared/ScreenFrame";
import { MotionPanel } from "@/components/anim/MotionPanel";
import { IdeaPulse } from "@/components/anim/concepts";

const surfaces = [
  {
    title: "Ideas pulled from what you believe.",
    body: "For-you angles come from your own positions. Discover follows the terms you care about. Repurpose turns one good post into a week of them.",
    visual: (
      <MotionPanel label="Ideas · angles from your beliefs" ratio="16/10">
        <IdeaPulse />
      </MotionPanel>
    ),
  },
  {
    title: "See every post before it ships.",
    body: "Drafts move through a clear approval flow, with team review built in. Scheduling means we remind you. Penkala never posts to LinkedIn on its own.",
    visual: <ScreenFrame label="Queue · approvals and team review" ratio="16/10" />,
  },
];

/** Ideas + Queue, shown as a two-up pair (supply on the left, sign-off on the right). */
export function SurfacePair() {
  return (
    <Section>
      <SectionHead
        title="Where posts come from, and how they get approved."
        center
        className="mx-auto"
      />
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {surfaces.map((s, i) => (
          <Reveal
            key={s.title}
            delay={i * 100}
            className="flex flex-col rounded-2xl border border-rule bg-paper p-6"
          >
            {s.visual}
            <h3 className="mt-6 font-display text-h3 font-semibold text-ink">{s.title}</h3>
            <p className="mt-3 text-body text-ink-soft">{s.body}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { ScreenFrame } from "@/components/shared/ScreenFrame";
import { Section, SectionHead } from "@/components/shared/Section";
import { FeatureRow } from "@/components/home/FeatureRow";
import { LearningLoop } from "@/components/home/LearningLoop";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { CtaBand } from "@/components/shared/CtaBand";
import { ProofGate } from "@/components/product/ProofGate";
import { SurfacePair } from "@/components/product/SurfacePair";
import { Roadmap } from "@/components/product/Roadmap";
import { PrimaryCta, GhostCta } from "@/components/brand/Cta";
import { VioletWord } from "@/components/brand/accents";
import { MotionPanel } from "@/components/anim/MotionPanel";
import { VoiceWaveform, BrandVisualMock } from "@/components/anim/concepts";

export const metadata: Metadata = {
  title: "Penkala: the team content operating system",
  description:
    "The place your company's positioning and every person's voice live, so the whole team posts on-brand, checks every draft clean, and turns commenting into pipeline.",
};

const faqs = [
  {
    q: "Does Penkala post to LinkedIn for me?",
    a: "No. A person reviews and clicks send on every post and every comment. Scheduling means we remind you at the right time. Nothing fires on its own.",
  },
  {
    q: "Will a whole team sound the same, like AI?",
    a: "That is the thing we built against. Each person's beliefs and writing samples drive their own drafts, and every draft runs a clean check before it ships.",
  },
  {
    q: "Is the warm feed compliant?",
    a: "The Engage feed works without cookies and never auto-comments. It surfaces posts and drafts a reply. You decide what gets sent.",
  },
  {
    q: "Can two teammates keep genuinely different voices?",
    a: "One company brand sits under everyone, and each person keeps their own voice on top. Full voice isolation across a big team is in progress, solid for one and deepening as we scale it.",
  },
  {
    q: "Does it run itself once it is set up?",
    a: "No. The voice interview takes real input from you, the models still need your judgment, and a person decides what ships.",
  },
];

export default function ProductPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Turn your team into your best <VioletWord>marketing channel</VioletWord>.
          </>
        }
        subhead="The place your company's positioning and every person's voice live, so the whole team posts on-brand."
      >
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCta>Start free</PrimaryCta>
          <GhostCta>Book a demo</GhostCta>
        </div>
      </PageHero>

      <div className="mx-auto max-w-5xl px-5 pb-20 md:pb-28 lg:px-8">
        <ScreenFrame
          label="Penkala workspace · Create, Ideas, Queue, Engage, Voice"
          ratio="16/9"
        />
      </div>

      <Section>
        <FeatureRow
          title="It learns your voice."
          body="Most tools read your last thirty posts and copy how you write. Penkala starts with a short, forward-looking interview that captures how you sound and what you believe, so your drafts carry a point of view you would stand behind."
          visual={
            <MotionPanel label="Voice · how you sound and what you believe" ratio="4/3">
              <VoiceWaveform />
            </MotionPanel>
          }
        />
      </Section>

      <Section>
        <FeatureRow
          flip
          title="Speak what's on your mind and get a high-performing post back."
          body="The blank box is where most posting dies. Brain-dump the rough idea by voice or by typing, and the composer shapes it through your voice and your company's positioning, then shows you a clean check before anyone reads it."
          shot="Create · the composer and the clean check"
        />
      </Section>

      <ProofGate />

      <Section>
        <FeatureRow
          flip
          title="Finish every post with a visual in your brand."
          body="When your draft is ready, Penkala suggests visuals and infographics proven to perform, then builds the one you pick in your brand kit: your colors, your fonts, your logo."
          visual={
            <MotionPanel label="Visuals · proven layouts in your brand kit" ratio="4/3">
              <BrandVisualMock />
            </MotionPanel>
          }
        />
      </Section>

      <SurfacePair />

      <Section>
        <FeatureRow
          title="Show up where your buyers already are."
          body="Pipeline gets built in the comments, on the posts of the people at the accounts you want to close. Penkala marks those people, surfaces what they just posted, and drafts a comment in your voice and on your strategy, through the same clean check. You read it, decide, and post it yourself."
          shot="Engage · your accounts' latest posts and a reply in your voice"
          note="Penkala counts the conversations that turn into pipeline. Likes do not pay quota."
        />
      </Section>

      <LearningLoop />

      <Roadmap />

      <HowItWorks />

      <Section tint>
        <SectionHead title="The questions teams ask." center className="mx-auto" />
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqAccordion items={faqs} />
        </div>
      </Section>

      <CtaBand
        title="Stop being the only one posting."
        sub="In about ten minutes you capture your voice, then watch the first post come back sounding like you."
      />
    </>
  );
}

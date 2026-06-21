import type { Metadata } from "next";
import { PageHero } from "@/components/shared/PageHero";
import { PlanCards } from "@/components/pricing/PlanCards";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { Section, SectionHead } from "@/components/shared/Section";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { CtaBand } from "@/components/shared/CtaBand";
import { VioletWord } from "@/components/brand/accents";

export const metadata: Metadata = {
  title: "Penkala: pricing for revenue teams",
  description:
    "Start free as one founder and add the team when more people post. Numbers are placeholders while we finalize pricing.",
};

const faqs = [
  {
    q: "How does billing work?",
    a: "By the people who post. A seat counts only once someone publishes or comments, so a quiet teammate this month costs you nothing. Exact numbers are still being finalized.",
  },
  {
    q: "Is the free plan free forever?",
    a: "You can keep a free account, but generation runs on a monthly amount that pauses when it is spent. Generating posts costs real compute, so free is not unlimited. It is enough to know if this is for you.",
  },
  {
    q: "Pro or Team, which do I start on?",
    a: "Pro if you are the only one posting right now. Team once two or more people need to. Most founders begin on Pro and bring the team on once the motion works.",
  },
  {
    q: "What happens when the trial period ends?",
    a: "Your account stays. Generation drops to a capped free amount, and everything you have made stays with it. You upgrade when the team is ready.",
  },
  {
    q: "Do we keep our data and voice if we leave?",
    a: "Yes. You can export your company brand, each person's captured voice, and everything you have written. All of it comes with you.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        title={
          <>
            Priced to <VioletWord>grow</VioletWord> with your team.
          </>
        }
        subhead="You start free as one founder, and add the team when more people are ready to post."
      />

      <PlanCards />
      <ComparisonTable />

      <Section>
        <div className="mx-auto max-w-2xl text-center">
          <SectionHead title="The whole product, free to start." center className="mx-auto" />
          <p className="mt-6 text-body-l text-ink-soft">
            Free is not a stripped-down demo. You get the real product, voice capture, posts in your
            own voice, and the warm feed, with a set amount to write with each month. When you run
            out, generation pauses. Nothing you have made disappears, and your voice stays yours.
            Move up when the team is ready.
          </p>
        </div>
      </Section>

      <Section tint>
        <SectionHead title="Questions about pricing." center className="mx-auto" />
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqAccordion items={faqs} />
        </div>
      </Section>

      <CtaBand
        title="Your voice, captured in one sitting."
        sub="Answer a few questions, then watch the first post come back sounding like you. Bring the team on when it is time."
        secondary="Talk to us about your team"
      />
    </>
  );
}

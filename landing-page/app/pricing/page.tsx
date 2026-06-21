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
    a: "By the people who post. Team is a $99/mo workspace plus $49 for each person who publishes, so a quiet teammate this month costs you nothing. Pro is a flat $39/mo for one founder.",
  },
  {
    q: "Is the free plan free forever?",
    a: "Everyone starts with 14 days of the full product. After that you can keep a free account, but generation runs on a monthly cap, so free is not unlimited. It is enough to know if this is for you.",
  },
  {
    q: "What if I run out of generations for the month?",
    a: "Each plan includes a monthly pool of generations. If you need more, you can top up or move up a plan. You only pay for what you choose to add.",
  },
  {
    q: "Pro or Team, which do I start on?",
    a: "Pro if you are the only one posting right now. Team once two or more people need to. Most founders begin on Pro and bring the team on once the motion works.",
  },
  {
    q: "What happens when the trial period ends?",
    a: "After your 14 days, your account stays. Generation drops to a capped free amount, and everything you have made stays with it. You upgrade when the team is ready.",
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
            For 14 days you get all of it: voice capture, posts in your own voice, and the warm
            feed. After that, a free tier with a set amount to write with each month. When you run
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

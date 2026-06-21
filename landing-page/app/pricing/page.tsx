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
    a: "By the people who post. Team is a $99/mo workspace plus $49 for each person who publishes, so a quiet teammate this month costs you nothing. Pro is a flat $49/mo for one founder.",
  },
  {
    q: "Is the free plan free forever?",
    a: "Everyone starts with 14 days of the full product. After that, a free tier capped at five posts a month, text only. It is enough to know if Penkala is for you.",
  },
  {
    q: "What are the limits on each plan?",
    a: "Posts are unlimited on Pro and Team, within fair use. Branded visuals have a monthly cap, thirty on Pro and fifty per seat on Team. Need more? Top up or move up a plan.",
  },
  {
    q: "Pro or Team, which do I start on?",
    a: "Pro if you are the only one posting right now. Team once two or more people need to. Most founders begin on Pro and bring the team on once the motion works.",
  },
  {
    q: "What happens when the trial period ends?",
    a: "After your 14 days, your account stays. You drop to the free tier, five posts a month and text only, and everything you have made stays with it. Upgrade when you are ready.",
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
            For 14 days you get all of it: voice capture, posts in your own voice, branded visuals,
            and the warm feed. After that, a free tier capped at five posts a month, text only.
            Nothing you have made disappears, and your voice stays yours. Move up when the team is
            ready.
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

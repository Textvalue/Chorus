import { Hero } from "@/components/home/Hero";
import { DreamOutcome } from "@/components/home/DreamOutcome";
import { ProblemSolution } from "@/components/home/ProblemSolution";
import { Features } from "@/components/home/Features";
import { LearningLoop } from "@/components/home/LearningLoop";
import { Differentiator } from "@/components/home/Differentiator";
import { TeamExpansion } from "@/components/home/TeamExpansion";
import { Section, SectionHead } from "@/components/shared/Section";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { CtaBand } from "@/components/shared/CtaBand";

const faqs = [
  {
    q: "Is this just an AI writer?",
    a: "No. AI writers rewrite what you've already posted. Penkala starts from what you believe, captured in a seven-question interview, so a post makes an argument you'd stand behind.",
  },
  {
    q: "What if it gets my voice wrong?",
    a: "You fix the draft, and it keeps the correction for next time. It learns your voice from your real posts, so it has somewhere true to start.",
  },
  {
    q: "Won't it sound generic, like everything else AI makes?",
    a: "That's the part it checks for. Every draft runs against a fixed set of AI tells before it reaches you, and you see the result on the post itself.",
  },
  {
    q: "Do I need a team to use it?",
    a: "No. It's built for one founder first. Invite a team later if you want, and everyone shares your company's brand while keeping their own voice.",
  },
  {
    q: "Does it post for me automatically?",
    a: "No. Penkala drafts; you read it and post it. Nothing publishes or comments on its own.",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />
      <DreamOutcome />
      <ProblemSolution />
      <Features />
      <LearningLoop />
      <Differentiator />
      <TeamExpansion />

      <Section>
        <SectionHead title="Questions we get." />
        <div className="mt-8 max-w-3xl">
          <FaqAccordion items={faqs} />
        </div>
      </Section>

      <CtaBand
        title="Write a post that sounds like you wrote it."
        sub="Answer a few questions about how you think and talk, then read the first post Penkala writes back. Free to start."
      />
    </>
  );
}

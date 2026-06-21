import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";

const body =
  "One shared company brand sits under each person's voice today, solid for one founder and deepening as we add teammates. Coming next: pipeline-first analytics that weigh warm conversations over likes, and a team leaderboard that makes posting a habit.";

/** The honest roadmap beat — what ships today vs what is coming. No fabricated screen. */
export function Roadmap() {
  return (
    <Section>
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-h2 font-semibold text-ink">
          Built to get deeper as you grow.
        </h2>
        <p className="mt-5 text-body-l text-ink-soft">{body}</p>
      </Reveal>
    </Section>
  );
}

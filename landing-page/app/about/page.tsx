import type { Metadata } from "next";
import { Users } from "lucide-react";
import { PageHero } from "@/components/shared/PageHero";
import { Section } from "@/components/shared/Section";
import { CtaBand } from "@/components/shared/CtaBand";
import { Reveal } from "@/components/brand/Reveal";
import { Mark } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Penkala: our story",
  description:
    "We built Penkala at a hackathon, after years of watching good go-to-market teams struggle to post on LinkedIn. Here is why.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="We watched good teams struggle to post."
        subhead="So we built Penkala at a hackathon, to give every team a way to sound like themselves on LinkedIn, without the AI tells."
      />

      {/* The story */}
      <Section className="pt-0" inner="pt-0 pb-20 md:pb-28">
        <div className="mx-auto max-w-2xl space-y-6 text-body-l text-ink-soft">
          <p>
            For years we worked inside go-to-market teams and watched the same thing happen. Everyone
            knew the company should be posting on LinkedIn. Almost no one knew what to say, or had
            the time to say it well. The people who did post sounded like a press release, or worse,
            like AI.
          </p>
          <p>
            The idea: capture what a person thinks and how they sound, then help them post it without
            the tells that scream AI.
          </p>
          <p className="text-ink">
            We have seen what one good post can do for a pipeline. We built Penkala so a whole team
            can do it, in their own voice, every week.
          </p>
        </div>
      </Section>

      {/* Team photo slot */}
      <Section tint>
        <Reveal className="mx-auto max-w-4xl">
          <div className="grid aspect-[16/9] place-items-center overflow-hidden rounded-2xl border border-rule bg-paper">
            <div className="flex flex-col items-center gap-3 text-ink-faint">
              <span className="grid h-12 w-12 place-items-center rounded-xl border border-rule bg-bone">
                <Users size={20} />
              </span>
              <span className="text-caption">Team photo goes here</span>
            </div>
          </div>
          <p className="mt-4 text-center text-caption text-ink-faint">The team behind Penkala.</p>
        </Reveal>
      </Section>

      {/* Heritage nod */}
      <Section>
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="mx-auto mb-6 grid h-12 w-12 place-items-center rounded-xl border border-rule bg-bone">
            <Mark size={22} />
          </span>
          <p className="text-body-l text-ink-soft">
            The name comes from Slavoljub Penkala, the engineer who reinvented the pen in 1906. He
            did not invent writing. He made a better instrument for it. That is the idea here too.
          </p>
        </Reveal>
      </Section>

      <CtaBand
        title="See what your team could sound like."
        sub="Capture your voice in about ten minutes, and read the first post Penkala writes back."
      />
    </>
  );
}

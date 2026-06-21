import { Section, SectionHead } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";

const steps = [
  {
    n: "1",
    t: "Drop your company URL",
    b: "Penkala reads your site and your recent posts while you sign up, so setup is mostly confirming what it found.",
  },
  {
    n: "2",
    t: "Answer seven questions",
    b: "By voice or typing, about ten minutes. It learns what you believe and how you sound.",
  },
  {
    n: "3",
    t: "Post in your voice",
    b: "Your first draft comes back sounding like you, with the AI-tells check already done.",
  },
];

export function HowItWorks() {
  return (
    <Section>
      <SectionHead title="From your URL to your first post in about ten minutes." center />
      <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 90} className="rounded-2xl border border-rule bg-bone p-6">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-violet text-sm font-semibold text-white">
              {s.n}
            </span>
            <p className="mt-4 font-medium text-ink">{s.t}</p>
            <p className="mt-1.5 text-body text-ink-soft">{s.b}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

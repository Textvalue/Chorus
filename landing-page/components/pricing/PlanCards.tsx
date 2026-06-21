import { Check } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { PrimaryCta, GhostCta } from "@/components/brand/Cta";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  suffix?: string;
  note: string;
  fit: string;
  bullets: string[];
  cta: string;
  secondary?: string;
  recommended?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    note: "Start with 14 days of everything. Then a free tier, capped each month.",
    fit: "For the founder who wants to capture their voice and read the first post it writes back.",
    bullets: [
      "Your voice and beliefs, captured in one sitting",
      "Your first posts, written in your own voice",
      "Every draft checked clean before it ships",
      "A set monthly amount to write with",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "$39",
    suffix: "/mo",
    note: "For one person posting for the whole company.",
    fit: "For the founder posting every week who wants ideas, the warm feed, and a memory of every edit.",
    bullets: [
      "Everything in Free, with room to post all week",
      "Your full voice and beliefs wired into every draft",
      "The warm feed for the accounts you are chasing",
      "Ideas drawn from what you believe",
    ],
    cta: "Start free",
    recommended: true,
  },
  {
    name: "Team",
    price: "$49",
    suffix: "/seat/mo",
    note: "Per active seat, plus a $99/mo workspace base.",
    fit: "For the 3 to 15 person team sharing one brand and a pipeline number this quarter.",
    bullets: [
      "Everything in Pro, for your whole revenue team",
      "One shared company brand, each person keeps their own voice",
      "Approve your team's drafts before anything ships",
      "Seats counted once someone posts",
    ],
    cta: "Start free",
    secondary: "Talk to us about your team",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const { recommended } = plan;
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-paper p-7",
        recommended
          ? "border-violet ring-1 ring-violet shadow-[0_1px_30px_-12px_rgba(118,31,255,0.35)]"
          : "border-rule"
      )}
    >
      {recommended && (
        <span className="absolute -top-3 left-7 rounded-full bg-violet px-3 py-1 text-[0.7rem] font-medium tracking-wide text-white">
          Recommended
        </span>
      )}

      <p className="font-display text-h3 font-semibold text-ink">{plan.name}</p>

      <div className="mt-4 flex items-baseline gap-1">
        <span className="font-display text-h2 font-semibold leading-none tracking-tight text-ink">
          {plan.price}
        </span>
        {plan.suffix && (
          <span className="text-body text-ink-faint">{plan.suffix}</span>
        )}
      </div>
      <p className="mt-2 text-caption text-ink-faint">{plan.note}</p>

      <p className="mt-5 min-h-[3.5rem] text-body text-ink-soft">{plan.fit}</p>

      <div className="my-6 h-px bg-rule" />

      <ul className="flex-1 space-y-3">
        {plan.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-body text-ink-soft">
            <Check
              size={17}
              className="mt-1 shrink-0 text-violet"
              aria-hidden
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col items-start gap-3">
        <PrimaryCta
          className={cn(
            "w-full",
            !recommended &&
              "bg-violet-soft text-violet-deep hover:bg-violet hover:text-white"
          )}
        >
          {plan.cta}
        </PrimaryCta>
        {plan.secondary && (
          <div className="w-full text-center">
            <GhostCta>{plan.secondary}</GhostCta>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlanCards() {
  return (
    <Section inner="pt-4 pb-16 md:pt-6 md:pb-24">
      <Reveal className="grid items-stretch gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <PlanCard key={p.name} plan={p} />
        ))}
      </Reveal>
      <p className="mx-auto mt-8 max-w-2xl text-center text-caption text-ink-faint">
        Seats are billed only when someone posts. Need video, analytics, or SSO? Talk to us about
        Scale and Enterprise.
      </p>
    </Section>
  );
}

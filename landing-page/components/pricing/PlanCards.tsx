"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/brand/Reveal";
import { PrimaryCta, GhostCta } from "@/components/brand/Cta";
import { cn } from "@/lib/utils";

type Period = "monthly" | "annual";

type Plan = {
  name: string;
  price: Record<Period, string>;
  suffix?: string;
  note: Record<Period, string>;
  fit: string;
  bullets: string[];
  cta: string;
  secondary?: string;
  recommended?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: { monthly: "$0", annual: "$0" },
    note: {
      monthly: "Start with 14 days of everything. Then a free tier, capped each month.",
      annual: "Start with 14 days of everything. Then a free tier, capped each month.",
    },
    fit: "For the founder who wants to capture their voice and read the first post it writes back.",
    bullets: [
      "Your voice and beliefs, captured in one sitting",
      "Your first posts, written in your own voice",
      "Every draft checked clean before it ships",
      "Up to five posts a month, text only",
    ],
    cta: "Start free",
  },
  {
    name: "Pro",
    price: { monthly: "$49", annual: "$39" },
    suffix: "/mo",
    note: {
      monthly: "For one person posting for the whole company.",
      annual: "For one person posting for the whole company.",
    },
    fit: "For the founder posting every week who wants ideas, the warm feed, and a memory of every edit.",
    bullets: [
      "Everything in Free, with unlimited posts",
      "Thirty branded visuals a month",
      "The warm feed for the accounts you are chasing",
      "Ideas, repurpose, and a Core Memory that learns",
    ],
    cta: "Start free",
    recommended: true,
  },
  {
    name: "Team",
    price: { monthly: "$49", annual: "$39" },
    suffix: "/seat/mo",
    note: {
      monthly: "Per active seat, plus a $99/mo workspace base.",
      annual: "Per active seat, plus a $79/mo workspace base.",
    },
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

function PlanCard({ plan, period }: { plan: Plan; period: Period }) {
  const { recommended } = plan;
  const isPaid = plan.price.annual !== "$0";
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
          {plan.price[period]}
        </span>
        {plan.suffix && <span className="text-body text-ink-faint">{plan.suffix}</span>}
      </div>
      <p className="mt-1 h-4 text-[0.72rem] font-medium text-violet-deep">
        {period === "annual" && isPaid ? "billed annually" : ""}
      </p>
      <p className="mt-1 text-caption text-ink-faint">{plan.note[period]}</p>

      <p className="mt-5 min-h-[3.5rem] text-body text-ink-soft">{plan.fit}</p>

      <div className="my-6 h-px bg-rule" />

      <ul className="flex-1 space-y-3">
        {plan.bullets.map((b) => (
          <li key={b} className="flex gap-2.5 text-body text-ink-soft">
            <Check size={17} className="mt-1 shrink-0 text-violet" aria-hidden />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col items-start gap-3">
        <PrimaryCta
          className={cn(
            "w-full",
            !recommended && "bg-violet-soft text-violet-deep hover:bg-violet hover:text-white"
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

function Toggle({ period, setPeriod }: { period: Period; setPeriod: (p: Period) => void }) {
  return (
    <div className="mb-10 flex justify-center">
      <div className="inline-flex items-center gap-1 rounded-full border border-rule bg-bone p-1">
        <button
          type="button"
          onClick={() => setPeriod("monthly")}
          className={cn(
            "rounded-full px-4 py-1.5 text-caption font-medium transition-colors",
            period === "monthly" ? "bg-paper text-ink shadow-sm" : "text-ink-faint hover:text-ink"
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => setPeriod("annual")}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-caption font-medium transition-colors",
            period === "annual" ? "bg-paper text-ink shadow-sm" : "text-ink-faint hover:text-ink"
          )}
        >
          Annual
          <span className="rounded-full bg-violet-soft px-1.5 py-0.5 text-[0.65rem] font-semibold text-violet-deep">
            Save 20%
          </span>
        </button>
      </div>
    </div>
  );
}

export function PlanCards() {
  const [period, setPeriod] = useState<Period>("monthly");
  return (
    <Section inner="pt-4 pb-16 md:pt-6 md:pb-24">
      <Toggle period={period} setPeriod={setPeriod} />
      <Reveal className="grid items-stretch gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <PlanCard key={p.name} plan={p} period={period} />
        ))}
      </Reveal>
      <p className="mx-auto mt-8 max-w-2xl text-center text-caption text-ink-faint">
        Seats are billed only when someone posts. Need video, analytics, or SSO? Talk to us about
        Scale and Enterprise.
      </p>
    </Section>
  );
}

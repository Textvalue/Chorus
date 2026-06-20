// Engage — the warm feed, second act (PRD §5.12). A cookie-free read feed of marked
// people; Tutti drafts the comment in your voice; sends are human-clicked only.
import { TopBar, Avatar, Icon } from "@/components/ds";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemSeparator } from "@/components/ui/item";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";

export const dynamic = "force-dynamic";

const MARKED: { name: string; role: string; ago: string; post: string }[] = [
  {
    name: "Dana Reed",
    role: "VP Marketing, Northwind",
    ago: "2h ago",
    post: "We cut our content calendar in half and posted more. Counterintuitive, but it worked.",
  },
  {
    name: "Marcus Hale",
    role: "CRO, Beacon",
    ago: "5h ago",
    post: "Our reps all sound the same on LinkedIn. Is that a tooling problem or a people problem?",
  },
  {
    name: "Priya Nair",
    role: "Founder, Loop",
    ago: "1d ago",
    post: "AI writes my posts now. Engagement fell off a cliff. Anyone else?",
  },
];

const DRAFT =
  "It's a people problem wearing a tooling costume. When everyone runs the same script, the feed turns into an echo. Give reps a real point of view and the tool stops mattering — they just sound like themselves. That's the part that travels.";

export default function EngagePage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Engage"
        subtitle="Warm your target accounts. Tutti drafts the comment in your voice — you read it, you post it."
        action={<Badge variant="secondary">Cookie-free feed</Badge>}
      />

      {/* Compliance moat (§5.12) — neutral trust banner, NOT a warning color. */}
      <Alert className="mb-5">
        <Icon.lock size={18} color="var(--accent)" />
        <AlertTitle>Nothing sends itself</AlertTitle>
        <AlertDescription>
          The feed is built from cookie-free data — never your logged-in session. Every comment is a
          deliberate, human click. That&apos;s the compliance moat.
        </AlertDescription>
      </Alert>

      <div className="split-side">
        {/* LEFT — marked people, freshest first */}
        <Card className="px-5">
          <div className="flex items-baseline justify-between">
            <div className="eyebrow muted">Marked people · freshest first</div>
            <Badge variant="secondary">{MARKED.length} new</Badge>
          </div>

          <div className="flex flex-col">
            {MARKED.map((p, i) => (
              <div key={p.name}>
                {i > 0 && <ItemSeparator />}
                <Item className="border-transparent px-0">
                  <ItemMedia>
                    <Avatar name={p.name} size={40} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="flex flex-wrap items-baseline gap-2">
                      <span className="text-[14.5px] font-bold text-[var(--text-strong)]">{p.name}</span>
                      <span className="text-[13px] font-normal text-[var(--text-muted)]">{p.role}</span>
                      <span className="text-[13px] font-normal text-[var(--text-muted)]">· {p.ago}</span>
                    </ItemTitle>
                    <div className="mt-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--gray-50)] px-3.5 py-3 text-sm leading-relaxed text-[var(--text-body)]">
                      &ldquo;{p.post}&rdquo;
                    </div>
                    <div className="mt-3">
                      <Button size="sm">
                        <Icon.edit size={14} /> Draft a comment
                      </Button>
                    </div>
                  </ItemContent>
                </Item>
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT — drafted comment + why it works */}
        <div className="stack">
          <Card className="px-5">
            <div className="eyebrow mb-1">Drafted in your voice</div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <Avatar name="Maya Patel" size={32} />
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-[var(--text-strong)]">Maya Patel</div>
                <div className="text-xs text-[var(--text-muted)]">Replying to Marcus Hale · CRO, Beacon</div>
              </div>
              <Badge variant="secondary">
                <AnimatedNumber value={96} suffix="%" /> sounds like you
              </Badge>
            </div>

            {/* The one motion moment on Engage — per-word reveal, fires once. */}
            <TextEffect
              as="div"
              per="word"
              preset="fade-in-blur"
              className="rounded-[var(--radius-md)] bg-[var(--accent-soft)] px-4 py-3.5 text-[14.5px] leading-relaxed text-[var(--text-body)]"
            >
              {DRAFT}
            </TextEffect>

            {/* Sounds Flat gate passed — semantic green */}
            <div className="mt-3.5 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--green-100)] bg-[var(--green-50)] px-3.5 py-2.5">
              <Icon.check size={16} color="var(--green-600)" stroke={2.4} />
              <span className="text-[13px] font-semibold text-[var(--green-700)]">
                Sounds Flat passed — no AI tells.
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <Button size="sm">
                <Icon.copy size={14} /> Copy comment
              </Button>
              <Button size="sm" variant="ghost">
                <Icon.eye size={14} /> Open post
              </Button>
            </div>
          </Card>

          <Card className="px-5">
            <div className="eyebrow muted mb-2">Why this works</div>
            <p className="m-0 text-[13.5px] leading-relaxed text-[var(--text-muted)]">
              AI-sounding comments get algorithm-penalized. Yours passes the same Sounds Flat gate your posts do.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

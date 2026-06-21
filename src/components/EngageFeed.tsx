"use client";

import { useMemo, useState } from "react";
import { Avatar, Icon } from "@/components/ds";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EngageDraft } from "@/components/EngageDraft";

// The people you've marked to warm — a cookie-free read feed (never your logged-in session).
type Person = { name: string; role: string };
type FeedPost = {
  id: string;
  author: string;
  ago: string;
  body: string;
  likes: number;
  comments: number;
  voiceMatch: number;
  draft: string;
};

const PEOPLE: Person[] = [
  { name: "Dana Reed", role: "VP Marketing, Northwind" },
  { name: "Marcus Hale", role: "CRO, Beacon" },
  { name: "Priya Nair", role: "Founder, Loop" },
  { name: "Tom Okafor", role: "Head of Demand Gen, Vantage" },
  { name: "Elena Vasquez", role: "VP Brand, Cohort" },
  { name: "Sam Whitfield", role: "CEO, Tidewater" },
];

const FEED: FeedPost[] = [
  {
    id: "f1",
    author: "Marcus Hale",
    ago: "2h",
    body: "Our reps all sound the same on LinkedIn. Is that a tooling problem or a people problem?",
    likes: 84,
    comments: 23,
    voiceMatch: 96,
    draft:
      "It's a people problem wearing a tooling costume. When everyone runs the same script, the feed turns into an echo. Give reps a real point of view and the tool stops mattering — they just sound like themselves. That's the part that travels.",
  },
  {
    id: "f2",
    author: "Dana Reed",
    ago: "5h",
    body: "We cut our content calendar in half and posted more. Counterintuitive, but it worked. Fewer planned slots, more room to react to what's actually happening.",
    likes: 212,
    comments: 41,
    voiceMatch: 94,
    draft:
      "The calendar was never the point — the reps were. Half the slots, twice the reaction speed, and suddenly the posts have a pulse. We saw the same thing: the best post of the week is almost never the one that was scheduled.",
  },
  {
    id: "f3",
    author: "Priya Nair",
    ago: "1d",
    body: "AI writes my posts now. Engagement fell off a cliff. Anyone else seeing this?",
    likes: 156,
    comments: 67,
    voiceMatch: 95,
    draft:
      "The algorithm reads sameness as spam. The fix isn't more AI, it's more you — feed the tool your real takes and verbatim posts, then let it match your rhythm instead of inventing a generic one. The draft should sound like a Tuesday, not a press release.",
  },
  {
    id: "f4",
    author: "Tom Okafor",
    ago: "1d",
    body: "Hot take: most 'thought leadership' is just rephrased best practices with a stock photo. Where's the actual thought?",
    likes: 98,
    comments: 19,
    voiceMatch: 93,
    draft:
      "The thought is the part nobody can copy — your scar tissue. Best practices are table stakes; what you learned the hard way is the leadership. Lead with the thing you'd only say to a peer over coffee.",
  },
  {
    id: "f5",
    author: "Elena Vasquez",
    ago: "2d",
    body: "Spent the week reading our team's LinkedIn. Smart people, flat posts. The voice gets sanded off somewhere between the idea and the publish button.",
    likes: 134,
    comments: 28,
    voiceMatch: 95,
    draft:
      "That sanding happens at the 'make it on-brand' step. On-brand should mean shared beliefs, not identical sentences. Keep the brand DNA, keep each person's voice on top — the flat ones usually just had the texture edited out.",
  },
  {
    id: "f6",
    author: "Sam Whitfield",
    ago: "3d",
    body: "Founder-led content is the cheapest distribution we have and we keep underusing it. Note to self for Q3.",
    likes: 176,
    comments: 33,
    voiceMatch: 92,
    draft:
      "Cheapest and the highest trust — people follow people. The blocker is rarely time, it's the blank page. Capture the founder's real takes once, then the drafts come pre-loaded with their voice and it stops feeling like homework.",
  },
];

export function EngageFeed({ author }: { author: string }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(PEOPLE.map((p) => p.name)));
  const [openId, setOpenId] = useState<string | null>(null);

  const roleOf = useMemo(() => Object.fromEntries(PEOPLE.map((p) => [p.name, p.role])), []);
  const shown = FEED.filter((f) => selected.has(f.author));

  function toggle(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <div className="split-side">
      {/* LEFT — the people you follow, a selectable filter */}
      <Card className="px-5 self-start">
        <div className="flex items-baseline justify-between">
          <div className="eyebrow muted">People you&apos;re warming</div>
          <Badge variant="secondary">{selected.size}/{PEOPLE.length}</Badge>
        </div>
        <p className="mb-3 mt-1 text-[12.5px] leading-relaxed text-[var(--text-muted)]">
          Pick whose posts show in your feed.
        </p>
        <div className="flex flex-col gap-1.5">
          {PEOPLE.map((p) => {
            const on = selected.has(p.name);
            return (
              <button
                key={p.name}
                onClick={() => toggle(p.name)}
                aria-pressed={on}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition-colors"
                style={{
                  borderColor: on ? "var(--accent)" : "var(--line)",
                  background: on ? "var(--accent-soft)" : "transparent",
                }}
              >
                <Avatar name={p.name} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-[var(--text-strong)]">{p.name}</span>
                  <span className="block truncate text-[11.5px] text-[var(--text-muted)]">{p.role}</span>
                </span>
                <span
                  className="grid size-4 flex-none place-items-center rounded-full"
                  style={{ background: on ? "var(--accent)" : "transparent", border: on ? "none" : "1.5px solid var(--border-strong)" }}
                >
                  {on && <Icon.check size={11} color="#fff" stroke={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* RIGHT — the feed */}
      <div className="stack">
        {shown.length === 0 && (
          <Card className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
            No one selected. Pick a few people on the left to fill your feed.
          </Card>
        )}

        {shown.map((f) => (
          <Card key={f.id} className="px-5">
            {/* post header */}
            <div className="flex items-center gap-3">
              <Avatar name={f.author} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[14.5px] font-bold text-[var(--text-strong)]">{f.author}</div>
                <div className="text-[12.5px] text-[var(--text-muted)]">{roleOf[f.author]}</div>
              </div>
              <span className="text-[12.5px] text-[var(--text-muted)]">{f.ago} · 🌐</span>
            </div>

            {/* post body */}
            <p className="my-3.5 whitespace-pre-wrap text-[14.5px] leading-relaxed text-[var(--text-body)]">{f.body}</p>

            {/* reactions */}
            <div className="flex items-center gap-4 border-t border-[var(--border-subtle)] pt-2.5 text-[12.5px] text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5"><Icon.heart size={14} /> {f.likes}</span>
              <span className="inline-flex items-center gap-1.5"><Icon.engage size={14} /> {f.comments} comments</span>
              <Button
                size="sm"
                variant={openId === f.id ? "outline" : "default"}
                className="ml-auto"
                onClick={() => setOpenId(openId === f.id ? null : f.id)}
              >
                <Icon.edit size={14} /> {openId === f.id ? "Hide comment" : "Draft a comment"}
              </Button>
            </div>

            {/* inline suggested comment generator */}
            {openId === f.id && (
              <div className="mt-3.5">
                <EngageDraft
                  author={author}
                  replyingTo={`${f.author} · ${roleOf[f.author]}`}
                  voiceMatch={f.voiceMatch}
                  initialDraft={f.draft}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

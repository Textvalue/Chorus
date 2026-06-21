// Trending-content-analysis methodology — the analytical lens the Discover feature reasons with.
// Faithfully condensed from the repo's OWN seed taxonomies (so the app finally uses what it ships):
//   writing-guidelines/seed-data/hooks.json            — 12 emotional hook types, 5 hook rules, fold
//   writing-guidelines/seed-data/frameworks.json       — 13 copywriting frameworks
//   choir-backend-build-spec/rules-engines/linkedin-algorithm-rules.json
//        — format multipliers, ranking factors, suppression signals, timing, cadence
//   my-context-os/04-linkedin-content (content pillars + post types)
// Every number below is research-backed in those files. It is fed to the model as GROUND TRUTH so the
// analysis cites real figures (e.g. carousel 3.7-6.6x) instead of inventing precise-looking metrics.

import type { DiscoverResult } from "./schemas";

export const TRENDING_ANALYSIS_FRAMEWORK = `
# LINKEDIN TRENDING-CONTENT ANALYSIS FRAMEWORK
Use these REAL, research-backed numbers as ground truth. Do NOT invent other precise metrics
(no fabricated "3.2x vs median"); keep topic-specific judgements qualitative.

## Format performance (engagement multiplier vs plain text)
- Carousel / document — HIGHEST — 3.7-6.6x. Swiping increases dwell time.
- Formatted text (bold, bullets, whitespace) — HIGH — 2.1x vs unformatted.
- Text + image — HIGH — 2x vs text-only.
- Text-only — BASELINE — 1x. Still works with a strong hook.
- Video — DECLINING — reach down ~300% since 2023; subtitles non-negotiable, keep <60s.
- Poll — LOW — weak for brand building.
- External link in body — PENALIZED — ~-60% reach.

## Ranking factors (what the algorithm rewards, in order)
1. Dwell time — HIGHEST. 15.6% engagement at 61+ sec read vs 1.2% at 0-3 sec.
2. Comments (threaded) — 15x the weight of a like; 2nd-degree comments 2.6x 1st-degree.
3. Saves / bookmarks — high and rising ("a like means little, a save means everything").
4. Shares / reposts — reach new audiences.
5. Clicks (see-more, profile) — medium.
6. Likes — lowest signal.
Golden hour: the first 60-90 min decide 80%+ of total reach; speed of early engagement > volume.
Topic consistency: stay on 2-3 topics; pivoting resets distribution.

## 12 emotional hook types (tag every hook with exactly one)
inspiration · fear · curiosity · credibility · counter_narrative · counter_intuitive ·
eloquence · education · surprise · celebration · identity · faces.

## 5 rules every hook must pass + formatting
Valuable · Actionable · Efficient (ideal 6-8 words) · Enticing (open loop -> "see more") · Engaging.
The hook must be fully visible above the ~210-char "see more" fold. Use numbers; prefer "How I" over "How to".

## Copywriting frameworks (pick the ONE that fits the topic)
PAIPS — Problem -> Agitate -> Intrigue -> Paint future -> Solution (LinkedIn-native default).
PAS — Problem -> Agitate -> Solution (pain-point content).
BAB — Before -> After -> Bridge (transformation, case studies).
AIDA — Attention -> Interest -> Desire -> Action (launches, offers).
ACCA — Awareness -> Comprehension -> Conviction -> Action (thought leadership).
PASTOR — Problem -> Amplify -> Story -> Transformation -> Offer -> Response (long-form).
PPPP — Promise -> Picture -> Proof -> Push (authority / results).
PPF — Past -> Present -> Future (trend / journey posts).
FAB — Features -> Advantages -> Benefits (tool recommendations).

## 4 content pillars (tag every idea with exactly one)
Synthesis (a unique take) · Contrarian (challenge the consensus) · Access (share a resource / teardown) · Simplifying (make the complex simple).

## Suppression signals — what KILLS reach (surface the relevant ones under "avoid")
- Link in the body OR in comments -> ~-60% reach. Use "DM me" / "link in profile" instead.
- Engagement bait ("comment YES", "tag a friend") -> actively filtered.
- Posting twice in 24h -> -50% on both. Minimum 24h spacing (+120% visibility vs back-to-back).
- Hashtags: 6+ -> -5%; 1-3 -> +12.6% (optimal); 0 -> misses the lift.
- Editing within the first hour -> can reset distribution.
- Hook hidden below the ~210-char fold -> kills dwell time.
- No CTA -> up to -40% engagement; ending on a question -> +20-40%.

## Timing & cadence (B2B)
Best window: Tue-Thu 07:30-08:30 (recipient local time); secondary 12:00-13:00. 3-4 posts/week is the sweet spot.
`.trim();

// Grounded mock — the fallback when MOCK_GENERATION=1 or the live model call fails, so Discover
// never dead-ends. Richer than the old static template AND it uses the REAL algorithm multipliers.
export function mockDiscover(topic: string): DiscoverResult {
  const t = topic.replace(/\.$/, "").trim();
  return {
    topic: t,
    maturity: "hot",
    trend: `Sharp, first-person takes on ${t} are outrunning generic explainers`,
    summary: `The posts winning on ${t} right now aren't broad overviews — they're opinionated and specific, backing one point of view with a concrete example. "What is ${t}" explainers are saturated and earn almost no saves.`,
    formats: [
      { label: "Carousel / document", strength: "highest", multiplier: "3.7-6.6x", note: `A step-by-step ${t} breakdown — swiping drives dwell time, the #1 ranking signal.` },
      { label: "Formatted text", strength: "high", multiplier: "2.1x", note: "A contrarian take with bold + whitespace; built to pull comments." },
      { label: "Text + image", strength: "high", multiplier: "2x", note: "One chart or a before/after on a real result." },
      { label: "Text-only", strength: "baseline", multiplier: "1x", note: "Works with a strong hook, but a lower ceiling than the above." },
    ],
    hooks: [
      { text: `Everyone's wrong about ${t}.`, type: "counter_narrative", why: "Opens a loop against the consensus — peak curiosity, high comment rate." },
      { text: `I changed my mind on ${t}.`, type: "curiosity", why: "A first-person reversal earns the 'see more' click." },
      { text: `We tried ${t} for 90 days.`, type: "credibility", why: "Time + specificity signals real experience, not theory." },
    ],
    winning_structure: {
      framework: "PAIPS",
      rhythm: "Problem → Agitate → Intrigue → Paint the better future → Solution. One hard number; sentences under 12 words.",
      length: "Formatted text 900-1300 chars, or a 5-8 slide carousel. Keep the hook fully above the 210-char fold.",
    },
    avoid: [
      { what: `"What is ${t}?" explainers`, why: "Saturated — near-zero saves." },
      { what: "Any link in the post body", why: "~60% reach penalty. Put it in the first comment-free CTA or use 'DM me'." },
      { what: "6+ hashtags", why: "-5% reach; 1-3 is the optimal band." },
    ],
    algorithm: {
      best_time: "Tue-Thu, 7:30-8:30am (audience's local time).",
      cadence: "3-4 posts/week, at least 24h apart.",
      cta: "End on a question — adds 20-40% engagement.",
    },
    ideas: [
      { title: `The ${t} advice everyone repeats is wrong`, angle: "Open against the consensus, then the counter-example with one number.", pillar: "Contrarian", format: "formatted text", hook_type: "counter_narrative", tag: "Contrarian" },
      { title: `A 5-step ${t} playbook`, angle: "Turn it into a how-to carousel — the top-saving format for this topic.", pillar: "Access", format: "carousel", hook_type: "education", tag: "Carousel" },
      { title: `We tried ${t} for 90 days — here's the data`, angle: "Lead with the result, not the setup; one hard metric.", pillar: "Synthesis", format: "text + image", hook_type: "credibility", tag: "Data" },
      { title: `${t}, without the jargon`, angle: "Make the complex simple; one principle per line.", pillar: "Simplifying", format: "formatted text", hook_type: "education", tag: "How-to" },
      { title: `The part of ${t} nobody talks about`, angle: "Insider POV; one specific story, one lesson.", pillar: "Synthesis", format: "text-only", hook_type: "curiosity", tag: "Story" },
    ],
  };
}

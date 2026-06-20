# Tutti — the team content OS

> **Your team. In tune. Your brand. Heard everywhere.**
> *Alone we can do so little. Together we make music.*

Tutti turns a company's strategy and each person's real voice into on-brand content that plays
beautifully together — so a whole team sounds like one brand, while every post still sounds human.
The wedge is **harmony, not unison**: competitors push the *same* corporate post to every employee;
Tutti gives each person their instrument, tunes it to one score, and lets the whole team play.

The defensible part is **what you believe** (POV) + company context, not **how you sound**. Tutti
infers a draft POV at onboarding and lets normal use correct it — that correction loop is the moat.
The guiding rule, inherited by every screen: **off-key means the tool hasn't learned you yet — never
that your writing is bad.**

## The app

The shell is a workspace sidebar (the spark + lowercase `tutti` wordmark) over these surfaces:

**Make**
- **Studio** (`/studio`) — the daily home. Two jobs (*Create* / *Ideas*) plus the 60-second *Record a
  note* habit, over a progression dashboard (in-tune score, character progression, reach, ensemble).
- **Create** (`/create`) — pick a topic, generate a post grounded in real samples + true facts +
  ban-list. The deterministic **Sounds Flat** gate runs after generation and quietly regenerates on a
  fail (em-dash density, curly quotes, kill-words, banned phrases, structural tells).
- **Ideas** (`/ideas`) — Theme & Variations: expands beliefs + company pains into angle cards.
- **Riff** (`/riff`) — Improv: a freeform daily note that sharpens your voice *and* spawns ideas.

**Team**
- **Rehearsal** (`/rehearsal`) — drafts & approvals. Every edit is logged as a correction.
- **Ensemble** (`/ensemble`) — team roster, instruments, the unison alarm.
- **Campaigns** (`/campaigns`) — Tutti: one theme, a draft per member, each in their own voice.

**Brand**
- **The Score** (`/score`) — shared company strategy, owned by the bandleader.
- **Audience** (`/audience`) — weighted personas tied to weekly pains.
- **Tuning** (`/tuning`) — an in-app recap of onboarding.

**Reach**
- **Live** (`/live`) — publish (copy / export, never auto-post) and measure.
- **Engage** (`/engage`) — warm feed; in-voice comments, human-clicked sends.
- **Achievements** (`/achievements`) — XP, badges, streaks, the venue ladder.

Onboarding lives at `/onboarding/org` (research a company URL → verify the Score) and
`/onboarding/member` (a LinkedIn URL → captured voice DNA + inferred POV).

## Design system

The brand lives in [`design-system/`](design-system/) (tokens, components, a full UI kit, brand
assets). It's ported into the app as CSS variables + base styles in
[`src/app/globals.css`](src/app/globals.css) and React primitives in
[`src/components/ds.tsx`](src/components/ds.tsx). Navy ink keeps it B2B-credible; blue is the primary
action; **teal carries the musical / brand-soul moments, green signals "on key" / success / growth.**
Inter throughout, soft-rounded white cards, hairline borders, gentle navy-tinted shadows, and lightly
hand-drawn character illustrations as the emotional core.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4
- **Postgres** (`pg`, raw SQL — `db/schema.sql`) behind a drop-in store API (`src/lib/store.ts`).
  Four tables: `orgs`, `members`, `posts`, and `corrections` (the moat loop, queryable). Nested blobs
  (icp, brand_dna, voice_dna, expert_pov) are JSONB. Reads are scoped to the active org. Ships a tuned
  demo "Acme" ensemble via `src/lib/seed.ts` (`npm run db:seed`).
- LLM: OpenRouter via the Vercel AI SDK (`generateObject` + Zod). Haiku for drafts, Sonnet for
  extraction. Set `MOCK_GENERATION=1` (or just omit keys) to use the built-in mock drafter.
- [HarvestAPI](https://harvest-api.com) for LinkedIn posts, [Exa](https://exa.ai) for company research.

## Setup

```bash
cp .env.example .env   # set DATABASE_URL; optional: OPENROUTER_API_KEY, HARVEST_API_KEY, EXA_API_KEY
npm install
npm run db:migrate     # create tables
npm run db:seed        # load the Acme demo ensemble (npm run db:reset reloads it)
npm run dev            # http://localhost:3000  → redirects to /studio
```

Without keys, generation falls back to a clean on-voice mock so the Create flow never dead-ends, and
the seeded ensemble keeps every screen populated.

## Architecture notes

- **Team isolation** is modeled on `(org_id, member_id)`. The shared layer (org brand DNA / ICP) is
  edited by the owner; the private layer (voice / POV / corrections) is owned by each member.
- Generation is **verbatim-anchored**: the prompt inlines real prose samples, never an abstract voice
  description (`src/lib/prompt.ts`). The stable per-member prefix is cacheable.
- The progression, reach, ensemble, score, audience, campaigns, live, and engage surfaces are mocked
  UI (self-contained sample data) pending wiring — the generation / Sounds Flat / correction loop is
  real.

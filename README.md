# Chorus — Team Content OS

Company strategy + each person's real voice, captured with two URLs, turned into on-brand LinkedIn
posts that sound like them — shared across a team as one brand DNA, each post still human.

The defensible part is **what you believe** (POV) + company context, not **how you sound**. Chorus
infers a draft POV at onboarding and lets normal use correct it — that correction loop is the moat.

## Flow

1. **Org onboarding** (`/onboarding/org`) — enter a company website. Exa researches the site + web;
   OpenRouter extracts a structured ICP (pains with weekly triggers), positioning, competitors, and
   brand DNA. You confirm the pre-filled record.
2. **Member onboarding** (`/onboarding/member`) — enter a LinkedIn URL. HarvestAPI pulls the person's
   posts; we drop reposts and short posts, sort by engagement, and keep the top 3–5 as verbatim voice
   samples. Two OpenRouter passes extract **voice DNA** (HOW) and **expert POV** (WHAT, `inferred`).
3. **Create** (`/create`) — pick a topic, generate a post grounded in the real samples + true facts +
   ban-list. A deterministic **anti-slop sanitizer** runs after generation and auto-regenerates on a
   hard fail (em-dash density, curly quotes, kill-words, banned phrases, structural tells).
4. **Drafts** (`/drafts`) — approve / edit / reject. Every edit is diffed vs the generated body and
   appended to that member's `corrections` (the moat loop).
5. **Brain Dump** (`/brain-dump`) — freeform text spawns ideas AND sharpens/confirms the POV.
6. **Ideas** (`/ideas`) — expands beliefs/topics + company pains into angle cards, one click into Create.

## Stack

- Next.js (App Router) + TypeScript + Tailwind v4
- **No database** — file-based JSON store at `data/store.json` (`src/lib/store.ts`)
- LLM: OpenRouter via the Vercel AI SDK (`generateObject` + Zod). Haiku for drafts, Sonnet for extraction
- [HarvestAPI](https://harvest-api.com) for LinkedIn posts, [Exa](https://exa.ai) for company research

## Setup

```bash
cp .env.example .env   # fill in OPENROUTER_API_KEY, HARVEST_API_KEY, EXA_API_KEY
npm install
npm run dev            # http://localhost:3000
```

## Architecture notes

- **Team isolation** is modeled on `(org_id, member_id)`. Shared layer (org brand DNA / ICP) is edited
  by the owner; private layer (voice / POV / corrections) is owned by each member.
- Generation is **verbatim-anchored**: the prompt inlines the real prose samples, never an abstract
  voice description (`src/lib/prompt.ts`). The stable per-member prefix is cacheable.
- Cut from this MVP (per the build plan): warm feed / engagement, voice interview, auto-publish,
  cross-platform fan-out, competitor watch-loop, analytics, billing.

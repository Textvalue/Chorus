Team Content OS — MVP Build Plan
Team-native from day 1. 2-input onboarding. POV inferred-then-corrected. Generation grounded in real voice + real company context. Anti-slop gate non-negotiable.
Decided scope: onboard a team → generate on-voice posts that don't read like AI → brain dump / ideas → approval queue. Everything else (warm feed, engagement, publishing, cross-platform, voice interview) is cut.

1. The one-line wedge

Company strategy + each person's real voice, captured with two URLs, turned into on-brand LinkedIn posts that sound like them — shared across a team as one brand DNA, each post still human.
The defensible part is WHAT you believe (POV) + company context, not HOW you sound. Scraping posts only gives you HOW (the commodity half). So we infer a draft POV at onboarding and let normal use correct it — that correction loop is the moat. Start it day one.

2. Data model (team isolation is the riskiest invariant — design it first)
   Three layers. Every read/write keys on (org_id, member_id). Shared layer is org-level; private layer is per-member.

global_library   read-only seeds (hooks, frameworks, templates, anti-slop kill-list)
   │
ORG (shared)     one per team — company context + brand DNA
   │
MEMBER (private) one per person — voice + samples + POV + corrections
org {
  org_id, name, website,
  icp: {
    personas: [...],
    pains: [{ pain, weekly_trigger, severity }],   // weekly_trigger REQUIRED — it's the hook source + generic-filter
    anti_personas: [...]
  },
  positioning,
  competitors: [{ name, url, note }],              // data only — no watch-loop in MVP
  brand_dna: { voice_rules, narrative_atoms: { audience, problem, outcome, proof, offer } },
  owner_member_id                                  // owns/edits the shared layer (see §6)
}

member {
  member_id, org_id,                               // org_id = isolation key on every query
  linkedin_url,
  voice_dna: { traits, sentence_patterns, signature_terms, phrases_to_avoid },
  prose_samples: [ "<verbatim 150+ word post>", ... ],   // 3-5, the active ingredient
  expert_pov: { beliefs: [], topics: [], hot_takes: [], status: "inferred" | "confirmed" },
  corrections: []                                  // the moat loop — append on every edit/accept/reject
}

post {
  id, member_id, org_id,
  topic, angle, body,
  status: "draft" | "approved" | "rejected",
  edits: []                                        // diff vs generated → feeds corrections
}
Store as structured rows / markdown, not a vector DB — per-member corpus is tiny and fits one cacheable prompt.

3. Onboarding
   Company is done once per org. Each member only ever gives their LinkedIn URL. That makes teammate onboarding nearly one-click.
   3a. Org setup (first user only)
4. Enter company website..
5. Research agent (WebFetch + Exa/web search) → extract full ICP, pains (with weekly triggers), positioning, competitors → write org record..
6. User verifies the auto-filled record (the "60-second confirm" — show it pre-filled so it feels short, don't make them type it)..
   3b. Member setup (every user, including the first)
7. Enter LinkedIn profile URL..
8. GET /linkedin/profile-posts (HarvestAPI) → paginate a couple pages..
9. Filter: drop anything with repostId set (reposts ≠ their voice); drop content under ~150 words; sort remaining by engagement.likes + 2×comments..
10. Take top 3-5 as prose_samples..
11. Extraction pass A → voice_dna (HOW): traits, sentence patterns, signature terms, phrases-to-avoid..
12. Extraction pass B → expert_pov (WHAT, status: "inferred"): beliefs, recurring topics, hot takes pulled from the post corpus. Flagged in UI as "we guessed this from your posts — fix anything wrong.".
13. Foundations complete → dashboard..
    3c. Teammates
    Owner invites → teammate enters LinkedIn URL only → runs 3b → joins org under shared brand DNA.
    Gate: dashboard is locked until org exists AND the member's voice_dna + prose_samples are populated. (Assuming healthy profiles per your call — see §7 for the thin-profile fallback if you want a cheap safety net.)
14. Main dashboard (4 surfaces)
    Surface What it does Build cost     Create post Pick topic/angle → generate grounded in (brand_dna + voice_dna + prose_samples + pov) → anti-slop gate → draft core   Drafts Approval queue: edit / approve / reject. Every edit logged as a correction low   Brain dump Freeform text → processed → spawns ideas AND appends/corrects expert_pov low, high-leverage   Ideas Expand confirmed beliefs/topics → angle cards → one-click into Create low   Publishing boundary: generate → copy / export only. No auto-publish (no LinkedIn API obtainable in time). Don't build toward it.
15. Generation — the two rules that make it not-Taplio
16. Verbatim-anchored. Inline the 3-5 real prose_samples + a fixed TRUE-facts list + the anti-slop ban-list into the prompt. Do not generate against an abstract voice description — that's the documented path to "consultancy-register slop.".
17. Deterministic anti-slop sanitizer runs AFTER generation. Pure rules: em-dash density >1/para, curly quotes, kill-words, banned phrases, structural tells. On hard-fail → auto-regenerate with the violations injected into the next prompt. This is the cheapest highest-visibility "doesn't read like AI" moment — port it even in the minimal build..
    Cost: prompt-cache the stable per-member prefix (brand_dna + voice + samples + hooks) → ~10× cheaper + rate-limit-exempt. Haiku for drafts/variants, Sonnet/Opus only for the two extraction passes.
18. The team-from-day-1 risk (you picked the hard path — here's the MVP dodge)
    The dossier flags it UNSOLVED: whose corrections win when teammates disagree on the brand? MVP sidesteps it with a single ownership rule:

• Shared layer (org brand_dna / ICP) → edited only by owner_member_id (admin). One editor, no conflict..
• Private layer (voice / POV / corrections) → owned by each member. No one else writes it..
That gives you real multi-tenant team behavior (one brand, N distinct voices, one workspace) without solving distributed conflict resolution. State it as a deliberate v1 boundary. Multi-editor brand DNA + merge rules = v2.

7. Cold-start fallback (optional, cheap insurance)
   You said assume healthy profiles. If you want one guard: when <3 usable posts survive filtering, drop a 3-field micro-form (paste 1-2 posts OR answer "what do you believe about your space that others don't / what's a misconception in your market / what 3 topics do you want to be known for"). Skippable. ~30 min to build, prevents a dead onboarding.
8. Stack

• Frontend + auth: Next.js + Supabase (Postgres + RLS — RLS does your org_id isolation for free)..
• Logic: Claude API, prompt-cached per-member prefix..
• Jobs: Trigger.dev cron for the HarvestAPI pulls (don't block onboarding on the scrape — fire it, show a loader, extract when it lands)..
• Host: Vercel. Not Lovable Cloud for a multi-tenant app with API keys + crons (no SLA — balance/incident risk mid-demo)..

9. Build sequence (48h-shaped)
   Block Work     0-2h Schema + RLS isolation + frontend-design gate (pick ONE aesthetic — no Inter H1 / purple-gradient default)   2-6h Member onboarding: HarvestAPI pull → filter → 2 extraction passes → member record   6-10h Org onboarding: website → ICP/pain/competitor research agent → verify screen   10-20h Create-post generation (verbatim-anchored) + anti-slop sanitizer + drafts queue   20-28h Brain dump → POV enrichment + Ideas expansion   28-34h Team: invite flow, second member, prove two members → two visibly different on-voice drafts from one topic   34-40h Correction loop wiring (edits/accept/reject → corrections) + one happy-path E2E   40-46h Seed a demo team, rehearse the live flow 3×   46-48h Buffer   DONE = one continuous live loop: onboard org → onboard 2 members from URLs → one topic generates two human-sounding on-brand drafts → sanitizer hard-fails a generic one live → edit a draft → next draft for that member is measurably better.
10. Explicitly NOT in MVP
    Warm feed / marked-people / engagement (Pillars D+E) · auto-publish · cross-platform fan-out · competitor content watch-loop (keep competitor list as data only) · spoken/live voice interview · YouTube/podcast/newsletter ingestion · analytics dashboards · billing.

Open calls I made for you

• POV: inferred at onboarding, status:"inferred", corrected via brain dump + edits. (You were unsure — this keeps onboarding at 2 inputs and still builds the moat.).
• Generation unlock: always available post-onboarding; foundations gate guarantees voice is loaded, so no separate quality lock needed..
• Team conflict: owner-owns-shared, member-owns-private (§6)..

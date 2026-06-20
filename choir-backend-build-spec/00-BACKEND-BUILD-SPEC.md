---
title: Choir Backend Build Spec — Master Engineering Document
status: build-ready-with-gaps
created: 2026-06-20
layer_model: 3-layer (global_library / orgs / members)
read_first: true
---

# Choir Backend Build Spec — Master Engineering Document

> **Read this file first.** It is the index and the build order for the entire `backend-build-spec/` kit. Every detail below lives, verbatim and path:line-cited, in the artifact it points to. This document tells you what exists, how it fits, what to build first, and — honestly — what is NOT yet solved.

---

## 1. OVERVIEW

**What this kit is.** 21 engineer-ready artifacts (7 seed JSONs, 4 rules engines, 6 schema/spec files, 2 service specs, 2 gate specs, 1 prompt script, 1 integration spec) assembled by 17 extractors who read the Choir KB end-to-end and 3 critics who adversarially verified the result. Every artifact is grounded in real KB source files with `path:line` citations — this is an *extraction*, not a greenfield design. The machinery (generation service, deterministic sanitizer, state store, approval queue) is cloned near-verbatim from production code already running in this repo (`scripts/outbound/lib/*`, `scripts/lib/sanitize-copy.mjs`).

**The one-liner.** *LinkedIn is the wedge, not the ceiling — the context layer is platform-agnostic by design.* Choir is a multi-tenant content OS where a B2B team shares one brand DNA, each member sounds like themselves, and the defensible asset is **deep context (company + individual belief/voice) fed through a verbatim-anchored generator and a deterministic anti-slop gate**. [VERIFIED: `cross-platform-addendum.md:8,76`]

**The P0 demo loop** (the four-step thing a real teammate runs live — `DONE = one live loop on a real teammate`):

| Step | What happens | Load-bearing artifacts |
|------|--------------|------------------------|
| **1. Voice** | Two-stage onboarding: URL auto-prefills org ICP, then a belief/POV interview + 3-5 verbatim prose samples build the per-member voice model. Generation is GATED until voice + 2 samples + org brand DNA exist. | `prompts/voice-interview-scripts.md`, `schemas/data-model.md`, `schemas/multi-tenancy-spec.md` §2 (gate) |
| **2. Ideas** | Deep-context layer expands captured pains/wants/fears + beliefs into post angles; a deterministic strategy card (pillar/post-type/format/hook/framework/psychology) is approved before any draft. | `rules-engines/ideation-systems.md` (Engines 1-4) |
| **3. Compose + proof** | 3-layer verbatim-anchored generation (template + framework prompt + hook, anchored to real prose samples) → humanizer → **deterministic sanitizer hard-fail**. The visible "sounds like you / no AI tells" proof is the wedge surface. | `services/generation-service.md`, `gates/humanizer-spec.md`, `gates/sanitizer-spec.md`, all 7 `seed-data/*.json` |
| **4. Engage** | A cookie-free feed surfaces marked prospects' fresh posts; each is scored + verdict-gated; a matching comment/DM is drafted (through the same anti-slop gate) and copied to clipboard. | `rules-engines/feed-and-signals.md`, `rules-engines/qualification-scoring.md`, `schemas/feed-schema.sql`, `integrations/integration-spec.md` |

---

## 2. ARCHITECTURE AT A GLANCE

```
                          ┌──────────────────────────────────────────────────────────┐
                          │              MULTI-TENANT CONTEXT LAYER                    │
                          │  session bound to ONE org_id (immutable @ auth)            │
                          │  every read/write carries org_id → cross-org = 403 + RLS   │
                          │  (port pre-tool-guard.sh Check 1; multi-tenancy-spec §1)   │
                          └──────────────────────────────────────────────────────────┘
                                                   │
        ┌──────────────────────────────────────────┴───────────────────────────────────────────┐
        │                                  STATE STORE (SQLite, WAL, single file)                │
        │  global_library_* (read-only seed)  │  orgs/brand_dna/personas/pains/buying_signals    │
        │  members/voice_profiles/prose_samples/beliefs/expert_pov (org_id FK)                    │
        │  posts (draft→pending→approved→scheduled→published→rejected) │ engagement │ feed_*      │
        │  member_cadence_state │ trigger_catalog │ signal_cards   (services/state-store.md)      │
        └──────────────────────────────────────────────────────────────────────────────────────┘
            │                          │                         │                       │
            ▼                          ▼                         ▼                       ▼
  ┌──────────────────┐   ┌───────────────────────┐   ┌──────────────────┐   ┌───────────────────┐
  │ GENERATION SVC   │   │  GATES PIPELINE        │   │ RULES ENGINES    │   │ APPROVAL QUEUE    │
  │ clone of         │──▶│  generate              │   │ • algorithm/     │   │ filesystem-IS-    │
  │ claude-draft.mjs │   │   → seven sweeps       │   │   scheduling/    │   │ queue (MVP) →     │
  │ interpolate +    │   │   → critique (3-turn)  │   │   linter         │   │ DB status (v2)    │
  │ loadVoiceDna 12KB│   │   → humanizer (28 pat) │   │ • scoring/       │   │ ≥3/5 approve →    │
  │ + JSON extract   │   │   → SANITIZE hard-fail │   │   verdict/       │   │ auto-publish gate │
  │ L1→L4 prompt     │   │     (exit 1 loops back)│   │   DM-state       │   │ (build-review-    │
  │ assembly         │   │  sanitizeCopy(text,    │   │ • ideation/      │   │  page.mjs)        │
  │ verbatim-anchored│   │   {register})          │   │   strategy-card/ │   └───────────────────┘
  │ + caching +      │   │   →{pass,violations,   │   │   calendar/      │
  │ model routing    │   │      warnings,stats}   │   │   repurposing    │   ┌───────────────────┐
  │ (Haiku/Opus)     │   └───────────────────────┘   │ • feed/signals   │   │ INTEGRATIONS      │
  └──────────────────┘                               └──────────────────┘   │ cookie-free scrape│
                                                                             │ (feed, zero-ban)  │
                                                                             │ ││ Unipile OAuth   │
                                                                             │ (send only)       │
                                                                             │ Trigger.dev crons │
                                                                             │ visual-gen lanes  │
                                                                             └───────────────────┘
```

**Compliance invariant (lock first):** the feed is built ENTIRELY from cookie-free scraping (no logged-in session → zero ban risk). The user's LinkedIn session (Unipile OAuth) is reserved ONLY for deliberate engagement. The two pipelines never cross. [VERIFIED: `feature-map.json:332`; `integrations/integration-spec.md` §1]

---

## 3. ARTIFACT CATALOG

22 files under `backend-build-spec/` (the `find` output below), grouped by folder. Counts are from the manifests + independent re-verification.

### `seed-data/` — 7 JSON seeds (all `layer: global_library`, app-wide read-only)
| File | Purpose | Items |
|------|---------|-------|
| `hooks.json` | 72 verbatim hooks + 12 emotional types + 10 fill-in templates + 30 hook prompts + 34 headline formulas | 158 records (72 hooks) |
| `frameworks.json` | 13 copywriting frameworks (12 w/ verbatim LLM prompt) + 100 power words + DR Register Map | 13 frameworks |
| `body-templates.json` | 77 single-line body structural patterns (4 categories) + 5 full post templates A-E | 82 (77 + 5) |
| `cta-bank.json` | 18 CTA patterns (goal-mapped) + 4 comment-gating + 4 P.S. closers + 2 continuation-tease | 28 |
| `dm-templates.json` | 48 DM/connection templates (11 scenarios) + 6-step warm-up sequence + account-safety protocol | 54 |
| `comment-types.json` | 11 comment types (6 Alic + 5 Browne incl. Sidecar) + 9 deterministic linter rules | 24 |
| `anti-slop-killlist.json` | 70 kill-words + 28 banned phrases + 11 register-gated phrases + S1-S7 structural patterns | 109 (ground-truth from `parseAntiSlop()`) |

### `schemas/` — 6 files (the data model + DDL + enums)
| File | Purpose | Items |
|------|---------|-------|
| `data-model.md` | Canonical 3-layer context data model (org company-context + member voice/belief object), every field typed + source-cited | 27 tables/sections |
| `db-schema.sql` | Runnable SQLite DDL — 18 Choir tables across 3 layers + original outbound tables as reference comments | 18 tables |
| `dimension-enums.json` | All controlled vocabularies as named enum lists for CHECK constraints / lookup seeds | 36 enum groups |
| `feed-schema.sql` | Runnable SQLite DDL — 12 feed/trigger tables (trigger_catalog seeded, urgency windows, decay) | 12 tables |
| `multi-tenancy-spec.md` | Isolation invariant (ported from pre-tool-guard Check 1) + generation gate + RBAC + nested tenancy + the 2 unsolved gaps | 4 sections |
| *(`data-model.md` + `db-schema.sql` are the MASTER DATA MODEL pair — see §4)* | | |

### `services/` — 2 specs (the reference-build spine)
| File | Purpose | Items |
|------|---------|-------|
| `generation-service.md` | Function-by-function interface for the generation service (clone of `claude-draft.mjs`): interpolate, loadVoiceDna 12KB cap, JSON extractor, L1→L4 prompt assembly, caching, model routing | 8 functions |
| `state-store.md` | State-store + approval-queue spine (clone of `db.mjs` + `build-review-page.mjs`): connection lifecycle, draft→publish lifecycle, checkCircuitBreakers→checkPostingCadence | 6 sections |

### `gates/` — 2 specs (the moat — taste layer then deterministic floor)
| File | Purpose | Items |
|------|---------|-------|
| `humanizer-spec.md` | Taste layer: 28 humanizer patterns + LinkedIn rule-of-three carve-out + 13-category hostile-editor critique (3-turn state machine) + 5-characteristic forcing function | 28 patterns |
| `sanitizer-spec.md` | Deterministic floor: `sanitizeCopy(text,{register})→{pass,violations,warnings,stats}`, 6 checks, register-gating, S1-S5 regexes, 11 test vectors | 6 checks |

### `rules-engines/` — 4 files (deterministic routers + LLM-prompt engines)
| File | Purpose | Items |
|------|---------|-------|
| `linkedin-algorithm-rules.json` | Algorithm + scheduling + 13-check pre-publish linter, verbatim thresholds, 12 sections | 73 rule records |
| `qualification-scoring.md` | 4-component scoring rubric + 5-verdict taxonomy + 6-state DM machine + 6-category mention classifier | 5 deliverables |
| `ideation-systems.md` | 6 engines: 10 idea systems + Wants/Results/Fears expander + pillars/types + strategy-card router + calendar megaprompt + 14-method repurposing | 6 engines |
| `feed-and-signals.md` | Marked-people feed flow + news→angle engine + trigger catalog (9 categories, ~25 top triggers) | 6 sections |

### `integrations/` — 1 spec
| File | Purpose | Items |
|------|---------|-------|
| `integration-spec.md` | LinkedIn compliance architecture + 9-row scraper table + Trigger.dev patterns + STT + visual-gen pipeline + cost/model-routing + reusable-vs-net-new split | 112 citations, 9 sections |

### `prompts/` — 1 script
| File | Purpose | Items |
|------|---------|-------|
| `voice-interview-scripts.md` | Ship-ready onboarding: 18Q Expert-POV bank + 4-probe engine + Crawford/OBI gates + 6 synthesis schemas (member); ~45Q company intake (org); research-first URL prefill recipe | 18 questions |

---

## 4. MASTER DATA MODEL

**The 3-layer model** (the data invariant the whole product hangs on — `feature-map.json:327`):

```
global_library  →  orgs  →  members
(read-only seed)   (shared) (org_id FK)
```

- **`global_library_*`** — hooks, frameworks (+`llm_prompt`), templates, ctas, power_words, proven_posts, anti-slop. App-wide, read-only, NO `org_id` column, RLS-exempt. This is the seeded persuasion + anti-slop DB.
- **`orgs`** — one tenant per B2B team. Shared brand DNA, ICP, personas, pains, buying signals, competitors. Admin-owned.
- **`members`** — per-member voice profile (10-section), prose_samples (REQUIRED 3-5 @ 200-600w), beliefs/expert_pov. Every member row carries `org_id NOT NULL FK`.

**Authoritative artifacts:** `schemas/data-model.md` (the narrative model + ER diagram + field types) and `schemas/db-schema.sql` (the runnable DDL). Enums for CHECK constraints live in `schemas/dimension-enums.json`.

**Isolation invariant (INV-1..INV-4):** session is bound to one `org_id` at auth (immutable); every read/write carries `org_id`; cross-org access is rejected SERVER-SIDE at the query layer (Postgres RLS `USING`/`WITH CHECK` as the hard floor beneath app WHERE clauses); background jobs must set `app.current_org_id` from the job payload before any query. Ported from `pre-tool-guard.sh:173-217`. [VERIFIED: `multi-tenancy-spec.md` §1]

**The generation gate (the structural enforcement of depth):** refuse to generate unless `member_voice_profile` + `≥2 prose_samples (status='active')` + `org_brand_dna (status='approved')` are all loaded. Surface "Complete your voice interview" instead of degrading to generic output. HARD STOP, no description-only fallback. Ported from `pre-tool-guard.sh` Check 2.6. This is what makes the deep-context layer structural, not optional. [VERIFIED: `multi-tenancy-spec.md` §2]

> ✅ **Data-model coherence reconciled (2026-06-20) — G2-G5 closed.** The DATA-MODEL COHERENCE critic's **NOT-READY** findings on the schema pair are resolved: the two SQL files now co-load (db-schema.sql → feed-schema.sql), identity convention is unified on `orgs(org_id)`/`members(member_id)`, every seed JSON array + sub-array has a destination `global_library_*` table, seed shapes match columns, the multi-tenancy RLS/RBAC names match db-schema, and `posts.status` carries all 8 RBAC states. Verified loadable + seed-mappable against SQLite (22/22 seed tables green, FK-check clean). Full before/after: `schemas/RECONCILIATION-CHANGELOG.md`. **Still open:** G1 (per-member voice isolation — net-new design, §9 item 1) and the generation-gate `status` columns on `prose_samples`/`brand_dna` (see changelog Open Items).

---

## 5. SERVICE ARCHITECTURE

**Generation pipeline (L1→L4, stable→volatile prompt assembly, verbatim-anchored).** Clone of `scripts/outbound/lib/claude-draft.mjs`. `generateDraft({templatePath, ctx, voiceDnaPaths, callerScript, timeout})` → `{raw, json, parseError?}`. Prompt assembly order, mapped to the 3-layer model:

1. **L1 — anti-slop floor** (`global_library`): universal AI-tell constraints, always.
2. **L2-org — brand DNA** (`orgs`): brand voice + register.
3. **L2-member — member voice** (`members`): `{{VOICE_DNA}}` injection, each file capped at 12KB, labeled `## Voice DNA — <path>`.
4. **L3 — prose samples** (`members`): 3-5 verbatim 200-600w samples — *style transfer works from samples, not descriptions* (the Adpharm finding).
5. **L4 — task** (volatile, last): topic/belief/format/output-schema.

**Verbatim-anchoring rule (live-validated):** *"Abstract voice DNA produced consultancy-register slop. Inlining approved templates verbatim into prompts fixed it."* Every prompt = 3-5 verbatim examples + TRUE-facts list + ban-list + output schema — NOT abstract descriptions. [VERIFIED: `services/generation-service.md`; `autonomous-outbound-pattern.md:141-152`]

**Gates pipeline (sequential, must not intermix):**

```
generate → (seven sweeps) → critique (3-turn, visible) → humanizer (28 patterns) → SANITIZE (hard-fail, exit 1 loops back)
```

The **deterministic sanitizer** is the moat gate: `sanitizeCopy(text,{register}) → {pass, violations, warnings, stats}`, exit 0=clean / exit 1=hard-fail. It runtime-parses `anti-slop-universal.md` so the data never drifts from the gate (edit once). Hard-fails on em-dash density >1/para, curly quotes, ~70 kill-words, ~28 banned phrases, register-gated urgency CTAs (editorial only), and S1-S5 structural slop. Converts the ~5-15% prompt-only leak to ~0%. **It is portable AS-IS** — `sanitizeCopy(text,{antiSlop})` accepts a pre-parsed object and `parseAntiSlop(path)` accepts a path override, so Choir supplies the data source with zero edit to gate logic. [VERIFIED: `gates/sanitizer-spec.md`; P0-readiness critic re-ran it and confirmed 70/28/11 counts]

**State store + approval spine.** SQLite (better-sqlite3, WAL, single file, hand-written CREATE-IF-NOT-EXISTS, no migration tooling), cloned from `db.mjs`. Draft lifecycle: `draft → pending → approved → scheduled → published → rejected`. Approval handshake: `≥3 of 5` approve flips `auto_publish_enabled`. For MVP the **filesystem IS the queue** (`build-review-page.mjs` renders markdown drafts as cards); DB-backed status is the multi-user graduation. `checkCircuitBreakers` (3 breakers) is reshaped to `checkPostingCadence` (auto-publish gate / weekly-cap+24hr-spacing / engagement-floor with hysteresis). [VERIFIED: `services/state-store.md`]

**Caching + model routing.** Prompt-cache the stable per-user context block (cache read = 0.1× base input = 90% off, rate-limit-exempt; max 4 explicit breakpoints, order tools→system→messages). Route **Haiku** ($1/$5) for bulk/variant/triage/scoring; **Opus** ($5/$25) for final synthesis + voice extraction + critique; `--fallback-model sonnet` built into the wrapper. NOTE: the reference shells out to `claude -p` (Agent SDK credit pool); a multi-tenant web app should port the transport to the Anthropic SDK for clean per-request caching (a bounded ~1-2h port, not a research item). [VERIFIED: `services/generation-service.md`; `integrations/integration-spec.md` §6]

---

## 6. RULES ENGINES

**Algorithm / scheduling / linter** (`linkedin-algorithm-rules.json`, `global_library`). 73 deterministic rule records with verbatim numeric thresholds: dwell time = #1 ranking factor (15.6% @ 61s+ vs 1.2% @ 0-3s); comments 15× likes; external links (body or comments) = −60% reach; 6+ hashtags = −5%; missing CTA = up to −40%; 24h minimum spacing = HARD BLOCK (+120% visibility / −50% if violated); 3-4×/week cadence cap; Tue-Thu 07:30-08:30 best slot; Golden Hour first 60-90 min = ~80% of reach (6 T+ steps); carousel 3.7-6.6× reach. A 13-check pre-publish linter with regex/threshold/penalty/severity per check.

**Scoring / verdict / DM-state** (`qualification-scoring.md`). A 4-component rubric (Person Authority 0-10, Company Fit 0-10, signed Lock-In Risk −10 to +3, Buying Stage → net_score −10 to +28), a 12-branch ordered first-match verdict algorithm producing the 5-verdict taxonomy (PURSUE / PURSUE_NICHE / PURSUE_CHAMPION / NURTURE / DISQUALIFY) + a `displacement_difficulty` scalar, a 6-state DM conversation machine (warm_open / goal_reveal / tooling_invite / job_search / closed_off / no_reply) with transition-driven cache invalidation, and a 6-category mention classifier (evaluation_buying_intent / customer_feedback / competitive_mention / general_discussion / advocacy / question_help) with sentiment + intent routing. The rubric MATH is reusable; the lookup tables it indexes (vendor-tier map, served verticals, customer list) are domain-specific (TalentLyft HR/ATS) and must be re-seeded per org.

**Ideation / strategy-card / calendar / repurposing** (`ideation-systems.md`). 6 engines: (1) 10 idea systems + decision-matrix router with cold-start fallback to Pillar-to-Hook; (2) Wants/Results/Fears expander (3 buckets × 5 = 15 seeds → up to 75 angles; `post_idea = frustration + framework`); (3) 4 pillars (synthesis/access/contrarian/simplifying) × 10 post types matrix + reconciled weekly-mix allocator (1 promo / 1 resource / ≥3 value) + 30 visual types; (4) strategy-card router as coded decision tables (message-type→post-type, format-rule cascade, framework/hook/psychology selectors) + verbatim card format + persisted JSON schema + HARD GATE; (5) calendar megaprompt verbatim (4-week × 5-day table) + deterministic validators; (6) 14 repurposing methods with expected-lift labels (text→carousel 3×, video −300%), new-hook rule, 90-day cooldown, narrative 7×5 reuse matrix.

**Feed / signals** (`feed-and-signals.md`). The marked-people feed (two-table model: `feed_profiles` + `feed_posts`, dedup on URL, cookie-free scheduled scrape, golden-hour + urgency-window `feed_weight` formula, the never-reveal-you-saw-the-engagement copy rule); the news→angle engine (5-step pipeline, NOVEL/ACTION/KNOWN triage, decay/expiry windows — data breach 3-7d, funding 7-14d, leadership 30-60d — worked HR-tech signal-row format); and the trigger catalog (9 categories, ~25 top triggers including #74 account-level multi-thread, priority/quadrant/stack-rank/compound-bump model, urgency-window + angle-template inheritance, anonymous-review constraint #73). 65 market-signal files seeded as few-shot.

---

## 7. INTEGRATIONS

**Reusable-vs-net-new split** (`integrations/integration-spec.md`). REUSABLE (in KB, 9 assets): Exa + WebFetch (onboarding prefill + trend research), RapidAPI `realtime-linkedin-fresh-data` (fastest 48h feed source, ships MCP + copy-paste build prompt, ~10 min to prototype), Apify cookie-free actors (`supreme_coder/linkedin-post` $1/1K), Trigger.dev crons + `wait.forToken` approval, HeyReach read-side MCP, the SQLite state/circuit-breaker store, the generation wrapper, the sanitizer, the visual-gen scripts. NET-NEW (must build, 6 items): LinkedIn publishing/scheduling API, LinkedIn analytics ingestion, the real-time post-feed poller, STT (Whisper/Deepgram/AssemblyAI — named, zero code), the web-app/auth/seat-billing layer, the auto-regenerate-on-violation loop controller. HARD-DESCOPE: Figma (status:planned), Canva autofill (no API on Pro), live conversational voice agent, video.

**Compliance architecture (one paragraph).** Two risk categories, decoupled by invariant: the FEED is built entirely from **cookie-free scraping** (no logged-in session → zero ban risk; IP risk handled by proxy), and the user's LinkedIn session via **Unipile OAuth is reserved ONLY for deliberate engagement** (send). The two pipelines never cross — routing the feed through any session-based path (Apollo/Clay enrichment, PhantomBuster, Dux-Soup, browser automation, or Unipile-for-reading) is the ban vector and is on an explicit denylist. Engagement sends run under a server-side rate-limiter (Unipile hard caps: 100-150 messages/day, 30-50 InMails/day, 80-100 connection requests/day paid / ~5/mo free) with 5 behavioral anti-detection rules and HTTP 422/429/500 handling. [VERIFIED: `integration-spec.md` §1; `feature-map.json:332`]

---

## 8. BUILD SEQUENCE

Ordered. P0 first, mirroring `feature-map.json` priorities (`P0-demo-critical` → `P1-strong` → `P2-later`). Each step cites the artifact(s) to use.

### Phase 0 — Reconcile the data model (BLOCKING, do before any DB load)
Fix the two SQL files' identity-convention conflict and the four orphaned seeds. **This is the NOT-READY blocker — see §9 G1-G5.** Pick one identity convention (recommend `db-schema.sql`'s explicit `org_id`/`member_id`), make `feed-schema.sql` conform, add the missing global_library DDL for `body-templates`/`dm-templates`/`comment-types`/`interview_questions`, and reconcile seed shapes to columns. Artifacts: `schemas/db-schema.sql`, `schemas/feed-schema.sql`, `schemas/data-model.md`, `schemas/dimension-enums.json`.

### P0 — the demo loop
1. **Clone the generation service.** Copy `interpolate` / `loadVoiceDna` (12KB cap) / JSON extractor / `generateDraft`; keep `{{VOICE_DNA}}` injection. Use `services/generation-service.md`.
2. **Port the sanitizer as-is.** Wire `sanitizeCopy(text,{register})` AFTER generation; runtime-parse `anti-slop-universal.md`. Use `gates/sanitizer-spec.md` + `seed-data/anti-slop-killlist.json`. Pair with the humanizer (`gates/humanizer-spec.md`).
3. **Ship the voice interview + generation gate.** Render the Expert-POV bank + company intake; REQUIRE 3-5 prose samples; enforce the gate (voice + 2 samples + org brand DNA). Use `prompts/voice-interview-scripts.md` + `schemas/multi-tenancy-spec.md` §2. *For 48h, descope STT — accept pasted text / LinkedIn-post paste for samples.*
4. **Two-record schema (org + member) + global_library seed load.** Run `db-schema.sql`; load the 7 seed JSONs. Use `schemas/db-schema.sql` + all `seed-data/*.json` + `seed-data/README.md` for load order.
5. **Prompt-assembly L1→L4.** Wire the 3-layer prompt order + verbatim-anchoring + caching + Haiku/Opus routing. Use `services/generation-service.md` §6.
6. **Gates wired into the pipeline.** generate → critique → humanizer → sanitize hard-fail; build the auto-regenerate loop (cap 3, then manual review). Use `gates/*`.
7. **State store + approval queue spine.** Clone `db.mjs` + `build-review-page.mjs`; filesystem queue for MVP. Use `services/state-store.md`.
8. **Feed (P0 Engage step).** Lift the two-table schema; wire RapidAPI cookie-free scrape on a Trigger.dev cron; generate comment/DM through the sanitizer; **copy-to-clipboard, do NOT auto-send** (descope the Unipile send for the demo). Use `rules-engines/feed-and-signals.md` + `schemas/feed-schema.sql` + `rules-engines/qualification-scoring.md` + `integrations/integration-spec.md`.

### P1 — strong (post-demo, same spine)
Ideation engine + Wants/Results/Fears + Belief-to-Content map; strategy-card gate + calendar; scheduler defaults + Golden Hour + pre-publish linter; comment-style picker; per-prospect scoring + verdict-gated engagement; news→angle generator; multi-tenant org workspace + RBAC approval flow. Artifacts: `rules-engines/ideation-systems.md`, `rules-engines/linkedin-algorithm-rules.json`, `rules-engines/qualification-scoring.md`, `rules-engines/feed-and-signals.md`, `schemas/multi-tenancy-spec.md`.

### P2 — later
One→many repurposing engine; 20-min daily comment system + posting-time alarms; competitor reverse-engineering (Winning Content Profile); on-brand carousel/infographic generation. Artifacts: `rules-engines/ideation-systems.md` (Engine 6), `integrations/integration-spec.md` (§5 visual-gen).

---

## 9. OPEN GAPS / NET-NEW (ranked)

Consolidated from all 17 extractor `net_new_flags` + the 3 critics' HIGH findings + unresolved citations. **Ranked by build-blocking severity.**

| # | Gap | Severity | Source | Action |
|---|-----|----------|--------|--------|
| **1** | **Per-member voice isolation WITHIN one org is net-new and unsolved.** KB only ever isolates whole tenants — zero primitive for member-vs-member voice non-bleed inside one org. Needs a `member_id` RLS predicate + per-member vector-store namespace so member A's prose samples can't leak into member B's generation. This is **the deepest moat AND the riskiest architectural assumption** (no validated KB pattern). | **HIGH** | data-model.md §5 (GAP-A); multi-tenancy-spec §5; handoff "biggest hidden risk" | Not blocking for a SINGLE-teammate demo. Required the moment a 2nd member onboards (which the wedge requires). Implement per-member namespace + member RLS predicate + private-by-default visibility. Do NOT attempt conflict-resolution (GAP-B) in 48h. |
| **2** | **Data-model coherence: the two SQL files cannot co-load.** `db-schema.sql` uses `orgs(org_id)`/`members(member_id)`; `feed-schema.sql` uses `orgs(id)`/`members(id)`. Both `CREATE TABLE IF NOT EXISTS` → the second no-ops and its FKs target a non-existent column. CONFIRMED by direct read. | ✅ **RESOLVED 2026-06-20** | DATA-MODEL critic finding 1 (**NOT-READY** verdict) | DONE. feed-schema.sql stubs deleted; all FKs → `orgs(org_id)`/`members(member_id)`; loads AFTER db-schema.sql. Verified co-load (FK-check clean). See `schemas/RECONCILIATION-CHANGELOG.md` Decision 1. |
| **3** | **`feed_profiles` + `feed_posts` defined twice, incompatibly.** Different columns, different dedup keys (db-schema `UNIQUE(org_id,post_url)` vs feed-schema `url` UNIQUE globally — two orgs tracking the same public post collide; feed-schema's `feed_posts` also has NO `org_id`, breaking the isolation invariant). | ✅ **RESOLVED 2026-06-20** | DATA-MODEL critic finding 2 | DONE. feed-schema's richer versions are canonical (db-schema duplicates removed); scoring + classification columns merged in; `feed_posts` has `org_id NOT NULL` + `UNIQUE(org_id,url)`. Changelog Decision 2. |
| **4** | **Four seed JSONs have no destination table.** `body-templates.json`, `dm-templates.json`, `comment-types.json`, and the `interview_questions` seed (`data-model.md:334` lists it; `db-schema.sql` lacks it) — an engineer seeding from these has nowhere to put the rows. Also: hooks sub-arrays, DR register map, anti-slop kill-list, CTA sub-arrays. | ✅ **RESOLVED 2026-06-20** | DATA-MODEL critic finding 3 + missing_extractions | DONE. All `global_library_*` DDL added (incl. every sub-array + a `global_library_config` JSON catch-all). Verified: all 22 seed arrays load at exact counts. Changelog Decision 3. |
| **5** | **Seed shapes don't match DDL columns.** `hooks.json` emits `text`/`emotional_trigger` but `global_library_hooks` has `hook_text`/single `hook_type`; `cta-bank` emits `goal`/`subtype` but DDL has `cta_type`/no goal; `power_words` flat_list duplicates "Shocking" but DDL has `UNIQUE(word)` (rejects row 2 — key on `(word,category)`); string `id 'hook_001'` collides with INTEGER AUTOINCREMENT. RLS table names in multi-tenancy-spec (`member_voice_profiles`, `drafts`, `org_brand_dna`) don't match db-schema (`voice_profiles`, `posts`, `brand_dna`); `posts.status` CHECK lacks `changes_requested`/`archived` that the RBAC state machine needs. | ✅ **RESOLVED 2026-06-20** | DATA-MODEL critic findings 4-11 | DONE. Columns conformed to seeds (TEXT PKs, renamed/added cols); `UNIQUE(word,category)`; RLS/RBAC names → canonical; `posts.status` = 8 states; `dimension-enums.json post_status` added in sync. Changelog Decisions 4-8. **Residual:** generation-gate `status` columns on `prose_samples`/`brand_dna` still unbacked — see Changelog Open Items. |
| **6** | **P0 LinkedIn visible-proof surface is under-specified.** The critique-pass + 5-characteristic forcing function BOTH fire only for `{website-copy,landing,sales,substack-essay,long-form-personal}` and are SKIPPED for `social`/`linkedin-post`; the sanitizer runs DEFAULT register for LinkedIn (S1-S5 = advisory WARN, not hard-fail). So the demo's "no AI tells" proof degrades to humanizer pass + sanitizer code-detectable floor for the exact content it composes. | **HIGH** | P0-readiness critic finding 1 | Decide before build: either add `linkedin-post` to the critique-pass fire list, or define a LinkedIn-specific visible-proof view (sanitizer stats + voice-match readout). The prototype's "confidence strip" needs a defined data source. |
| **7** | **Voice-extraction prompt does not exist.** No artifact maps the interview/transcript + prose samples → the stored 10-section `member_voice_dna`. Flagged Opus-routed but net-new with no prompt. The "stored voice" leg the pre-validation gate hangs on is the least-specified step. | **HIGH** | P0-readiness critic finding 2; generation-service §6; data-model §5 | Author this prompt — the single highest-leverage missing artifact for P0. For 48h, gate generation on prose_samples present (defer transcript→voice_dna extraction). |
| **8** | **Auto-regenerate-on-violation loop is net-new with no retry cap.** On sanitizer exit-1, inject violations into the next prompt, cap retries (recommend 3), then fail to manual review. Three artifacts flag it; none specify the controller. | **MEDIUM** | generation-service §8; sanitizer-spec §6; humanizer-spec net-new #5 | Small explicit P0 task. Pick cap = 3, write it down. |
| **9** | **Engage step send + scrape both net-new.** The cookie-free RapidAPI scrape (feed input) and Unipile OAuth send (live loop completion) have no reference code. | **MEDIUM** | P0-readiness critic finding 3; integration-spec | Descope the send (copy-to-clipboard like posts). Budget the RapidAPI wire-up (~10 min) as the one Engage build task. |
| **10** | **Hooks shortfall: 72 of 141 materialized.** The 141-row Notion CSV was never exported to the KB; only the category-count table exists (documented in `hooks.json` `_meta`). The hook retrieval pool is at ~51% of the documented inventory. | **MEDIUM** | hooks extractor; COVERAGE critic finding (HIGH) | Acceptable for MVP IF told explicitly. Source the original CSV or generate ~69 net-new (using 30 prompts + 12 types + 11 categories as the grid) + human-review against the 5 hook rules. Do NOT silently fabricate. |
| **11** | **Two seed tables silently missing.** `12 lead-magnet types` has NO artifact anywhere (unflagged silent miss); `30 visual types` enumerated in prose at `ideation-systems.md` §3.6 but not materialized as a structured seed. | **MEDIUM** | COVERAGE critic findings | Add `lead-magnet-types.json` (sourced from lead-magnet-detective skill) + promote the §3.6 visual-types prose into a seed array, OR explicitly descope. |
| **12** | **Single→multi-player conflict resolution unsolved (GAP-B).** Whose corrections win when admin and member conflict on the same voice/brand attribute; 2nd-teammate onboarding without inheriting member#1 voice; divergence vs convergence of accumulated corrections. KB marks this OPEN with no validated pattern. | **MEDIUM** | data-model §5; multi-tenancy-spec §5 (GAP-B) | Out of P0 scope. Post-PMF design work — flag explicitly, do not attempt in 48h. |
| **13** | **86-post proven_posts not yet seeded.** Schema + indexes exist in `db-schema.sql`; the 86 rows (verified 43+43 via `csv.DictReader`, NEVER `wc -l`) are a load-from-source step. | **LOW** | COVERAGE critic finding | Day-1 seed-migration load. Don't forget it. |
| **14** | **PAIPS framework has no LLM prompt.** 12 of 13 frameworks carry verbatim prompts; PAIPS has only its 5-part structure. | **LOW** | frameworks extractor | Author a PAIPS prompt mirroring the other 12, or exclude PAIPS from the prompt-driven generator. Do NOT fabricate as KB-sourced. |
| **15** | **Net-new integrations the rules presuppose:** LinkedIn publishing/scheduling API, LinkedIn analytics ingestion (for the learning loop), per-format generation prompt templates (`post-linkedin.md` is the P0 template and doesn't exist), Anthropic SDK transport port, STT. | **LOW-MEDIUM** | algorithm/state-store/integration/generation extractors | Build per phase; `post-linkedin.md` is needed for P0 (currently only outbound signal-type templates exist). |
| **16** | **Interview→record unambiguities.** `[CORE]` tag mismatch (bank tags 7, prose says 6); `[ASYNC]` mismatch (16 tagged, prose says 12 — subset never enumerated); generic-answer probe-classifier threshold is net-new. | **LOW** | voice-interview extractor; P0-readiness critic | Make the product decisions now (cheap): render all 7 CORE + all 16 ASYNC; accept the authored probe-classifier as v1 seed. |

**Unresolved citations (informational, no data lost):** `scheduling/SKILL.md:15` and `engagement/SKILL.md:16-17` reference `resources/references/*.md` files that don't exist in-repo — data was pulled from the self-contained SKILL.md bodies instead. `context-os-architecture-synthesis.md:778-816` was cited for governance fields but actually contains the OPEN multiplayer gap; authority fields live in `client-workspace-standards.md:114-117` (used instead). The 141-hook CSV (item #10) is the one materially-missing source.

---

## 10. CRITIC VERDICTS (honest summary)

Three critics ran adversarial verification. The verdicts do not agree — and that disagreement is the most important thing on this page.

| Lens | Verdict | The honest read |
|------|---------|-----------------|
| **COVERAGE** (did every feature-map asset land in a real artifact, not a stub?) | **BUILD-READY-WITH-GAPS** | 22 artifacts written; all 9 pillars + 12 cross-cutting requirements addressed; 14 of 18 verified seed counts hit or exceeded their promise; spot-checks confirm REAL verbatim content. Three genuine gaps: 72/141 hooks, the unmaterialized 30 visual types, and the **silent miss** of the 12 lead-magnet types (no artifact, no flag). The 86-post corpus is genuinely 86 records (43+43, confirmed via `csv.DictReader`). |
| **DATA-MODEL COHERENCE** (can an engineer build a consistent DB from these files as-is?) | **NOT-READY** | **The blocking verdict — take it seriously.** The two SQL DDL files contradict each other on the foundational identity convention (`org_id`/`member_id` vs `id`/`id`), both use `CREATE TABLE IF NOT EXISTS` so they cannot co-load — a hard build break, CONFIRMED by direct read. `feed_profiles`/`feed_posts` defined twice with incompatible schemas + dedup keys. Four seed JSONs have no destination table. Seed shapes diverge from DDL columns across hooks/ctas/power_words. The 3-layer split is conceptually consistent everywhere but NOT consistently materialized. **This is Phase 0 — reconcile before any DB load (gaps G1-G5 / items 2-5 above).** |
| **P0 BUILD-READINESS** (walk the demo loop end-to-end — can it be built from these artifacts alone?) | **BUILD-READY-WITH-GAPS** | The four load-bearing machinery files (generation-service, sanitizer, state-store, interview/data-model) are genuinely build-ready — verified line-for-line against the real `claude-draft.mjs` and by re-running the sanitizer. The sanitizer is portable AS-IS. The blocking issues are at the SEAMS: (1) the COMPOSE "no AI tells" proof is routed OFF for `linkedin-post` (item 6); (2) the VOICE-SETUP voice-extraction prompt doesn't exist (item 7); (3) the ENGAGE scrape + send are net-new (item 9); (4) per-member voice isolation sits on the critical path the moment a 2nd teammate onboards (item 1). All four are honestly flagged, not hidden. |

**Net assessment:** the *machinery* is build-ready and largely cloned from working code; the *data model* is NOT (it needs a Phase 0 reconciliation pass before the first DB load); and the *demo's headline proof surface for LinkedIn* needs one explicit product decision before build. Item #1 (per-member voice isolation) is simultaneously the deepest moat and the riskiest unvalidated assumption — scope the live demo to a single teammate and treat the multiplayer isolation as the first post-demo build, not a P0 afterthought.

---

*Master spec assembled 2026-06-20 from 17 extractor manifests + 3 critic verdicts. Every count is from the seed manifests or independent re-verification (`find` / `python json` / direct `sed` read of the SQL conflict). Nothing was invented.*

# Choir — Integration, Compliance, Visual-Gen & Cost Architecture (Backend Build Spec)

> ENGINEER-READY spec. Every threshold, cost, enum, endpoint, and rate-limit below is extracted verbatim from the KB with `path:line` provenance. Build directly from this. Where something is NOT in the KB, it is flagged **NET-NEW**; where a working KB asset exists, it is flagged **REUSABLE**.
>
> **3-layer data model tagging:** `[global_library]` = app-wide read-only seed (every org sees it). `[orgs]` = shared per-tenant (brand DNA, ICP, personas). `[members]` = per-member (voice, prose samples, beliefs, `org_id` FK). Integration config (API keys, connected accounts, rate-limit state) is `[orgs]`-scoped unless noted.

---

## 0. TL;DR for the engineer (read this first)

1. **The feed NEVER touches a logged-in LinkedIn session.** Feed = cookie-free scraping only (RapidAPI / Apify). Zero account-ban risk because the user's account is never logged in. The user's LinkedIn session (via Unipile OAuth) is reserved EXCLUSIVELY for deliberate, human-clicked send actions (comment / DM / connection request). These are two physically separate code paths that must never converge. [SOURCE: `feature-map.json:332`, `2026-03-11-skool-linkedin-scraping-safety-model.md:36-40`]
2. **48h-fastest feed source = RapidAPI `realtime-linkedin-fresh-data`** (API Builderz). One call: company URLs + time window → company posts + employees + employee posts + engagers. Ships an MCP and a copy-paste build prompt. [SOURCE: `feature-map.json:204`, `rapidapi/README.md:69-83`, `linkedin-engagement-targeting-rapidapi.md:117-132`]
3. **Production feed source = Apify cookie-free actors** (`supreme_coder/linkedin-post` $1/1K posts; `harvestapi/*`). [SOURCE: `apify/README.md:90-99`]
4. **Send actions = Unipile OAuth**, server-side rate-limiter enforcing LinkedIn's documented safe limits. [SOURCE: `unipile/README.md:50-70, 520-540`]
5. **HeyReach is READ-ONLY** from the API: `/message/Send` returns 404. Do NOT design any auto-send through it. [SOURCE: `heyreach/README.md:111`]
6. **Scheduling/orchestration = Trigger.dev crons** (FETCH only) + `wait.forToken` for async approval (v2). MVP approval = filesystem/DB queue. [SOURCE: `feature-map.json:320, 334-335`, `trigger-dev/pipeline-operations.md:122-162`]
7. **STT (voice interview) = NET-NEW.** Whisper / Deepgram / AssemblyAI named, no integration code exists. [SOURCE: `feature-map.json:333`]
8. **Visual gen = Brand-DNA-as-prompt-modifier** (50-75 word paragraph) + 4 lanes, Nano-Banana-2 via Kie.ai ($0.04-0.09/img) or FAL ($0.08-0.16/img), regenerate-on-typo loop. [SOURCE: `static-ad-generation-pipeline.md:95-215`, `visual-generation/SKILL.md:50-51`]
9. **Cost: prompt-cache the stable per-user context block (90% read discount, rate-limit-exempt). Haiku for bulk/variants/feed-triage, Opus for final synthesis + voice extraction.** [SOURCE: `feature-map.json:331`, `claude-api-prompt-caching.md:59, 124-143, 175`]

---

## 1. LinkedIn Compliance Architecture (LOCK THIS FIRST)

> This is the product's defensibility moat AND its legal/safety floor. It is a hard architectural constraint, not a feature. Implement before anything else.
> [SOURCE: `feature-map.json:332` cross_cutting LINKEDIN COMPLIANCE ARCHITECTURE; `2026-03-11-skool-linkedin-scraping-safety-model.md`]

### 1.1 The two-scraping-risk-category model (the core insight)

| Category | Risk to user account | How it works | Examples |
|----------|---------------------|--------------|----------|
| **Cookie-free (SAFE)** | **Zero** — user account never involved | Pulls publicly available profile/post data WITHOUT logging into anyone's account. No session, no cookies, no account for LinkedIn to flag. Only risk is IP-level rate limiting, handled by the scraper's proxy rotation. | Apify actors (`harvestapi/linkedin-profile-scraper`, `supreme_coder/linkedin-post`), HarvestAPI direct, RapidAPI `realtime-linkedin-fresh-data` |
| **Session-based (RISKY)** | **High** — automation tied to logged-in session | Operates through a logged-in LinkedIn session. LinkedIn detects and flags automated activity on the account. | Apollo, Clay LinkedIn enrichment, browser extensions (PhantomBuster, Dux-Soup, Octopus CRM) |

[SOURCE: `2026-03-11-skool-linkedin-scraping-safety-model.md:30-33`]

### 1.2 Why cookie-free = zero account risk (the four facts)

1. The user's LinkedIn account is **never involved** — no login, no session, no cookies.
2. LinkedIn's enforcement targets automations tied to a **logged-in session**.
3. The only risk is at the **IP level** — the scraping vendor (Apify/RapidAPI) manages proxy rotation to handle this.
4. IP-level blocks are the vendor's problem, not the user's.

[SOURCE: `2026-03-11-skool-linkedin-scraping-safety-model.md:36-40`]

### 1.3 The decoupled-pipeline rule (architecture invariant)

Scraping MUST be decoupled from any account-bound action. Two independent pipelines:

```
FEED PIPELINE  (cookie-free, NO user session)
  marked profile URLs ──> cookie-free scraper ──> posts/profiles store ──> feed UI
                          (RapidAPI / Apify)        (two-table model)

SEND PIPELINE  (user's OAuth session, human-initiated ONLY)
  user clicks "comment"/"DM"/"connect" ──> server rate-limiter gate ──> Unipile OAuth send
```

If anything changes on the scraping side, the send pipeline does not break, and vice versa. [SOURCE: `2026-03-11-skool-linkedin-scraping-safety-model.md:46-50`]

### 1.4 BAN VECTORS — the feed must NEVER route through any of these

Hard rule: the feed (read/discovery) path must never use a session-based mechanism. Block these at code-review and at runtime (route guard):

- ❌ Apollo LinkedIn enrichment (session-based) [SOURCE: `2026-03-11-skool-linkedin-scraping-safety-model.md:33`, `apify/README.md:211`]
- ❌ Clay LinkedIn enrichment (session-based) [SOURCE: `2026-03-11-skool-linkedin-scraping-safety-model.md:33, 72`]
- ❌ Browser extensions / browser automation: PhantomBuster, Dux-Soup, Octopus CRM, Puppeteer, Playwright against a logged-in LinkedIn [SOURCE: `2026-03-11-skool-linkedin-scraping-safety-model.md:33`, `unipile/README.md:350, 473-477`]
- ❌ Unipile OAuth used for bulk/automated READING of the feed. Unipile is OAuth-compliant and fine for human-initiated sends, but routing the *feed* through any logged-in session re-introduces account risk. Reserve Unipile for deliberate engagement only. [SOURCE: `feature-map.json:332`, `unipile/README.md:310` ("No LinkedIn scraping: Unipile only accesses data via OAuth-compliant APIs")]

### 1.5 Send-side: Unipile OAuth reserved for deliberate, human-clicked actions

The user connects their LinkedIn via Unipile's hosted OAuth flow (Unipile handles OAuth, token refresh, provider scopes). Sends fire only on explicit user action in the UI. [SOURCE: `unipile/README.md:52, 163-174`]

**Server-side rate-limiter — enforce LinkedIn's documented safe daily limits as hard gates** (reject the send + queue, do not silently drop):

| Action | Safe daily limit | Standard | Sales Nav / Recruiter | Error if exceeded |
|--------|-----------------|----------|----------------------|-------------------|
| Messages to connections | **100-150/day** | N/A | N/A | HTTP 429/500 |
| InMails | **30-50/day** | sub-dependent | sub-dependent | HTTP 422/429 |
| Connection requests (paid) | **80-100/day** | 80-100/day | 80-100/day | HTTP 422 `cannot_resend_yet` |
| Connection requests (free) | **~5/month** (200 char note) | ~5/month | N/A | HTTP 422 |
| Profile retrieval | 1,000 (standard) / 2,500 (Sales Nav) | ~100/day | 2,500/day | HTTP 429 |
| Search results returned | N/A | 1,000 max | 2,500 max | (silent cap) |

[SOURCE: `unipile/README.md:65-70, 520-540`]

**Behavioral anti-detection rules to bake into the scheduler (NOT just volume caps):**

1. **Random spacing** — avoid fixed intervals (never "every hour at :00", never "8:00 AM daily").
2. **Working-hours distribution** — spread actions across business hours to emulate human behavior.
3. **Gradual ramp-up** — new accounts start low (LinkedIn: avoid accounts with <150 connections — triggers verification), increase slowly.
4. **Human patterns** — vary timing, avoid perfect consistency.
5. **Response monitoring** — if reply rates drop, auto-reduce volume.

[SOURCE: `unipile/README.md:531-535, 589-595`, `unipile/README.md:316` (new-account <150-conn verification risk)]

**Unipile error handling (the send pipeline must handle gracefully):**

- `HTTP 429` — provider rate limit exceeded (Unipile auto-queues/retries) [SOURCE: `unipile/README.md:201`]
- `HTTP 422` — LinkedIn limit exceeded, e.g. `cannot_resend_yet` for invitations [SOURCE: `unipile/README.md:202, 538`]
- `HTTP 500` — LinkedIn error, often rate-limit-related [SOURCE: `unipile/README.md:203`]

**Compliance note for the legal/positioning surface:** Unipile LinkedIn messaging is ToS-compliant (OAuth-based, not scraping) IF you (a) use real user accounts not fakes, (b) respect daily limits, (c) randomize spacing, (d) stay in working hours. Exceeding limits or using fake profiles violates ToS and risks bans regardless of Unipile. [SOURCE: `unipile/README.md:342-348`]

### 1.6 Generation gate is part of compliance (AI-comment penalty)

LinkedIn algorithmically penalizes AI-detectable comments. ALL generated comments must pass the same deterministic anti-slop gate as posts before the user can send via the Unipile path. [SOURCE: `feature-map.json:168, 174`] (Gate spec is in the separate `gates/` artifact; this integration spec only enforces the routing: generated comment → sanitize-copy hard-fail → only then enable the Unipile send button.)

---

## 2. Scraper Options Table — Fastest-to-Build vs Production

> All options below are cookie-free (feed-safe) UNLESS the row says otherwise. Config is `[orgs]`-scoped (API keys per tenant). Scraped output lands in the two-table feed model (profiles + posts, dedup on post URL). [SOURCE: `feature-map.json:196`]

| # | Source | Role | What one call returns | Cost | MCP? | Build speed | Notes |
|---|--------|------|----------------------|------|------|-------------|-------|
| 1 | **RapidAPI `realtime-linkedin-fresh-data`** (API Builderz) | **48h MVP feed** | Company posts in time window + all employees + all employee posts + everyone who liked/commented | Per-call (RapidAPI pricing, free trial) | **Yes** (ships MCP) | **Fastest** (~10 min to prototype) | Cookie-free. Copy-paste build prompt exists. Bulk version for high volume. `X-RapidAPI-Key` header auth. [SOURCE: `rapidapi/README.md:69-83, 109-118`, `linkedin-engagement-targeting-rapidapi.md:117-132, 167-175`] |
| 2 | **Apify `supreme_coder/linkedin-post`** | **Production post feed** | LinkedIn posts | **$1 / 1K posts** | via Apify MCP (manual-start, scope to actor) | Medium | Cookie-free. The named production feed source. [SOURCE: `apify/README.md:98`, `feature-map.json:205`] |
| 3 | **Apify `harvestapi/linkedin-profile-scraper`** | Production profile data | Profile data from URLs | CU-based | via Apify MCP | Medium | Primary LinkedIn scraper; "zero account risk". [SOURCE: `apify/README.md:94`] |
| 4 | **Apify `supreme_coder/linkedin-profile-scraper`** | Mass profile scrape | Profiles | **$3 / 1K profiles** | via Apify MCP | Medium | Cookie-free alternative. [SOURCE: `apify/README.md:97`] |
| 5 | **Apify `harvestapi/linkedin-company-employees`** | Employee extraction | Company employees | **$3-12 / 1K** ($3 basic, $8 full, $12 full+email) | via Apify MCP | Medium | Cookie-free. [SOURCE: `apify/README.md:95`] |
| 6 | **Apify `harvestapi/linkedin-profile-search`** | Profile discovery | Profiles via filters | **$0.10/search page + $0.004/profile** | via Apify MCP | Medium | No cookies. [SOURCE: `apify/README.md:96`] |
| 7 | **HarvestAPI direct** | Already-used enrichment | Full profile / post data | ~$0.012/post (≈$1.80/150 posts) | CLI (`linkedin-harvester/cli.mjs`) | Already wired | Cookie-free by design; used in social-intel-report enrichment. [SOURCE: `social-intel-report/README.md:124`, `2026-03-11-skool-linkedin-scraping-safety-model.md:70-71`] |
| 8 | **Unipile (OAuth)** | **SEND only** — NOT feed | N/A for feed | $55/mo base (10 accts) + $3-5.50/acct/mo | Node SDK / REST | n/a | OAuth-compliant. Reserve for deliberate sends. **Cannot scrape** (OAuth API only). [SOURCE: `unipile/README.md:52-70, 214-225, 310`] |
| 9 | **HeyReach (hosted MCP)** | **READ-ONLY** intel | conversations, lead details, lists, stats, network | Paid (agency-scaled) | Hosted MCP `https://mcp.heyreach.io/mcp` | n/a | **`/message/Send` returns 404 — write-side dead. Read-only. Manual paste into HeyReach UI for sends.** [SOURCE: `heyreach/README.md:110-111, 125`] |

### 2.1 RapidAPI feed — exact capabilities & build prompt

Given a list of LinkedIn company URLs + a time window, the endpoint:

1. Gets all company posts in that timeframe
2. Identifies all employees at that company
3. Gets all employee posts
4. Extracts everyone who liked or commented on those posts

[SOURCE: `rapidapi/README.md:77-82`, `linkedin-engagement-targeting-rapidapi.md:125-132`]

Vendor URL: `https://rapidapi.com/apibuilderz/api/realtime-linkedin-fresh-data`. Auth: `X-RapidAPI-Key` header. [SOURCE: `rapidapi/README.md:72, 111`]

Copy-paste build prompt (verbatim, adapt the title/size filters per org):

```
I want to use this endpoint to build a micro app where I can enter a comma
separated list of LinkedIn companies. I want you to:
1) Find all of the posts of the LinkedIn companies
2) Find all of the people that work at the company and find their posts
3) Pull all of the people that have liked and commented on the posts
   and filter for XYZ titles and company size
```

Then specify: title filters (e.g. VP Sales, CRO, Founder), company-size ranges, dedup logic, time-window filter. [SOURCE: `linkedin-engagement-targeting-rapidapi.md:167-182`]

### 2.2 RapidAPI vs Apify decision rule

| Dimension | RapidAPI | Apify |
|-----------|----------|-------|
| Best for | Specific known API endpoints | Complex multi-step scraping flows |
| Approach | One call → structured data | Actor navigates pages, paginates |
| Complexity | Low | Medium-High |
| Cost model | Per-call, predictable | Per-compute-unit, varies |

"Give me a problem and I'll tell you if it's a RapidAPI problem or an Apify problem." [SOURCE: `rapidapi/README.md:97-105`, `apify/README.md:219-225`]

### 2.3 Apify platform cost context (for budgeting the production feed)

1 Compute Unit (CU) = 1 GB RAM × 1 hour. Credits do NOT roll over. Tiers: Free $0 ($5 credit, $0.30/CU, 25 concurrent); Starter $29; Scale $199 ($0.25/CU, 128 concurrent); Business $999 ($0.20/CU). Apify MCP rate limit: 30 req/sec/user. [SOURCE: `apify/README.md:137-144, 201`]

### 2.4 Crucial Apify ban-vector exclusion list (do NOT use for the feed)

These Apify-adjacent / session tools are session-based and must not be wired into the feed: Apollo, Clay LinkedIn enrichment, PhantomBuster, Dux-Soup. Owned-account-only at most; never the product's feed. [SOURCE: `apify/README.md:211`]

---

## 3. Trigger.dev — Cron + `wait.forToken` Approval Patterns

> Trigger.dev does **FETCH only** in our stack; PROCESSING runs separately (locally via `claude -p` in KB; in Choir it's the Claude API generation service). Apply the same split: Trigger.dev schedules the feed scrape + scheduled publishing; the generation service is invoked from the job. [SOURCE: `trigger-dev/pipeline-operations.md:122-162`, CLAUDE.md INFRASTRUCTURE rule]

### 3.1 Cron pattern (FETCH-only, proven shape)

Every KB pipeline registers a `schedules.task()` with a cron expression and writes raw output to storage. Proven crons in the KB:

| Pipeline | Cron | Cadence |
|----------|------|---------|
| Fathom meeting fetch | `0 8 * * *` | daily 08:00 |
| YouTube channel fetch | `0 10 * * *` | daily 10:00 |
| LinkedIn profile-post fetch | (every 3 days) | scheduled |
| GitHub releases fetch | (every 2 days) | scheduled |
| Newsletter RSS fetch | (daily) | scheduled |

[SOURCE: `trigger-dev/pipeline-operations.md:142, 162, 128, 154, 122`]

**For Choir, map to:**

- `feed-fetch` cron — daily (or per-org configurable) cookie-free scrape of all marked profiles in the org → write to posts/profiles store. Cost target ~$1.50/seat/mo (see §6). [SOURCE: `feature-map.json:204, 334-335`]
- `scheduled-publish` cron — checks the post calendar, fires due posts through the publish path. **NOTE: actual LinkedIn publishing is NET-NEW (§7) — no posting API in KB.** [SOURCE: `feature-map.json:147, 333`]

**Gotcha (from KB):** a `const _`-prefixed task name does NOT prevent `schedules.task()` registration — the cloud task still registers and runs. To truly disable a scheduled task, remove it, don't underscore-prefix it. [SOURCE: `trigger-dev/pipeline-operations.md:122, 128, 142, 154`]

### 3.2 `wait.forToken` approval pattern (async human-in-the-loop)

The autonomous-outbound spine = generate draft → approval queue → push. Two implementations:

- **MVP (ship this in 48h): filesystem/DB queue.** One record per draft, `status: pending`; the user flips `status: approved | rejected`; a pusher acts on approved rows. The filesystem IS the queue for MVP. [SOURCE: `autonomous-outbound-pattern.md:97-108`, `feature-map.json:310, 319`]

```
generate ──> APPROVAL QUEUE (drafts/, frontmatter status: pending)
              user flips status: approved | rejected
                         │
                         ▼
              PUSHER acts on approved rows
```
[SOURCE: `autonomous-outbound-pattern.md:96-115`]

- **v2: Trigger.dev `wait.forToken` with `idempotencyKey`.** The job pauses at the approval step, emits a token; the approval UI resolves the token; the job resumes and publishes. Durable across multi-day waits (no timeout). `idempotencyKey` prevents double-publish on retry. [SOURCE: `feature-map.json:320` ("Trigger.dev wait.forToken async approval workflow with idempotencyKey"), `unipile/README.md:399-408` (Trigger.dev durable multi-day execution advantage)]

### 3.3 Circuit breakers (port from the autonomous-outbound SQLite spine)

State store: `trigger-state/outbound.db` (SQLite). Tables: `signals, contacts, drafts, sends, replies, circuit_breakers`. Circuit breakers enforce: **per-fetcher daily volume cap, per-sender daily cap, cost ceiling per cycle.** Reshape for Choir: `checkCircuitBreakers` → posting-cadence guard + the §1.5 send rate-limiter. [SOURCE: `autonomous-outbound-pattern.md:118-122`, `feature-map.json:319, 328`]

### 3.4 Async runtime / deploy shape

Agent-native stack: SQLite (better-sqlite3, WAL, single file) + Trigger.dev cron/webhook jobs + Claude for logic + a public URL ($4-10/mo). **48h demo:** Lovable Cloud frontend is acceptable for the demo ONLY — do NOT use for production (200+ incidents); post-hackathon migrate Lovable → GitHub → Vercel + Supabase. [SOURCE: `feature-map.json:335, 326`]

---

## 4. Speech-to-Text (Voice Interview Transcription) — NET-NEW

> The async voice-memo interview (belief/POV extraction, voice capture) records 2-3 min/question → transcribe → process. The transcription layer is **NET-NEW: tools are NAMED, no integration code exists in the KB.** [SOURCE: `feature-map.json:333` ("Speech-to-text (Whisper/Deepgram/AssemblyAI) ... tools named but no integration code"), `feature-map.json:33, 50` (async voice-memo → Whisper transcribe)]

| Provider | Status in KB | Build note |
|----------|--------------|------------|
| **OpenAI Whisper** | Named only | Batch/file transcription; self-host or API. No code in KB — net-new integration. |
| **Deepgram** | Named only | Streaming + batch; net-new integration. |
| **AssemblyAI** | Named only | Batch + speaker labels; net-new integration. |

**Scoping guardrail (hard rule from KB): do NOT build a live conversational voice agent in 48h.** The wrapper layer (pacing, interrupt timing, sub-second retrieval) is the real cost, not the model. Use **async record → transcribe** only. The live conversational interviewer (gpt-realtime-2) is explicitly v2. [SOURCE: `feature-map.json:337, 33`]

**Integration shape (net-new, to build):** UI records audio per question → upload to chosen STT provider → receive transcript → feed transcript into the existing generation/extraction service. Apply the "spoken-vs-written transform" on the transcript before voice-modeling (spoken cadence ≠ written voice). [SOURCE: `feature-map.json:33, 50`]

---

## 5. Visual-Gen Pipeline (Brand-DNA-as-Prompt-Modifier + Lanes + Regenerate-on-Typo)

> The whole pipeline keeps visuals on-brand by default via a Brand-DNA Prompt Modifier prepended to every image prompt. Build priority P2-later, effort high. [SOURCE: `feature-map.json:259-273`, `static-ad-generation-pipeline.md`]

### 5.1 Brand-DNA Prompt Modifier — the key artifact `[orgs]`

A **50-75 word paragraph** prepended to EVERY ad/image prompt to match the brand's visual identity. Includes exact colors (hex), font descriptions, photography direction, and mood. This is the single most important downstream-feeding output of brand research. [SOURCE: `static-ad-generation-pipeline.md:101`]

It is generated by the **screenshot-first extraction workflow** (`brand-theme` skill) with anti-hallucination guardrails:

- Extract from 3-5 screenshots (homepage, about, pricing, feature page). Pixels are source of truth; CSS gets overridden/compiled. [SOURCE: `brand-theme/SKILL.md:34-53`]
- **Confidence-score every token 0-5.** 5 = visual + CSS agree; 3 = strong screenshot evidence; 0 = unknown. [SOURCE: `brand-theme/SKILL.md:55-65`]
- **If confidence < 3 → mark `[NEEDS VERIFICATION]`, never invent.** Never invent hex values, never invent font names, never invent logo variants. Screenshots win over CSS on conflict. Source every token. [SOURCE: `brand-theme/SKILL.md:66-82`]

`[NEEDS VERIFICATION]` is stored as a first-class flag on the brand_dna record so the UI shows verified-vs-inferred. [SOURCE: `feature-map.json:261`, `brand-theme/SKILL.md:68-73`]

### 5.2 The four generation lanes + the editable lane

| Lane | Engine | When | Cost/img | Notes |
|------|--------|------|----------|-------|
| **1. Whiteboard / hand-drawn** | Gemini Nano Banana (Excalidraw style via Kie.ai `google/nano-banana`) | sketch/diagram aesthetic | **~$0.02-0.09** | Locked style prefix, 6 layout templates. [SOURCE: `visual-generation/SKILL.md:51`, `feature-map.json:261`] |
| **2. ChatGPT style-transfer** | GPT Image 2 | match an existing infographic's visual system on a new topic | (GPT Image 2 rate) | Extracts HEX + typography weights from a reference image, remixes layout. [SOURCE: `visual-generation/SKILL.md:128-134`, `feature-map.json:261`] |
| **3. Nano-Banana batch** | Nano Banana 2 (Gemini 3.1 Flash Image) via Kie.ai or FAL | batch on-brand ad/carousel/infographic | Kie **$0.04-0.09**; FAL **$0.08-0.16** | The main lane. Brand-DNA modifier + 5-block template. [SOURCE: `static-ad-generation-pipeline.md:188-215`, `visual-generation/SKILL.md:50`] |
| **4. Excalidraw diagrams** | Excalidraw | freeform/sketchy diagrams | local/$0 | Diagram lane (v2). [SOURCE: `feature-map.json:261, 271`] |
| **+ Canva template-fill (editable)** | Canva OAuth connector | editable carousel template | n/a | **Fill-only, NO autofill API on Pro** (Enterprise or own render engine for scale). Connector-fill only. [SOURCE: `feature-map.json:271, 333`] |

### 5.3 Nano Banana model family (pick the engine)

| Model | Technical name | Best for | Speed |
|-------|---------------|----------|-------|
| Nano Banana | Gemini 2.5 Flash Image | fast edits, style transfer, inpainting | fastest |
| Nano Banana Pro | Gemini 3 Pro Image | complex composition, text rendering, infographics, 4K | slowest |
| **Nano Banana 2 (DEFAULT)** | **Gemini 3.1 Flash Image** | **all-rounder — Pro quality at Flash speed** | **fast** |

Nano Banana 2 caps: 512px-4K, up to 5 characters consistent, up to 14 objects, precise text rendering, natural-language (mask-free) editing, multi-reference style match. All outputs carry SynthID watermark + C2PA Content Credentials. [SOURCE: `visual-generation/SKILL.md:26-44`]

### 5.4 FAL API: two endpoints + the product-reference routing

| Endpoint | Use | Key input |
|----------|-----|-----------|
| `fal-ai/nano-banana-2` | text-to-image (lifestyle/UGC/editorial, no product) | prompt, aspect_ratio, num_images, resolution |
| `fal-ai/nano-banana-2/edit` | product-reference generation | + `image_urls` (array, up to 14 reference images) |

**Routing flag per template:** `needs_product_images: true/false`. `true` → `/edit` with uploaded product images; `false` → text-to-image. Product-reference sweet spot = **1-3 images** (front, angle, lifestyle), even though `/edit` accepts 14. [SOURCE: `static-ad-generation-pipeline.md:122-126, 188-199, 230-232`]

Aspect ratios: auto, 21:9, 16:9, 3:2, 4:3, 5:4, 1:1, 4:5, 3:4, 2:3, 9:16. Resolutions: 0.5K, 1K, 2K, 4K (default 1K). Carousel target: **8-12 slides at 1080×1350** (or 5-slide structure: Hook / Value×3 / CTA). [SOURCE: `static-ad-generation-pipeline.md:195-197`, `feature-map.json:261`, `visual-generation/SKILL.md:430-447`]

### 5.5 The 5-block prompt template (prepend the Brand-DNA modifier to this)

```
BLOCK 1 — FORMAT & LAYOUT: type, dimensions, overall structure
BLOCK 2 — BRAND & COLOR: hex codes + texture words (e.g. "Bold navy #1B2A4A. Crisp teal #2EC4B6.")
BLOCK 3 — ZONE-BY-ZONE: each zone described independently (HEADER / CORE / INSIGHT / DECISION / FOOTER)
BLOCK 4 — ELEMENT DIFFERENTIATION: unique attributes per repeated element (Card 1 teal border + chart icon; Card 2 navy border + people icon)
BLOCK 5 — VIBE & FINISH: overall aesthetic direction
```
[SOURCE: `visual-generation/SKILL.md:104-124`, `feature-map.json:270` ("5-block prompt template + Brand-DNA prompt-modifier")]

### 5.6 Regenerate-on-typo loop (REQUIRED — AI lanes misspell text)

AI image lanes reliably misspell overlaid text. Build a regenerate loop:

1. Generate image with text overlay.
2. **Golden Rule: Edit, don't re-roll** — at 80% quality request specific adjustments, not full regen. [SOURCE: `visual-generation/SKILL.md:57-60`]
3. On detected typo / wrong text → regenerate that prompt (the AI lanes misspell — this is the explicit reason the loop exists). [SOURCE: `feature-map.json:270` ("Regenerate-on-typo loop (AI lanes misspell text)")]
4. Copy-refinement loop: review outputs, feed notes back, regenerate — Brand DNA + templates stay fixed, iterate copy/composition only. [SOURCE: `static-ad-generation-pipeline.md:273-274`]

### 5.7 Reusable repo assets for the visual lane

`scripts/generate_kie.py` and `scripts/lib/genspark-cli.mjs` are already in the repo (provider-pluggable image-gen). Reuse for the Kie.ai/FAL Nano-Banana-2 path. [SOURCE: `feature-map.json:270`]

---

## 6. Cost / Model-Routing Table

> Lock tools + model at session/job start for cache-hit consistency. Order the prompt stable→volatile so the cacheable prefix is contiguous. [SOURCE: `feature-map.json:331`, `claude-api-prompt-caching.md`]

### 6.1 Prompt caching — the central cost lever (90% read discount, rate-limit-exempt)

- Cache the **stable per-user context block** (ICP + voice model + hook library + brand DNA). First call pays full + write premium; every call within TTL reads at **0.1× base input price (90% off)**. [SOURCE: `claude-api-prompt-caching.md:59, 65, 140`, `feature-map.json:331`]
- **Cache hits do NOT count against rate limits** — dual win: cheaper + higher effective throughput. [SOURCE: `claude-api-prompt-caching.md:175`]
- **Automatic mode** for growing conversation prefixes; **explicit** (≤4 breakpoints, hierarchy tools→system→messages) when sections change at different rates. [SOURCE: `claude-api-prompt-caching.md:73-105`]
- **TTL:** default 5 min (refreshed free on each hit); 1-hour TTL = 2× write premium (use for sporadic-but-within-hour access). Longer-TTL blocks must precede shorter ones. [SOURCE: `claude-api-prompt-caching.md:148-169`]
- **Minimum cacheable tokens (below = no caching even if marked):** Opus 4.6/4.5 = 4,096; Sonnet 4.6 = 2,048; Sonnet 4.5/4 = 1,024; Haiku 4.5 = 4,096; Haiku 3 = 2,048. Short context blocks won't cache — keep the per-user block large enough. [SOURCE: `claude-api-prompt-caching.md:183-189`]
- **Invalidation rule:** any change to `tools` invalidates everything; system change invalidates system+messages. Keep tools + system prompt stable across generations. [SOURCE: `claude-api-prompt-caching.md:208-219`]
- **Cache isolation = workspace-level** (since 2026-02-05). Per-tenant workspaces won't share cache. [SOURCE: `claude-api-prompt-caching.md:233`]
- Track via `usage.cache_read_input_tokens` (cheap) vs `cache_creation_input_tokens` (1.25×/2×) vs `input_tokens` (full). Target high read:write ratio. [SOURCE: `claude-api-prompt-caching.md:241-257`]

### 6.2 Model routing (Haiku for bulk, Opus for final)

| Task | Model | Why |
|------|-------|-----|
| Bulk drafts, A/B variants, feed-triage classification, post-mention 6-category enum | **Haiku (cheap)** | High volume, mechanical | [SOURCE: `feature-map.json:331, 84, 220`] |
| Final post synthesis, voice-DNA extraction | **Opus** | Reasoning-heavy, quality-critical | [SOURCE: `feature-map.json:331`] |

### 6.3 Per-token model pricing (cache-aware, per million tokens)

| Model | Base input | Cache write 5min (1.25×) | Cache write 1hr (2×) | Cache read (0.1×) | Output |
|-------|-----------|--------------------------|----------------------|-------------------|--------|
| Opus 4.6 / 4.5 | $5 | $6.25 | $10 | **$0.50** | $25 |
| Sonnet 4.6 / 4.5 / 4 | $3 | $3.75 | $6 | **$0.30** | $15 |
| Haiku 4.5 | $1 | $1.25 | $2 | **$0.10** | $5 |
| Haiku 3 | $0.25 | $0.30 | $0.50 | **$0.03** | $1.25 |

[SOURCE: `claude-api-prompt-caching.md:127-135`]

### 6.4 Image-gen costs (per image)

| Engine / resolution | Cost |
|---------------------|------|
| Kie.ai Nano Banana 2 | **$0.04-0.09** |
| Kie.ai Excalidraw (`google/nano-banana`) | **$0.02-0.09** |
| FAL Nano Banana 2 — 1K | **~$0.08** |
| FAL Nano Banana 2 — 2K | **~$0.12** |
| FAL Nano Banana 2 — 4K | **~$0.16** |

Reference run economics: 5-template test = 20 imgs ≈ $2.40 @ 2K; full 40-template = 160 imgs ≈ $19.20 @ 2K. Gen time 10-30s/prompt; 4 imgs/prompt default; 2K = production sweet spot, 1K = iterate, 4K = hero only. [SOURCE: `static-ad-generation-pipeline.md:207-220`, `visual-generation/SKILL.md:50-51, 140-152`]

### 6.5 Feed scraping cost

- **Target: ~$1.50 / seat / month** for the marked-people feed scraping. [SOURCE: `feature-map.json:204, 331`]
- Production unit economics to budget against: `supreme_coder/linkedin-post` $1/1K posts; `supreme_coder/linkedin-profile-scraper` $3/1K profiles. [SOURCE: `apify/README.md:97-98`]
- Social-intel-report mood-board path: `--quick` mode (Exa only) = **$0**; full = ~$1.80-3.00/report (HarvestAPI $0.012/post). Use `--quick` for the demo. [SOURCE: `social-intel-report/README.md:118-127`, `feature-map.json:253`]

### 6.6 Connected-account cost (Unipile sends)

Unipile: $55/mo base (10 connected accounts) + tiered per-account: 1-50 = $5.50/acct; 51-200 = $5.00; 201-1,000 = $4.50; 1,001-5,000 = $4.00; 5,001+ = $3.50 (USD). Unlimited API calls, no per-message fees. Post-paid on peak simultaneous accounts. 7-day free trial. [SOURCE: `unipile/README.md:214-225, 234-236`]

---

## 7. REUSABLE-IN-KB vs NET-NEW-MUST-BUILD Split

> The authoritative split is the `cross_cutting_requirements` INTEGRATIONS entries. [SOURCE: `feature-map.json:333-334`]

### 7.1 REUSABLE / REFERENCE (working asset exists in KB)

| Capability | Asset | Reuse note |
|------------|-------|------------|
| Onboarding URL prefill + trend research | **Exa + WebFetch** | auto-start MCPs; used in icp-research + social-intel-report. [SOURCE: `feature-map.json:334`, `social-intel-report/README.md:90, 160-165`] |
| **Fastest 48h feed source** | **RapidAPI `realtime-linkedin-fresh-data`** (API Builderz) | ships MCP + copy-paste build prompt. [SOURCE: `feature-map.json:334`, `rapidapi/README.md:69-83`] |
| Production feed source | **Apify cookie-free actors** (`harvestapi`, `supreme_coder`) | cookie-free, costed. [SOURCE: `feature-map.json:334`, `apify/README.md:90-99`] |
| Scheduled feed-fetch + publishing orchestration + async approval | **Trigger.dev** crons + `wait.forToken` | FETCH-only pattern proven. [SOURCE: `feature-map.json:334`, `trigger-dev/pipeline-operations.md:122-162`] |
| Read-side LinkedIn intel | **HeyReach hosted MCP** (read-only) | `get-conversations / get-lead-details / get-all-lists / get-overall-stats / get-my-network-for-sender`. [SOURCE: `feature-map.json:334`, `heyreach/README.md:110`] |
| Compliant send | **Unipile OAuth** | OAuth-compliant LinkedIn messaging. [SOURCE: `unipile/README.md:50-70`] |
| Visual gen scripts | `scripts/generate_kie.py`, `scripts/lib/genspark-cli.mjs` | already in repo, provider-pluggable. [SOURCE: `feature-map.json:270`] |
| Generation/approval spine | `claude-draft.mjs`, `db.mjs`, `build-review-page.mjs` | clone almost verbatim. [SOURCE: `feature-map.json:310-322`] |
| Mood-board report | social-intel-report `--quick` ($0) | Exa-discovery → claude-p analyze → render. [SOURCE: `feature-map.json:253`, `social-intel-report/README.md:114`] |

### 7.2 NET-NEW — MUST BUILD (NOT in KB)

| # | Net-new capability | Why it's net-new | Build note |
|---|--------------------|------------------|-----------|
| 1 | **LinkedIn publishing / scheduling API** | KB has cadence/timing rules but **no posting pipeline** — there is no LinkedIn post-creation API anywhere in the KB. | Build the actual publish call (LinkedIn's own posting API or a compliant publishing path). [SOURCE: `feature-map.json:333, 147`] |
| 2 | **LinkedIn analytics ingestion** (likes/comments/impressions → state store, for the learning loop) | **No first-party export** exists in KB. | Ingest performance metrics back into the `engagement` table to close the loop. [SOURCE: `feature-map.json:333`] |
| 3 | **LinkedIn real-time post feed for marked people** | All KB sources **poll BY known profile URLs — no firehose/webhook for new POSTS.** | Poll cookie-free scrapers on a Trigger.dev schedule (no real-time push). [SOURCE: `feature-map.json:333, 196`] |
| 4 | **Speech-to-text** (Whisper / Deepgram / AssemblyAI) | tools **named but no integration code**. | Async record→transcribe only. See §4. [SOURCE: `feature-map.json:333`] |
| 5a | **Figma** | **NO working pipeline — `status: planned`. Do NOT promise.** | Descope. [SOURCE: `feature-map.json:333`] |
| 5b | **Canva** | OAuth-connector **fill-only; NO autofill API on Pro** (Enterprise or own render engine for scale). | Connector-fill lane only; no programmatic autofill at MVP. [SOURCE: `feature-map.json:333, 271`] |
| 6 | **Web-app / auth / seat-billing layer** | **No web-app/auth/seat-billing exists in KB.** | Lovable+Supabase or Replit for the 48h frontend+auth. [SOURCE: `feature-map.json:326`] |

### 7.3 Hard descopes (KB scoping guardrails — do NOT build)

- **No live conversational voice agent in 48h** (wrapper layer is the real cost). Use async record→transcribe. [SOURCE: `feature-map.json:337`]
- **No vector DB** — files + SQLite beat RAG at this scale (Karpathy 95% token reduction). [SOURCE: `feature-map.json:327, 337`]
- **No Figma promise.** [SOURCE: `feature-map.json:337`]
- **No video (Hyperframes)** — cost-prohibitive, unvalidated; explicitly v2. [SOURCE: `feature-map.json:337, 271`]

---

## 8. Compliance route-guard pseudocode (the one enforcement you cannot skip)

```
// FEED path — cookie-free only
function fetchFeed(orgId, profileUrls, window) {
  assert(SCRAPER in {RAPIDAPI_FRESH_DATA, APIFY_COOKIE_FREE, HARVESTAPI});  // allowlist
  assert(SCRAPER not in {APOLLO, CLAY_LINKEDIN, PHANTOMBUSTER, DUXSOUP,
                         UNIPILE /* for reading */, BROWSER_AUTOMATION});  // ban vectors §1.4
  // no user LinkedIn session token is ever read on this path
}

// SEND path — Unipile OAuth, human-initiated only
function sendEngagement(memberId, action /* comment|dm|connect */, payload) {
  assert(action.initiatedBy === 'human_click');          // never autonomous
  assert(sanitizeCopy(payload, {register}).pass === true); // §1.6 AI-comment gate
  rateLimiterGate(memberId, action);                      // §1.5 hard caps
  unipile.send(memberId, action, payload);               // OAuth session
}
```
[SOURCE: `feature-map.json:332`, `2026-03-11-skool-linkedin-scraping-safety-model.md:36-50`, `unipile/README.md:520-540`, `feature-map.json:174`]

---

*Provenance: every value above is cited `path:line`. Sources read end-to-end: `apify/README.md`, `unipile/README.md`, `2026-03-11-skool-linkedin-scraping-safety-model.md`, `autonomous-outbound-pattern.md`, `social-intel-report/README.md`, `static-ad-generation-pipeline.md`, `brand-theme/SKILL.md`, `visual-generation/SKILL.md`, `rapidapi/README.md`, `heyreach/README.md`, `claude-api-prompt-caching.md`, `trigger-dev/pipeline-operations.md`, `linkedin-engagement-targeting-rapidapi.md`, `feature-map.json`.*

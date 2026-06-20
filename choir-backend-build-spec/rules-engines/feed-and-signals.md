# Personal Feed + News→Angle Engine + Trigger Catalog — Engineer Build Spec (Choir)

> **Status:** implementable spec. Engineers build the backend directly from this.
> **Companion schema:** `../schemas/feed-schema.sql` (runnable SQLite DDL for the two-table feed model).
> **Companion seed:** the trigger catalog (`trigger_catalog` table) seeds from § 4 below; the worked HR-tech signal rows (§ 3.4) seed an org-scoped `signal_card` few-shot example set.
> **Sources (verbatim-traced):**
> - `my-context-os/02-outbound-systems/clay/analyze-influencer-post-engagement.md` — the two-table feed model (profiles + posts), dedup on Post URL
> - `my-context-os/02-outbound-systems/enrichment/linkedin-engagement-targeting-rapidapi.md:114-227` — cookie-free scrape flow, time-window input, custom dedup
> - `my-context-os/02-outbound-systems/clay/signal-company-news.md` — news→angle mapping, urgency triage, decay windows
> - `my-context-os/02-outbound-systems/enrichment/hr-tech-segment-signals-2026-05.md` — worked signal-row format (signal / date / source / expiry / angle)
> - `my-context-os/02-outbound-systems/enrichment/master-trigger-catalog.md` — 87-trigger catalog, 9 categories, urgency windows, prioritization matrix
> - `my-context-os/_evidence/market-signals/` — **65 dated market-signal evidence files** (Bash-verified count, 2026-06-20) → few-shot corpus for the angle generator

---

## 0. What This Is

Choir is a team content-OS for B2B SaaS GTM teams. This spec covers two of its always-on inputs that turn the outside world into *post ideas*:

1. **The Marked-People Feed** — a member marks people (peers, prospects, influencers, competitors' founders) whose LinkedIn activity they want to react to. Choir keeps a cookie-free, freshness-weighted feed of those people's posts so the member can fire off a timely comment or a piggyback post while the source post is still warm.
2. **The News→Angle Engine** — RSS / news signals for the org's tracked accounts and topics are pulled, triaged (NOVEL / ACTION / KNOWN), filtered against the member's deep-context (beliefs + ICP), and turned into **angle cards** with an explicit decay/expiry. An angle card is a post-idea pre-loaded with the situation, the angle, the persona, and the window.

The **trigger catalog** is the shared vocabulary both engines speak: each post / news item is classified to a trigger type, and the trigger type carries the urgency window + message angle template + best-persona that the angle card inherits.

### Data-layer split (Choir 3-layer model)

| Data | Layer | Why |
|------|-------|-----|
| `trigger_catalog` (the 87 triggers + urgency windows + angle templates) | **global_library** (app-wide, read-only seed) | The trigger taxonomy is universal GTM knowledge, not org-specific. |
| News→angle few-shot corpus (the 65 market-signal files; the 8 HR-tech worked rows) | **global_library** few-shot examples | Style/format reference for the LLM angle generator. |
| `feed_profiles` (who a member marks) + `feed_posts` (scraped posts) | **member** (`member_id` FK → `org_id` FK) | Each member curates their own watch-list; isolation by member. |
| `signal_cards` / angle cards (generated, account-scoped) | **org** (shared) — visible to all members, claimable | News fires on org's tracked accounts; any member can pick up the angle. |
| `tracked_accounts` / `tracked_topics` (what news to pull) | **org** | Account list + ICP topics are shared brand DNA. |

---

## 1. The Marked-People Feed

### 1.1 The two-table model (verbatim from the Clay influencer claybook)

The source claybook builds exactly this with two linked Clay tables, and the engineer port is a direct 1:1.
`[source: analyze-influencer-post-engagement.md:92-99]` — *"Template contains two linked tables: Influencers Table (Profile-level data) / Posts Table (Post-level engagement tracking)."*

| Choir table | Clay table it maps to | Grain | Source |
|-------------|----------------------|-------|--------|
| `feed_profiles` | Influencers Table | one row per marked person | `analyze-influencer-post-engagement.md:96-104` |
| `feed_posts` | Posts Table | one row per scraped post | `analyze-influencer-post-engagement.md:135-157` |

**Profile-level columns to collect** (from the claybook enrichment list, `analyze-influencer-post-engagement.md:107-133`): current follower count, follower growth rate, connection count, last 10-20 posts (configurable), post timestamps, post type (text / image / video / article share), post URLs, avg reactions per post, avg comments per post, overall engagement rate, engagement trend direction (increasing/decreasing), industry/specialization, profile headline, location, languages, profile completeness score.

**Post-level columns to collect** (from "What Gets Collected Per Post", `analyze-influencer-post-engagement.md:151-157`): post content/copy, publish date+time, reactions breakdown (`like, celebrate, support, love, insightful, curious` — the six LinkedIn reaction types, verbatim `:154`), comment count, share count (if available), engagement rate = `(reactions + comments) / follower_count` `[source: :157]`.

### 1.2 Dedup on Post URL (the load-bearing constraint)

**Post URL is the primary key for post-level dedup.** The claybook states it twice:
- `analyze-influencer-post-engagement.md:189` — *"Set primary key (Post URL recommended)"*
- `analyze-influencer-post-engagement.md:299` — *"Primary key: Post URL to prevent duplicates"*
- Data mapping: `:146` — *"Post URL → Primary identifier"*

Engineer rule: `feed_posts.url` carries a `UNIQUE` constraint; the scrape upsert is `INSERT ... ON CONFLICT(url) DO UPDATE` so re-scrapes refresh engagement counts on the existing row instead of duplicating. Update mode = **append new posts, update existing** `[source: :298]`.

> The RapidAPI playbook flags that the broader (any-company) scrape approach **"Must build custom deduplication logic"** `[source: linkedin-engagement-targeting-rapidapi.md:142]` — i.e. dedup is not free at the API layer, the app owns it. URL-uniqueness in `feed_posts` is that logic.

### 1.3 Cookie-free scheduled scrape

The feed must not require the member's LinkedIn cookie. The KB's cookie-free path is the RapidAPI / "LinkedIn public profile API" route, scraped from **public post data** on **scheduled intervals**.
`[source: analyze-influencer-post-engagement.md:282-291]` — *"Uses LinkedIn public profile API / Respects rate limits and scraping policies / Updates data on scheduled intervals / Scraped from public post data."*

The RapidAPI endpoint (vendor: API Builderz, `realtime-linkedin-fresh-data`, MCP-enabled, `linkedin-engagement-targeting-rapidapi.md:117-120`) takes **a LinkedIn profile/company URL + a time window** and returns posts in that window `[source: :125-130, :202-205]`. For Choir's marked-people feed the input is the per-profile tracked URL (not a company list), and the time window is "since `last_scraped_at`".

**Scrape job (per profile, scheduled):**
```
for each feed_profiles row where active = 1 and now() - last_scraped_at >= scrape_interval_minutes:
    posts = rapidapi.getPosts(profile.profile_url, since = last_scraped_at)   # public, cookie-free
    for p in posts:
        upsert feed_posts on conflict(url):                                   # dedup §1.2
            set engagement counts, scraped_at = now(), refreshed_count += 1
    profile.last_scraped_at = now()
```

**Setup-time note for product copy / expectations:** the underlying data is NOT real-time — *"Engagement data delays (not real-time)"* and updates run on the configured sync frequency `[source: analyze-influencer-post-engagement.md:360, :367-369]`. Default `scrape_interval_minutes` per profile: 60 (hourly), configurable per profile (claybook offers "real-time, hourly, daily" `:194`).

### 1.4 Freshness sorting + the first-60-minute weight

LinkedIn's Golden Hour (engagement in the first ~60 minutes after a post publishes disproportionately drives reach) is the reason the feed must surface freshly-published posts FIRST: a comment/piggyback in that window is worth more. The feed is therefore **freshness-sorted**, with the newest posts weighted up, and the weight decays as the post ages past the per-trigger urgency window.

**Feed weight function** (deterministic; compute at read time or on a recompute job):

```
freshness_minutes = now() - feed_posts.published_at      # in minutes

# Golden-hour boost: posts in their first 60 min get the top weight bucket
if freshness_minutes <= 60:        golden = 1.0
elif freshness_minutes <= 240:     golden = 0.7    # 1-4h: still same-day-warm
elif freshness_minutes <= 1440:    golden = 0.4    # 4-24h
else:                              golden = 0.15    # > 24h: stale for commenting

# Urgency-window factor: if the post is classified to a trigger, the trigger's
# urgency window (§4.4, in hours) sets how long the post stays actionable.
# Inside the window -> 1.0; decays linearly to 0 over one extra window-length past it.
uw = trigger_urgency_window_hours(feed_posts.trigger_id)   # NULL -> treat as 24h default
if uw is NULL: uw = 24
if freshness_minutes <= uw*60:                  urgency = 1.0
elif freshness_minutes <= 2*uw*60:              urgency = 1.0 - (freshness_minutes - uw*60) / (uw*60)
else:                                           urgency = 0.0

# Engagement signal: normalize the post's own engagement_rate against the
# profile's avg engagement_rate so a breakout post floats up.
eng = min(2.0, feed_posts.engagement_rate / NULLIF(feed_profiles.avg_engagement_rate, 0))

feed_weight = (0.55 * golden) + (0.30 * urgency) + (0.15 * (eng / 2.0))   # 0..1
```

**ORDER BY `feed_weight DESC, published_at DESC`.** The first-60-min bucket (`golden = 1.0`) dominates the default sort, which is the desired behavior: catch the post inside its golden hour. The urgency factor is what differentiates "a competitor's founder just posted a product-launch take" (long actionable window) from "someone reacted to a fast-decaying news event."

Persisted column: store `feed_weight` on `feed_posts` and recompute on scrape + on an hourly decay job so the API can sort without per-request math. Both the live formula and the stored value are kept (stored for sort, formula authoritative on recompute).

### 1.5 Critical messaging rule (carry into generated comment/post copy)

When a marked-person's engagement is the *targeting* reason, the generated comment/piggyback must NOT reveal the signal. The KB rule is absolute:
`[source: linkedin-engagement-targeting-rapidapi.md:105-109]` — *"DO NOT mention that you saw them like or comment on a post... The engagement signal is for YOUR targeting, not for your copy."*
Also `:234-238` (Do NOT: "Mention that you saw them like or comment on a post / Reference the specific post they engaged with"). The angle generator (§3) inherits this as a hard prompt constraint for feed-sourced copy.

---

## 2. Feed flow (end to end)

```
member marks a person  ──>  feed_profiles row (profile_url, member_id, org_id)
        │
        ▼
scheduled cookie-free scrape (per profile, default hourly)   [§1.3]
   RapidAPI public-post pull, time window = since last_scraped_at
        │
        ▼
upsert feed_posts  ON CONFLICT(url) DO UPDATE   (dedup on URL)   [§1.2]
        │
        ▼
classify each post to a trigger_id (optional; §4 catalog)  ── enables urgency window
        │
        ▼
compute feed_weight  (golden-hour + urgency-window + engagement)   [§1.4]
        │
        ▼
member feed = feed_posts ORDER BY feed_weight DESC, published_at DESC
        │
        ├──> "comment now" → generation engine (Chain A) with signal-hiding rule [§1.5]
        └──> "piggyback post" → angle card → post draft
```

---

## 3. The News→Angle Engine

### 3.1 The 5-step pipeline (mapped from the Clay news claybook)

The Clay "Monitor Company News" claybook is the reference pipeline. The Choir port keeps the five steps and swaps Clay/Claygent for the app's own fetch + LLM.
`[source: signal-company-news.md:74-81]`

| Step | Clay claybook | Choir port | Source |
|------|---------------|-----------|--------|
| 1 | Input company domains | `tracked_accounts` (org-scoped) feed the fetcher | `signal-company-news.md:76, 90-102` |
| 2 | Retrieve news mentions (Clay news+fundraising signals) | RSS / news fetch per account; capture: headline, source, publish date, URL, summary, category | `signal-company-news.md:77, 104-114` |
| 3 | Claygent filters by topic | LLM triage: NOVEL / ACTION / KNOWN + relevance-filter against deep-context | `signal-company-news.md:78, 116-138` |
| 4 | Locate senior contacts | inherit `best_persona` from the matched trigger (§4.4) | `signal-company-news.md:79, 139-151` |
| 5 | Generate personalized messages | angle card → post/comment draft via generation engine | `signal-company-news.md:80, 152-169` |

**Data captured per news item** (verbatim, `signal-company-news.md:108-114`): article headline, publication source, publication date, article URL, brief summary, mention category.

### 3.2 NOVEL / ACTION / KNOWN triage

The claybook's Step 3 is "the critical filtering step" `[source: signal-company-news.md:118]`. Claygent classifies news by relevance with a Yes/No + explanation prompt and the benefits are: *reduces noise, prioritizes by urgency, extracts key details, scores relevance* `[source: :133-137]`. Choir formalizes the triage into three buckets that drive routing:

| Bucket | Definition | Routing | Decay source |
|--------|-----------|---------|--------------|
| **NOVEL** | First-seen, genuinely new event for this account (no prior signal on the same theme in `signal_cards`). High differentiation. | Generate an angle card immediately; high priority. | Crisis windows: 3-7d; growth: 7-30d (§3.3) |
| **ACTION** | Event that forces a buyer/market decision with a hard clock (funding deployed within 90d, recall, leadership in first 90 days, ISO deadline). | Generate angle card; stamp `expires_at` from the trigger's urgency window. | Trigger urgency window (§4.4) |
| **KNOWN** | Re-coverage of an already-carded event, low-differentiation segment-wide pain, or a theme the member already posted about. | Suppress or downgrade to "background context" — do NOT generate a fresh card. | n/a (dedup) |

This maps directly to the claybook's own urgency tiers — **Crisis/Risk Signals (Highest Urgency)** vs **Growth (High Intent)** vs **Change (Medium)** vs **Market (Context)** `[source: signal-company-news.md:44-72]`. Crisis≈ACTION-now, Market≈KNOWN-background.

**Triage prompt contract** (Claygent pattern, `signal-company-news.md:122-131`): the claybook gives per-vertical Yes/No prompts (security / sales tools / HR tech). Choir's prompt is parameterized by the member's deep-context (beliefs + ICP topics) instead of a hardcoded vertical:
```
Given this news item {headline, summary, source, date} for account {account},
and this member's POV/beliefs + ICP topics {deep_context}:
1) Is this RELEVANT to something the member could credibly post about? (Yes/No + why)
2) Classify: NOVEL | ACTION | KNOWN (KNOWN if we already carded this theme for this account)
3) If ACTION, name the forced-decision clock.
4) Extract the 1-2 key details usable for a post angle.
Return strict JSON.
```

### 3.3 Decay / expiry model

Timing is the whole game: *"The window of opportunity is 7-30 days after news breaks"* `[source: signal-company-news.md:41]` and *"a 'congrats on the funding round' email 3 months after the announcement is lazy, not relevant"* `[source: master-trigger-catalog.md:250]`.

**Default decay windows by news type** (verbatim from the News-to-Outreach Mapping table, `signal-company-news.md:171-179`):

| News Type | Target Role | Message Angle | Window (Timing column) |
|-----------|-------------|---------------|------------------------|
| Data breach | CISO, CTO | Security posture, incident response | **3-7 days** |
| Funding | CRO, CMO, VP Sales | Growth infrastructure, scaling | **7-14 days** |
| Product launch | CMO, VP Marketing | Go-to-market, demand gen | **14-30 days** |
| Leadership change | New exec directly | Fresh perspective, new priorities | **30-60 days** |
| Expansion | CRO, VP Sales | Regional scaling, team growth | **14-30 days** |

Monitoring cadence by signal class (verbatim, `signal-company-news.md:208-211`): daily checks for crisis signals (breaches/outages), weekly for growth (funding/launches), monthly for leadership changes. Engineers: set the fetch schedule per `tracked_topic`/category accordingly.

**Engineer rule:** when an angle card is generated, set `expires_at = published_at + upper_bound(window)`. After `expires_at`, the card is hidden from the active queue (status `expired`) — it is "lazy, not relevant" past the window. The window's *lower* bound is the recommended earliest send (e.g. funding: wait until day 7, "After announcement buzz settles" `:220`); store both `actionable_from` and `expires_at`.

### 3.4 The worked signal-row format (HR-tech segment, the seed few-shot)

The HR-tech segment-signals file is the canonical **worked example** of a signal row: each carries signal / date / source (with primary-source URL) / expiry / and a ready outbound angle, ordered by weaponizability. This is the format the angle generator's few-shot examples use, and the file frontmatter models the decay metadata (`expires: 2026-08-31`, `last_validated: 2026-05-11`).
`[source: hr-tech-segment-signals-2026-05.md:46-124]`

The 8 rows verbatim (these seed an org-scoped `signal_card` few-shot set; structure = the column contract):

| # | Signal (event) | Date | Primary source | Angle (verbatim opener cue) | Weaponizability |
|---|----------------|------|----------------|------------------------------|-----------------|
| 1 | JazzHR Talent Fit AI disabled 14 days | Apr 21 → May 4, 2026 | `status.jazzhr.com` | "Two weeks without the AI scoring you're paying for" | Highest |
| 2 | Workable CEO admitted reporting broken "for some time" | Feb 26, 2026 | Yahoo Finance / Workable PR | "If you're on Workable Standard and your reporting still misses dimensions you need…" | High |
| 3 | Employ Inc. — 4 C-suite changes in 30 days (CEO/CRO/CFO/CTO) | Feb–Mar 2026 | LinkedIn announcements | segment-wide anchor for Employ-portfolio (JazzHR/Lever/Jobvite) customers expecting repricing | High |
| 4 | SAP closed on SmartRecruiters + SmartStart free tier killed | Sept 11, 2025 | SAP press release + Vendr benchmarks | "If your SmartRecruiters renewal landed under SAP after the September close…" | Med-High |
| 5 | Personio acquired Aurio AI + hit profitability Q1 2026 | Apr 29, 2026 | Personio press release | bolt-on-AI = defensive product strategy, not native advantage | Med |
| 6 | Greenhouse launched MCP (enterprise-only AI governance) | May 7, 2026 | Greenhouse blog | "If you're on Greenhouse mid-market and paying enterprise-tier for the new MCP governance layer…" | Med |
| 7 | Workable Agent launched (free upgrade, defensive) | Mar 13, 2026 | Workable blog | background context confirming segment is in defensive-AI scramble | Low-Med |
| 8 | AI mass-apply pain (segment-wide; 10% of Workable apps) | Jan 2026 | Workable CEO interview | universal pain anchor; use as Email-2 use-case when no per-vendor signal exists | Low (use as fallback) |

**Source-freshness rules to encode** (verbatim, `hr-tech-segment-signals-2026-05.md:102-106`): every signal carries a verification date; re-verify primary sources before any send; dated signals decay fast — *"Anything older than 60 days needs re-validation"*; AI-feature signals decay especially fast (weeks). → `signal_cards.last_validated`, a 60-day re-validation flag, and a faster flag for AI-feature categories.

### 3.5 Relevance-filter against deep-context

Before a card is shown to a member it is filtered against that member's deep-context (their beliefs/POV + the org's ICP). This is the difference between "news about an account" and "a post idea this specific member can credibly write." The triage prompt (§3.2 step 1) is the gate; KNOWN-suppression (§3.2) prevents the member being shown a theme they've already posted. The relevance score from Claygent's "Scores relevance to your solution" `[source: signal-company-news.md:137]` becomes `signal_cards.relevance_score`.

### 3.6 News→Angle flow (end to end)

```
tracked_accounts + tracked_topics (org)
        │
        ▼
RSS / news fetch  (cadence by category: crisis=daily, growth=weekly, leadership=monthly)  [§3.3]
   capture: headline, source, publish_date, url, summary, category   [§3.1 step 2]
        │
        ▼
LLM triage  NOVEL / ACTION / KNOWN  + relevance-filter vs deep-context (beliefs+ICP)   [§3.2,3.5]
        │
   KNOWN ──> suppress / background only
        │
   NOVEL / ACTION
        │
        ▼
classify to trigger_id (catalog §4)  ──> inherit best_persona + urgency window + angle template
        │
        ▼
angle card (signal_card row): situation + angle + persona + actionable_from + expires_at + relevance_score
        │
        ▼
generation engine (Chain A) → post/comment draft
        │
        ▼
decay job: now() > expires_at  ──> status = expired (hide from active queue)   [§3.3]
```

---

## 4. The Trigger Catalog (global_library seed)

### 4.1 Structure

87 B2B buying signals organized into **9 categories**, each trigger carrying: number, name, details, data sources, intent type. `[source: master-trigger-catalog.md:95, 108-348]` Some categories add verticals (Category 9). A separate **Urgency Windows & Message Angles** table (§4.4) attaches an urgency window + message-angle template + best-persona to ~14 core trigger types `[source: master-trigger-catalog.md:228-248, 365-373]`.

**The 9 categories** (verbatim names + counts):

| Cat | Name | Count | Source line |
|-----|------|-------|-------------|
| 1 | Hiring & Personnel | 12 | `:108` |
| 2 | Funding & Financial | 10 | `:125` |
| 3 | Technology & Digital | 10 | `:140` |
| 4 | Legal & Compliance | 4 | `:156` |
| 5 | Market & Competitive | 14 | `:165` |
| 6 | Sentiment & Reputation | 10 | `:184` |
| 7 | Operational | 9 | `:199` |
| 8 | Relationship & Re-Engagement | 7 | `:314` |
| 9 | Industry-Specific Regulatory & Certification | 5 | `:334` |

> **Source duplicate note** (verbatim `:213-215`): the source preserves several near-duplicate triggers (e.g. #4/#5 Executive Appointment, #33/#34 Legal). Seed them as-is but mark `is_near_duplicate = 1` and `dedupe_group` so the campaign UI treats a group as one. Net distinct count after collapsing near-dupes is < 87.

`trigger_catalog` seed table = `trigger_catalog` in `../schemas/feed-schema.sql`. Full 81-numbered set (Cats 1-9; the catalog numbers triggers 1-81 across the third-party + relationship + regulatory tables) is seedable verbatim from `master-trigger-catalog.md:112-346`. Below is the **schema + the highest-value ~25 triggers** required by the task; engineers seed the remaining rows directly from the source tables (no transformation needed — columns map 1:1).

### 4.2 Top triggers to seed first (the ~25 highest-value)

Selected by the catalog's own Priority Stack Rank (`:295-308`), Highest-Priority quadrant (`:286-293`), Category 8 "highest-converting" note (`:328`), and the Eric Nowoslawski practitioner list (`:405-424`).

**The single highest-value trigger flagged by the task — #74 Multi-Thread Engagement (account-level intent):**
`[source: master-trigger-catalog.md:324]`
> **#74 Multi-Thread Engagement** | Multiple contacts at the same account engage with your content, attend your events, or visit your website within a **14-day window** | Data sources: Marketing automation (HubSpot, Marketo), website visitor ID (RB2B, Instantly), event platforms | Intent type: **Account-level intent**

Why it tops the list for Choir specifically: it is the account-level rollup of exactly the per-person engagement the marked-people feed (§1) already captures. When ≥2 marked people at the same account post/engage inside 14 days, Choir can fire an account-level angle card — the feed produces the raw signal #74 needs.

| Catalog # | Trigger | Category | Intent Type | Why high-value | Source |
|-----------|---------|----------|-------------|----------------|--------|
| 74 | Multi-Thread Engagement (account-level) | 8 | Account-level intent | 14-day window; account rollup of feed signals | `:324` |
| 70 | Champion Job Change | 8 | Relationship | "highest-converting" — prior relationship + proven buying behavior | `:320, :328, :416` |
| 73 | Competitor Dissatisfaction Signal | 8 | Competitive | "looking for alternatives" — but see anonymous-review constraint §4.5 | `:323` |
| 71 | Contract Renewal Window | 8 | Lifecycle | 60-90 day forced re-eval window | `:321` |
| 72 | Stalled Deal Re-Activation | 8 | Re-engagement | dark deal + new trigger overlay | `:322` |
| 75 | Mutual Connection Warm Path | 8 | Relationship | warm intro path | `:325` |
| 76 | Closed-Lost Re-Engagement | 8 | Re-engagement | objection now resolved | `:326` |
| 13 | Investment Round | 2 | Growth | budget + growth mandate; Stack rank #5 | `:129, :303` |
| 43/44 | Competitor Activities / Product Launch | 5 | Competitive | competitor churn = Stack rank #1 | `:175-176, :299` |
| 1 | Recruitment Patterns (new titles) | 1 | Structural | hiring = Stack rank #2; deep-read JD technique §4.6 | `:112, :300` |
| 9 | Novel Role Creation | 1 | Structural | new role = forced build | `:120` |
| 4/5 | Executive Appointments | 1 | Decision-maker change | new exec eval window (Stack rank #4) | `:115-116, :302` |
| 10 | Contact Role Change | 1 | Relationship | mirrors Nowoslawski #2 (ICP contacts change roles) | `:121, :412` |
| 6/7 | Workforce Adjustments / Layoffs | 1 | Structural | distress/restructure | `:117-118` |
| 23/24 | Technology Adoption / New Tool | 3 | Tech evaluation | stack change = Stack rank #6 | `:144-145, :304` |
| 30b | Competitor Follower Overlap (X) | 3 | High intent | follows 2+ competitors = active category eval | `:152` |
| 31 | Cybersecurity Incidents | 3 | Risk | breach = highest urgency (3-7d) | `:153, :241` |
| 18 | Asset Liquidation / cost-cutting | 2 | Financial distress | efficiency mandate | `:134` |
| 61/62 | Corporate Restructuring / Merger (M&A) | 7 | Structural | 30-90d integration window | `:203-204, :245` |
| 65/66 | Event Participation | 7 | Engagement | 1-2wk before/after event | `:207-208, :244` |
| 50 | Product Announcements / Line Expansion | 5 | Growth | new GTM needs | `:182` |
| 78 | FDA 510(k) Submissions & Clearances | 9 | Compliance/Growth | public DB; forced scale-up clock | `:343` |
| 80 | Product Recalls & Safety Events | 9 | Risk/Pain | immediate (1wk); board-level | `:345` |
| 77 | ISO Audit/Certification Activity | 9 | Compliance | predictable 3-6mo pre-deadline window | `:342` |
| 81 | Engineering Hiring Surge | 9 | Structural/Growth | cluster of eng roles = greenlit project | `:346` |

### 4.3 Priority / prioritization model (deterministic — implementable)

When multiple triggers fire on one account, the catalog gives a 2x2 (Signal Strength × Urgency) and a stack rank.
`[source: master-trigger-catalog.md:254-310]`

**Quadrant → action** (verbatim, `:286-293`):

| Quadrant | Action | SLA |
|----------|--------|-----|
| Highest Priority (Strong × High) | Immediate outreach, best SDR, personalized within 48h | < 48h |
| Act Fast (Weak × High) | Outreach within 1 week, validate first | < 7d |
| Nurture (Strong × Low) | Add to trigger-specific sequence | sequence |
| Monitor (Weak × Low) | Log + enrich, don't interrupt | passive |

**Stack rank (deterministic tie-break, 1 = highest, verbatim `:297-308`):**
```
1 Competitor churn          6 Tech stack change
2 Hiring for target role    7 Content/social signals
3 First-party signals       8 Events/conferences
4 Leadership change (<60d)  9 Product launch
5 Funding round (<30d)      10 Awards/recognition
```

**Compound-trigger rule (verbatim `:310`):** if 2+ triggers fire on the same account within 30 days, **bump the account up one quadrant**. Three or more simultaneous triggers = **Highest Priority regardless of individual signal strength**. → store `compound_count` per account-window; apply the bump in the priority computation.

This is exactly how Choir turns the marked-people feed into account intent: N marked people at one account each producing a fresh post inside 14 days = compound signal → bump → highest-priority account angle card (and it satisfies #74's definition).

### 4.4 Urgency windows + angle templates (the angle-card inheritance source)

Each angle card inherits its window + message angle + best persona from the matched trigger. Verbatim from the two urgency tables (`master-trigger-catalog.md:232-248` core, `:367-373` Category 9):

| Trigger Type | Urgency Window | Message Angle (template, verbatim) | Best Persona |
|--------------|----------------|-------------------------------------|--------------|
| Hiring for target role | Within 1 week. Stale after 4 weeks. | "Hiring {{role}} usually means you're building the {{function}} engine. Here's what teams at your stage do first." | Hiring manager or their boss |
| Leadership change | Day 14-60 of new role | "Most new {{title}}s in the first 90 days need to [outcome]. Here's what we see working." | The new executive directly |
| New funding round | Within 2 weeks. Stale after 30 days. | "Post-{{round}}, most teams invest in [category] within 90 days. Here's what works." | CEO (Seed) / VP Sales-CRO (A+) / RevOps (B+) |
| Earnings/revenue event | 1-3 weeks after | Miss: "When the board is asking about pipeline, efficiency becomes the priority." Growth: "Scaling from $Xm to $Ym usually means outbound becomes a must-have." | CFO, CRO, VP Sales |
| Tech stack change | Within 2 weeks. Settles in 3-6 months. | "Teams migrating to {{newTool}} usually also rethink their {{category}} approach." | RevOps / VP Sales / CTO |
| Content publication | Within 48 hours | "Your [post] about {{topic}} resonated. We're seeing the same pattern across our clients." | The author directly |
| Regulatory/market change | 2-8 weeks after | "With {{change}}, most {{industry}} teams are rethinking {{category}}." | Compliance lead, GC, COO |
| Competitor churn | Immediate. Highest-urgency. Within 48 hours. | "Teams moving off {{competitor}} typically care most about {{differentiator}}." | Original purchase decision-maker |
| Product launch | 1-4 weeks after (not launch week) | "New product launches usually mean new audience, new pipeline targets. How's the GTM plan?" | VP Marketing / VP Sales / PMM |
| Award or recognition | Within 1-2 weeks | "Congrats on {{award}}. Companies at your trajectory usually need {{offer}} next." | CEO, CMO, recipient |
| Conference/event attendance | 1-2 weeks before, or within 1 week after | Before: "Ahead of {{event}}…" After: "Hope {{event}} was great. Based on the sessions…" | The attendee/speaker |
| M&A activity | 30-90 days post (integration phase) | "Post-acquisition teams usually need to consolidate tools and scale faster." | CTO, COO, VP Ops |
| ISO audit/certification | 3-6 months before deadline | "Companies preparing for ISO {{standard}} re-cert typically discover gaps in {{category}}." | Quality Director, VP Ops |
| FDA 510(k) clearance | Within 2-4 weeks of clearance | "Congrats on the {{device}} clearance. Teams scaling… usually need {{category}} within 90 days." | VP Regulatory, VP Engineering |
| Patent activity | 1-3 months after filing cluster | "Your recent patent activity in {{area}} suggests new product development." | VP Engineering, CTO, Dir R&D |
| Product recall | Immediate — within 1 week | "After a recall, teams need to overhaul {{process}} fast." | VP Quality, CEO, GC |
| Engineering hiring surge | Within 2 weeks of posting cluster | "Hiring {{N}} engineers usually means a major product push." | VP Engineering, COO |

**Encoding:** store window as `urgency_window_hours_min` / `urgency_window_hours_max` per trigger type (e.g. competitor churn = 0/48; funding = 0/336 [2wk] with `actionable_from` at 168h [day 7]; content publication = 0/48; leadership = 336/1440 [day14-60]). These convert the prose windows into the numbers `feed_weight` (§1.4) and `expires_at` (§3.3) consume. The "Message Angle" string is the `angle_template` the generation engine fills.

### 4.5 Data-source constraint to enforce (anti-overclaim)

**Anonymous review sites (G2 / Capterra / TrustRadius) are NOT usable for account-level targeting** — reviewer company is hidden. `[source: master-trigger-catalog.md:498-510]` Trigger #73 (Competitor Dissatisfaction) carries this caveat verbatim in its Details `:323`. Engineer rule: do not build #73 detection on those sites; viable substitutes are renewal-window (#71), public "switching from X to Y" LinkedIn/Reddit posts, job-posting language changes, and Trustpilot *business-profile* pages only `:504-510`. Store `account_attributable = 0` on any data source that is anonymized at source.

### 4.6 Hiring-signal deep-read (carry into the angle generator)

For hiring triggers (#1, #9, #81), the angle is not "you're hiring" — it is mined from the JD. Extract three layers: exec-level priorities, metrics that matter, internal language patterns `[source: master-trigger-catalog.md:444-450`]. The generator's hiring-angle prompt should mirror the deep-read worked example `:452-466` and the quick-extraction checklist `:478-488` (company / role / JD source → top-3 priorities / metrics / language to mirror / implied pain / angle). This is "10X ahead of everyone … 'let me add them to my hiring sequence'" `:468-470`.

---

## 5. The Few-Shot Corpus

`my-context-os/_evidence/market-signals/` contains **65 dated market-signal evidence files** (Bash-verified count `ls | wc -l` = 65, 2026-06-20). These are NOT read into this spec individually (per task instruction). They are the **global_library few-shot corpus** for the news→angle generator: each is a real, dated, sourced market-signal write-up (e.g. `2026-04-05-anthropic-growth-playbook.md`, `2026-04-17-salesforce-headless-360-announcement.md`). Engineers: load a rotating sample of these as few-shot examples so generated angle cards match the proven "signal + date + source + so-what angle" register. Pair with the 8 HR-tech worked rows (§3.4) which model the tabular signal-row format with explicit expiry.

---

## 6. Net-new for engineers (not in KB)

These are flagged for the manifest — needed by Choir but NOT specified in the source KB:

1. **The `feed_weight` golden-hour formula (§1.4)** — synthesized from the LinkedIn Golden-Hour concept + the catalog's urgency windows. The KB has the *windows* and the *first-60-min reach principle* separately; the combined weighting function is net-new (engineers should A/B the coefficients).
2. **NOVEL/ACTION/KNOWN as named enum buckets** — the KB has the urgency *tiers* (Crisis/Growth/Change/Market) and the Claygent Yes/No filter; the three-bucket routing-enum is a net-new formalization for the triage engine.
3. **RSS fetcher specifics** — the KB references "Clay's news and fundraising signals feature"; the actual RSS/news feed source + poller for Choir's own fetch is unspecified. Engineers choose the news API (the autonomous-outbound pipeline `scripts/outbound/*` is the in-house precedent pattern).
4. **`compound_count` windowing implementation** — the rule is verbatim (bump on 2+ within 30d) but the per-account sliding-window store is an engineering decision.
5. **Member↔org claim model for org-scoped angle cards** — "any member can pick up the angle" is a Choir product decision, not in the source claybooks (which are single-operator).

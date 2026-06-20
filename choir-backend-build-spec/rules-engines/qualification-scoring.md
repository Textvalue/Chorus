# Qualification Scoring + DM Conversation-State Engine — Backend Build Spec

> **Audience:** backend engineers building Choir. This is implementable logic, not narrative. Every threshold, point value, enum, and transition below is verbatim from the KB. Build directly from it.
>
> **What this engine does:** Given a prospect (LinkedIn profile + company enrichment + tech-stack + post history), it computes a deterministic 4-component score, resolves a 5-verdict taxonomy + a `displacement_difficulty` scalar, then drives a 6-state DM conversation machine whose transitions and recommended actions branch on the verdict. A separate 6-category classifier auto-tags inbound feed posts (brand mentions) for routing.
>
> **Sources (path:line):**
> - `my-context-os/02-outbound-systems/sequences/lead-qualification-framework.md` (scoring rubric, verdicts, displacement_difficulty, verdict algorithm, cache TTL, degradation)
> - `my-context-os/04-linkedin-content/engagement/linkedin-dm-conversation-state-framework.md` (6-state machine, signal extraction, permissioned ladder, message rules)
> - `my-context-os/04-linkedin-content/engagement/linkedin-dm-social-selling-playbook.md` (warm-up sequence, 3-step social selling, never-reveal rule, DM timing)
> - `my-context-os/02-outbound-systems/clay/signal-linkedin-brand-mentions.md` (6-category mention taxonomy, sentiment, intent, routing)

---

## 0. Data-Model Layer Mapping (Choir 3-layer split)

The engine reads from all three Choir layers. Tag inputs/outputs by layer so the seed migration and runtime queries are correct.

| Concern | Layer | Why |
|---|---|---|
| Scoring rubric (point values, thresholds, verdict algorithm) | `global_library` (read-only seed) | App-wide constants. Same math for every org until recalibrated. |
| 6-state machine definition (states, transitions, default actions) | `global_library` (read-only seed) | Shared state machine. |
| 6-category mention taxonomy enum + sub-patterns | `global_library` (read-only seed) | Classifier vocabulary. |
| Permissioned ladder / message rules / warm-up sequence | `global_library` (read-only seed) | Engagement doctrine, reusable. |
| Calibration overrides (company-size sweet spot, served verticals, home-market geography, ATS vendor map, customer list for boomerang) | `orgs` | Per-CLAUDE recalibration is per-client, not per-prospect (`lead-qualification-framework.md:404-413`). |
| Customer list for boomerang detection | `orgs` | Org-specific customer roster. |
| Per-prospect qualification result (scores, verdict, displacement_difficulty, cached signals) | `members` (org_id FK) + per-thread cache | Owned by the member running the thread; cached at thread granularity. |
| Conversation state per thread, extracted signals, message history | `members` (org_id FK) | Per-member, per-thread. |

> **Calibration note** (`lead-qualification-framework.md:404-413`): the rubric below ships calibrated against TalentLyft (HR/TA, 6 verticals, 200–1000 employee sweet spot). The point values are global constants; the *lookup tables they index* (company-size bands, vertical lists, geography weights, ATS vendor tiers, customer list) are `orgs`-layer overrides. Build the rubric to read these tables from the org config, defaulting to the TalentLyft seed values.

---

## 1. The 4-Component Scoring Rubric

Source: `lead-qualification-framework.md:105-154`. Four component scores feed a composite Net Score. Resolve each component as the sum of its sub-criteria, then apply caps (Amazon Germany Problem, freelancer override) BEFORE combining.

### 1.1 Person Authority Score (0–10)

Source `lead-qualification-framework.md:107-117`. `layer: global_library` (point values); `orgs` (customer list for boomerang sub-criterion).

| Sub-criterion | Range | Scoring logic (deterministic) |
|---|---|---|
| `title_decisiveness` | 0–4 | 4 = CHRO, CPO, VP People, Head of Talent, Head of HR, Founder. 3 = Director of HR, Director of TA. 2 = HR Manager, TA Manager, People Manager. 1 = HR Specialist, Coordinator, Recruiter. 0 = Assistant, Intern, Junior. |
| `scope` | 0–3 | 3 = Global. 2 = Regional (multi-country: DACH, EMEA, APAC). 1 = Country-specific. 0 = Single-site / single-function. |
| `tenure` | -1 to 2 | 2 = 0–3 mo (transition window, fresh authority to choose new tools). 1 = 3–12 mo. 0 = 1–3 yr. -1 = 3+ yr entrenched on current stack. |
| `direct_authority_signals` | 0–2 | +1 each for profile mentions of "owns hiring process", "manages X recruiters", "led tech stack selection". Cap at 2. |
| `past_employer_signals` | 0–2 | +2 if worked at a confirmed customer (org customer list) in past 5 yr (boomerang). +1 if worked at a competitor (familiar with category). |

```
person_authority_raw = title_decisiveness + scope + tenure + direct_authority_signals + past_employer_signals
# clamp to [0, 10] after caps applied (see §1.5)
```

**Calibration bands** (`lead-qualification-framework.md:117`):
- `>= 5` → real decision-making power
- `3–4` → influencer (champion)
- `<= 2` → needs warm intro to reach buyer

### 1.2 Company Fit Score (0–10)

Source `lead-qualification-framework.md:119-126`. `layer: global_library` (point values); `orgs` (size bands, vertical list, geography weights, reference-customer roster).

| Sub-criterion | Range | Scoring logic (deterministic — defaults are TalentLyft seed) |
|---|---|---|
| `company_size` | 0–4 | 4 = 200–1000 employees. 2 = 50–200. 2 = 1000–3000. 1 = <50 (HR/Staffing tier). 0 = >5000. *(org-overridable sweet spot)* |
| `vertical_match` | 0–3 | 3 = direct fit (one of org's served industries — 6 for TalentLyft). 1 = adjacent (manufacturing, healthcare, education). 0 = out-of-scope. Public sector / government → consider penalty (procurement complexity). |
| `geography` | 0–3 | 3 = home market. 2 = adjacent markets. 1 = Western Europe / NA. 0 = out-of-region. *(org-overridable home market)* |
| `proximate_customer_available` | 0–1 | 1 = same-vertical reference customer exists for name-drop. |

```
company_fit = company_size + vertical_match + geography + proximate_customer_available  # clamp [0,10]
```

### 1.3 Lock-In Risk Score (penalty, -10 to +3 — SIGNED, additive)

Source `lead-qualification-framework.md:128-136`. `layer: global_library` (point values); `orgs` (ATS vendor→tier map). **This score is signed**: greenfield yields a positive bonus, entrenchment yields a negative penalty. It is added (with its sign) into Net Score.

| Sub-criterion | Range | Scoring logic (deterministic) |
|---|---|---|
| `ats_detected` | -4 to +3 | **+3** = Greenfield (no ATS / spreadsheets / email apps). **-1** = Workable, Recruitee, Smartrecruiters (mid-market, displaceable). **-2** = Lever, Greenhouse, Ashby (premium mid-market). **-4** = Workday, SAP SuccessFactors, Oracle HCM, iCIMS, JobVite, Bullhorn, Avature (enterprise-locked). **-2** = Custom-built / ERP-tied (integration complexity). |
| `multi_year_contract_probability` | 0 to -3 | -3 = Enterprise (5000+) on enterprise ATS. -1 = mid-market on Workable/Recruitee. 0 = small / no ATS. |
| `centralized_procurement_signal` | 0 to -3 | -2 = "Procurement Department" visible on LinkedIn. -1 = public RFP language ("we evaluate annually"). -2 = IT decides HR tech. (sum, floor at -3) |

```
lock_in_risk = ats_detected + multi_year_contract_probability + centralized_procurement_signal  # signed, clamp [-10, +3]
```

**Calibration note** (`lead-qualification-framework.md:136`): a lock-in penalty magnitude `>= 5` (i.e. `lock_in_risk <= -5`) usually means PURSUE_NICHE or NURTURE, not PURSUE.

### 1.4 Buying Stage Signal (0–5)

Source `lead-qualification-framework.md:138-145`. `layer: global_library`. Note `active_hiring_intensity` can go negative (hiring freeze signal).

| Sub-criterion | Range | Scoring logic (deterministic) |
|---|---|---|
| `transition_window` | 0–3 | 3 = 0–3 mo in role (fresh-mandate window). 2 = 3–6 mo. 1 = 6–12 mo. |
| `recent_catalyst` | 0–2 | +1 funding round in last 6 mo. +1 new office / market entry. +1 new CEO / CHRO. Cap at 2. |
| `active_hiring_intensity` | -1 to 2 | 2 = 10+ open roles. 1 = 5–10. -1 = 0 open roles (no urgency, may signal hiring freeze). |
| `hiring_pain_posts` | 0–2 | 2 = public post about hiring pain in last 90 days. 1 = post about hiring strategy/tooling. |

```
buying_stage = transition_window + recent_catalyst + active_hiring_intensity + hiring_pain_posts  # clamp [-1, 9] then treat as buying_stage signal
```
*(Range stated 0–5 in source header; sub-criteria sum can exceed it. Treat the sum as the signal value; do not re-clamp to 5 — the verdict algorithm uses the raw sum via net_score.)*

### 1.5 Caps applied BEFORE combining (order matters)

These overrides fire during component resolution, NOT in the verdict algorithm. Apply in this order:

1. **Freelancer/contractor employment-basis override** (`lead-qualification-framework.md:210-220`): if the prospect's LinkedIn employment basis ∈ {`Freelance`, `Freelancer`, `Self-employed`, `Independent contractor`, `Contractor`, `Consultant`-at-platform} → set `person_authority = 1` regardless of title. Applies even when the company is sub-type (a) or (b).
2. **Freelancer-platform / MSP company sub-type override** (`lead-qualification-framework.md:203-208`): if company sub-type ∈ {`freelancer-marketplace`, `msp`} → set `company_fit = 0` AND `person_authority <= 1`.
3. **Amazon Germany Problem cap** (`lead-qualification-framework.md:176-191`): if company is enterprise (≥5000 employees) AND title is region-specific → cap `person_authority` at 4 — UNLESS `boomerang_detected` (boomerang overrides the Person Authority cap, NOT the Lock-In Risk; `:166`, `:170`).

#### Region-specific title heuristics (`lead-qualification-framework.md:180-191`)

**Triggers the cap** (regional/local):
- Contains a country name (Germany, France, UK, Spain, Italy, Poland, etc.)
- Contains: `Region`, `DACH`, `EMEA`, `APAC`, `NORAM`, `LATAM`, `Nordics`, `Iberia`, `MENA`, `ASEAN`, `Benelux`
- Contains city + role qualifier ("New York HR Lead", "Berlin Talent Director")

**Does NOT trigger the cap** (global):
- Contains `Global`, `Worldwide`, `International`, `Group`
- Contains `Chief` + function (CHRO, CPO, Chief Talent Officer) — chief titles are global by convention even at multinationals

**Edge case** (`:191`): "Head of HR" at a single-country company that is itself the relevant decision entity (e.g. Pepco-Poland, a Polish entity of a Polish parent) does NOT trigger the cap. Apply cap ONLY when the company is enterprise-tier AND the title scope is regional within that enterprise.

### 1.6 HR/Staffing sub-type classifier (gate before Company Fit scoring)

Source `lead-qualification-framework.md:195-247`. When `sector ∈ {HR/Staffing, Recruiting, Talent Acquisition, HR Tech}`, run ONE Exa query before scoring Company Fit, then classify.

Exa query (`:201`): `"{company name}" ("freelancer platform" OR "marketplace" OR "MSP" OR "RPO" OR "agency")` numResults: 5

| Sub-type code | Label | Examples | ATS buyer? | Scoring effect |
|---|---|---|---|---|
| `traditional-agency` | Traditional agency w/ employed recruiters | Adecco, Hays, Robert Half | YES | Score normally |
| `rpo` | Recruitment Process Outsourcing | Korn Ferry RPO, Cielo, AMS | YES | Score normally |
| `freelancer-marketplace` | Freelancer marketplace/platform | Cross Border Talents, Toptal Recruiter Network | **NO → DISQUALIFY** | `company_fit = 0`, `person_authority <= 1` |
| `msp` | Managed Service Provider (staffing) | KellyOCG, Allegis Global Solutions | **NO → DISQUALIFY** | `company_fit = 0` |

**Surface signals that DO NOT save the verdict** when sub-type resolves to `freelancer-marketplace`/`msp` (`:234-243`): right vertical match, right title decisiveness, right headcount band (marketplaces can be 200–500), active hiring volume (those are jobs for THEIR clients, not the platform), fresh-tenure transition window. DISQUALIFY regardless.

**Ambiguity** (`:246-247`): if a company runs BOTH in-house agency AND a freelancer marketplace, score with `confidence: low` and surface to user: *"This company appears to operate both an in-house agency AND a freelancer platform. Treat the prospect as agency-employee or platform-contractor?"*

### 1.7 Boomerang detection (2-axis grid, NOT a single override)

Source `lead-qualification-framework.md:158-173`. Cross-reference the prospect's past employers (LinkedIn work history) against the org customer list (`orgs` layer). Boomerang is the highest-strength single signal but **does NOT override Lock-In Risk** — it overrides the Person Authority cap from the Amazon Germany Problem.

| Boomerang status + Person Authority | Verdict |
|---|---|
| Boomerang detected + HIGH authority (`person_authority >= 5`) | **PURSUE** (premium — they know the product AND can decide) |
| Boomerang detected + LOW authority (`person_authority < 5`) | **PURSUE_CHAMPION** (warm-intro path — knows the product, can vouch, isn't the buyer) |
| Boomerang detected + locked-in enterprise (`lock_in_risk <= -5`) | **PURSUE_CHAMPION** (boomerang overrides the authority cap, NOT the lock-in — warm-intro source) |

### 1.8 Composite Net Score

Source `lead-qualification-framework.md:147-154`, `:254-259`.

```
net_score = person_authority + company_fit + buying_stage + lock_in_risk
# lock_in_risk is SIGNED: negative penalty subtracts, positive greenfield bonus adds
# Range: -10 to +28
```

---

## 2. The 5-Verdict Taxonomy

Source `lead-qualification-framework.md:83-91`. `layer: global_library`.

| Verdict | Condition (plain English) | Reply strategy |
|---|---|---|
| `PURSUE` | High authority + good fit + low lock-in | Standard outreach (state machine + Permissioned Introduction Ladder) |
| `PURSUE_NICHE` | Good fit but locked-in on enterprise ATS (Workday/Greenhouse/iCIMS), OR right-sized SMB on enterprise stack | Reframe pivot to sub-product the prospect actually controls (career page, source analytics, recruiter productivity tool) — not full ATS displacement |
| `PURSUE_CHAMPION` | Low authority OR locked-in enterprise + warm signals (boomerang, engaged in HR communities) | Stay-in-rapport longer + probe "do you have a stake in hiring tooling?" → request warm intro to decision-maker |
| `NURTURE` | Right fit + 5+ yr entrenched + no urgency signal | Light touch only. No pitch. 30+ day nudge cadence. Wait for context shift (job change, new role, funding event). |
| `DISQUALIFY` | Job-searching themselves + small team + bad fit + locked-in + no boomerang | Polite exit reply. Drop thread or 30-day re-check. |

### 2.1 Verdict Algorithm (deterministic — FIRST MATCH WINS, order is load-bearing)

Source `lead-qualification-framework.md:251-312` (verbatim logic). Implement as an ordered if/elif chain. Inputs are the post-cap component scores from §1.5.

```python
def resolve_verdict(p):  # p = resolved prospect signals + scores
    # --- displacement_difficulty (set first; NURTURE branch may override) ---
    if p.tenure_years >= 5 or (p.enterprise_company and p.enterprise_ATS):
        displacement_difficulty = "HIGH"
    elif p.tenure_years >= 1 or p.mid_market_ATS_detected:
        displacement_difficulty = "MEDIUM"
    else:
        displacement_difficulty = "LOW"

    # --- verdict (first match wins) ---

    # Hard structural disqualifiers fire BEFORE all other paths.
    if p.company_sub_type in ("freelancer-marketplace", "msp"):
        verdict = "DISQUALIFY"

    elif p.prospect_employment_basis in (
        "freelance", "self-employed", "independent-contractor", "contractor"):
        verdict = "DISQUALIFY"

    elif p.boomerang_detected and p.person_authority >= 5:
        verdict = "PURSUE"

    elif p.boomerang_detected and p.person_authority < 5:
        verdict = "PURSUE_CHAMPION"

    elif p.amazon_germany_problem and not p.warm_intro_path_exists:
        verdict = "DISQUALIFY"

    elif p.amazon_germany_problem and p.warm_intro_path_exists:
        verdict = "PURSUE_CHAMPION"

    elif p.lock_in_risk <= -5 and p.company_fit >= 5 and p.person_authority >= 5:
        verdict = "PURSUE_NICHE"          # locked-in but the right buyer for a sub-product

    elif p.net_score >= 12 and p.person_authority >= 5 and abs(p.lock_in_risk) <= 2:
        verdict = "PURSUE"

    elif p.net_score >= 8 and p.lock_in_risk <= -5:
        verdict = "PURSUE_NICHE"

    elif p.person_authority <= 3 and p.company_fit >= 5 and abs(p.lock_in_risk) <= 4:
        verdict = "PURSUE_CHAMPION"

    elif p.net_score >= 4 and p.tenure_years >= 5:
        verdict = "NURTURE"
        displacement_difficulty = "HIGH"  # entrenched → suppress turn-5 safety net

    else:
        verdict = "DISQUALIFY"

    return verdict, displacement_difficulty
```

**Branch reference table** (for test-case construction):

| # | Guard | Verdict | Notes |
|---|---|---|---|
| 1 | `company_sub_type ∈ {freelancer-marketplace, msp}` | DISQUALIFY | no buying surface |
| 2 | `employment_basis ∈ {freelance, self-employed, independent-contractor, contractor}` | DISQUALIFY | no procurement seat |
| 3 | `boomerang_detected AND person_authority >= 5` | PURSUE | premium signal |
| 4 | `boomerang_detected AND person_authority < 5` | PURSUE_CHAMPION | warm-intro path |
| 5 | `amazon_germany_problem AND NOT warm_intro_path_exists` | DISQUALIFY | regional, no path |
| 6 | `amazon_germany_problem AND warm_intro_path_exists` | PURSUE_CHAMPION | warm-intro to global |
| 7 | `lock_in_risk <= -5 AND company_fit >= 5 AND person_authority >= 5` | PURSUE_NICHE | sub-product pivot |
| 8 | `net_score >= 12 AND person_authority >= 5 AND abs(lock_in_risk) <= 2` | PURSUE | clean buyer |
| 9 | `net_score >= 8 AND lock_in_risk <= -5` | PURSUE_NICHE | locked but worth sub-product |
| 10 | `person_authority <= 3 AND company_fit >= 5 AND abs(lock_in_risk) <= 4` | PURSUE_CHAMPION | influencer, good company |
| 11 | `net_score >= 4 AND tenure_years >= 5` | NURTURE | entrenched; forces HIGH difficulty |
| 12 | else | DISQUALIFY | fallthrough |

---

## 3. `displacement_difficulty` Scalar

Source `lead-qualification-framework.md:93-101`. A separate dimension from the verdict, carried by ALL 5 verdicts independently. Captures how hard the displacement conversation will be even when the verdict is favorable. `layer: members` (computed per-prospect).

```
enum displacement_difficulty { LOW, MEDIUM, HIGH }
```

| Level | Trigger | Downstream effect |
|---|---|---|
| `LOW` | Greenfield (no ATS) OR < 12 months on current stack | Standard pivot cadence. Turn-5 safety net ACTIVE. |
| `MEDIUM` | 1–3 years on mid-market ATS (Workable / Recruitee / Smartrecruiters) | Standard cadence. Turn-5 safety net ACTIVE. |
| `HIGH` | 5+ years entrenched, OR enterprise on enterprise ATS (Workday/SAP), OR active multi-year contract signal | **SUPPRESS turn-5 safety net.** Tilt all variants toward rapport-first. Don't burn 6-month nurture threads with premature pivots. |

> `displacement_difficulty == HIGH` is the single switch that disables the turn-5 safety net (the automatic pivot attempt). Carry it on the thread record and check it in the state machine action layer (§4).

---

## 4. The 6-State DM Conversation Machine

Source `linkedin-dm-conversation-state-framework.md:62-103`. `layer: global_library` (definition); per-thread current-state lives in `members`. Classify each latest inbound exchange into EXACTLY ONE state. Each state has a deterministic default action.

```
enum conversation_state {
  warm_open, goal_reveal, tooling_invite, job_search, closed_off, no_reply
}
```

### 4.1 State table (entry signal · allowed transitions · recommended action)

| State | Entry signal (trigger) | Default / recommended action | Allowed transitions (next inbound) |
|---|---|---|---|
| `warm_open` | Prospect replies positively ("going well, how are you?") | Ask ONE natural, context-aware question — prioritize new role if `is_new_role` (see §4.2 decision logic) | → goal_reveal, tooling_invite, job_search, closed_off, no_reply |
| `goal_reveal` | Prospect shares objectives, targets, or process changes | Mirror their goal; ask ONE clarifying question that helps them think. If they invite help → enter Permissioned Introduction Ladder (§5) | → tooling_invite, goal_reveal (deeper), closed_off, no_reply, [ladder] |
| `tooling_invite` | Prospect mentions tools or pains UNPROMPTED | Ask what's smooth vs. clunky in their current setup — still NO pitch | → goal_reveal, [ladder], closed_off, no_reply |
| `job_search` | Prospect is personally looking for a new role | Express empathy; ask about target roles/preferences; optionally offer intros | → warm_open, closed_off, no_reply |
| `closed_off` | Very brief replies, no question back | Ask ONE narrower, context-aware question; keep it short | → warm_open, goal_reveal, no_reply |
| `no_reply` | No response for 4+ days | Low-friction nudge with opt-out language (see §6 nudge cadence) | → warm_open, goal_reveal (re-engaged), [terminal after 2 nudges] |

> **Cache invalidation hook** (`lead-qualification-framework.md:358`, `:363`): transition INTO `tooling_invite` or `goal_reveal` invalidates the conversation-bound cache (verdict + displacement_difficulty) — new prospect info has surfaced; recompute scoring.

### 4.2 State decision logic (pseudocode, verbatim — `linkedin-dm-conversation-state-framework.md:77-103`)

```
IF state == warm_open:
    IF is_new_role:
        ask one natural, role-centered question
    ELSE:
        ask a light curiosity question about current focus

ELIF state == job_search:
    express empathy + ask targets/preferences
    optionally offer intros or relevant roles

ELIF state == tooling_invite:
    ask what's smooth vs clunky; still no pitch

ELIF state == goal_reveal:
    mirror their goal; ask one clarifier
    IF they invite help:
        offer a small resource; ask permission to send   # → Permissioned Introduction Ladder

ELIF state == closed_off:
    ask one narrower, context-aware question; keep short

ELIF state == no_reply:
    use low-friction nudge or opt-out friendly check-in
```

### 4.3 Verdict ↔ state-action overrides

Source `lead-qualification-framework.md:316-346`. The state machine runs the same for PURSUE / PURSUE_NICHE / PURSUE_CHAMPION, but the ACTION layer branches on verdict. NURTURE and DISQUALIFY skip the state machine's pivot logic.

| Verdict | State-machine behavior override |
|---|---|
| `PURSUE` | Full state machine + Permissioned Introduction Ladder. Turn-5 safety net ACTIVE unless `displacement_difficulty == HIGH`. |
| `PURSUE_NICHE` | Same state machine, but the ladder's Step 3 REFRAMES from full product to a sub-product the prospect controls. For TalentLyft on a Workday account: career-page builder, source analytics, OR recruiter productivity layer (3 sub-product paths). Phrase: "we sit alongside Workday for [narrow use case]", NOT "we replace your ATS". |
| `PURSUE_CHAMPION` | Stay-in-rapport longer. SKIP turn-5 safety net entirely (no premature pivot). Generate probe variants: "do you have a stake in hiring tooling at {Company}?" / "is hiring tooling something you own or handled centrally?" If they confirm → give them ammo (1-pager / short note to share). If "centrally" → warm-intro request: "who'd be the right person to chat with about that?" |
| `NURTURE` | Skip pivot logic entirely. Light-touch reply only (acknowledge warmly, no question pulling toward product). 30+ day nudge cadence. Re-engage trigger: new context (job change, funding, hiring-pain post) → `--requalify` re-runs scoring. |
| `DISQUALIFY` | Single polite-exit reply (verbatim, `:344`): "Good chatting, wishing you well in the new role. If anything comes up around hiring tooling later, you know where to find me." 30-day re-check; `--requalify` may flip verdict on material context change. No nudges. |

### 4.4 Signal extraction taxonomy (parse before classifying state)

Source `linkedin-dm-conversation-state-framework.md:44-60`. Extract these structured signals from the prospect profile + thread before state classification. `layer: members` (per-prospect, cached).

| Signal | Description | Example values |
|---|---|---|
| `is_new_role` | Started current role within ~6 months | true / false |
| `new_role_title` | The role they stepped into | "Head of Talent Acquisition" |
| `sector` | Industry vertical | hospitality, retail, tech, nonprofit, healthcare, finance |
| `team_context` | Team structure clues | leads team, solo, multi-site, weekly targets |
| `contract_type` | Employment type | permanent, FTC, contract, temporary |
| `end_date` | Contract end if FTC | "2026-12-31" |
| `tooling_mentions` | Tools/platforms mentioned | ATS names, CRM names, "no tools visible" |
| `hiring_push` | Active growth signals | many open roles, new office, seasonality |
| `career_path` | Trajectory pattern | agency→in-house, IC→manager, lateral move |

### 4.5 New-role-first heuristic

Source `linkedin-dm-conversation-state-framework.md:106-121`. When the profile shows a recent role change/promotion, ALWAYS prioritize the new role as the conversation entry point (highest-signal, most natural topic).

Default themes: scope change (team leadership, targets, compliance), early adjustments (process tweaks, cadences, handoffs), immediate goals this month/quarter.

Generic openers (`:117-119`, adapt per client prospect type):
1. "Since stepping into the {Title}, have you set any new goals or made a small change to how you run {function}?"
2. "What's been the most unexpected part of the new role so far?"
3. "Have you tweaked anything in the weekly rhythm yet — stages, handoffs, or check-ins?"

---

## 5. Permissioned Introduction Ladder (4 steps, NEVER skip)

Source `linkedin-dm-conversation-state-framework.md:124-141`. The core principle: never pitch until a need is expressed. When it is, follow this 4-step ladder in order. `layer: global_library`.

| Step | Action | Example | Rule |
|---|---|---|---|
| 1. Mirror | Restate their need in their own words | "So the main thing is getting first-screen time down without losing quality." | — |
| 2. Ask Permission | Ask if they want a short INLINE note (not a file/link) | "If helpful, I can paste a brief outline here. Want it?" | MUST be a genuine question, not rhetorical |
| 3. Inline Value | Post 3–5 bullet outline + soft product bridge | "These bullets map cleanly in {Product} — [specific features] — so there's less manual work." | INLINE bullets only — no attachments, no links |
| 4. Next Step | Suggest a light, concrete next step | "Happy to compare this to your current flow and point out 1-2 quick wins." | Offered ONLY if they respond positively to Step 3 |

> If they decline at any step, accept gracefully and continue the conversation (`:140`).

---

## 6. Warm-Up Sequence + Engagement Rules

### 6.1 Multi-touch warm-up sequence (the cadence engine schedules)

Source `linkedin-dm-social-selling-playbook.md:444-453` (DM Sequence Timing) + `:292-299` (multi-touch before DM). `layer: global_library`. Drive this as a scheduled multi-step sequence per thread.

| Step | Timing (relative to Day 0 = connection request) | Action |
|---|---|---|
| Multi-touch warmup | Days -7 to -1 | Endorse top 2 skills; like/comment on 1–2 posts; follow company page |
| Connection request | Day 0 | Blank or minimal note (blank performs better) |
| First DM | Day 1–3 after acceptance | Value-first message (NO pitch) |
| Follow-up 1 | Day 5–7 | Social proof or resource |
| Follow-up 2 | Day 10–14 | Responsibility trigger or different angle |
| Final follow-up | Day 21+ | Clean exit with humor |

Multi-touch ordering before any DM (`:294-299`): (1) endorse their top 2 skills → (2) comment on and like 1–2 of their posts → (3) follow their company page → THEN send the DM.

### 6.2 3-step social selling framework (entry gate before warm-up)

Source `linkedin-dm-social-selling-playbook.md:97-140`.

- **Step 1 — Engage with prospect's posts.** Like + comment; ask thoughtful questions (tag them to ensure notification). **Move to Step 2 when:** they respond to your comment (ideal) OR you've commented on 3–5 posts without response OR they don't post on LinkedIn at all (skip directly to Step 2).
- **Step 2 — Send connection request.** No-note requests have a **10% higher acceptance rate**. Include a note ONLY for a strong reason (met at conference, sent a gift, highly specific shared context). Otherwise blank.
- **Step 3 — Value-first message.** Must be (1) as useful as possible to THIS person, (2) NOT mention your company. Lead with "give". Forcing question: "If I only had one opportunity to provide value to this person, what would I send?"

### 6.3 Message rules (hard constraints — enforce in generation)

Source `linkedin-dm-conversation-state-framework.md:161-179` + `linkedin-dm-social-selling-playbook.md:281-290`. `layer: global_library`. Apply to EVERY generated message.

- **One question per message** — never stack questions
- **Target < 350 characters** when possible
- **4–5/10 enthusiasm** — warm and measured, never eager
- **No emojis, no exclamation points**
- **Mirror prospect's language and pace** (formal→formal; industry shorthand→shorthand)
- **Peer-to-peer tone** — avoid jargon, avoid deference
- **Ask permission** before sharing any resource
- **Never pitch first** — product only after expressed need

**Phrases to BAN (regex/contains check on output):**
- "I'd love to show you"
- "Amazing!!"
- "Quick 15-minute call?"
- "Circle back with my solution"
- "I would love to" / "That'd be amazing" (low-status tone tells)

**The Restrained Compliment rule** (`linkedin-dm-social-selling-playbook.md:259-269`): you MUST compliment, but at 4–5/10 enthusiasm (peer-level authority), never 10/10 (fan-level, desperate). Bad: "I absolutely LOVE the work you did with E-Com ROI!" Good: "Solid case study with E-Com ROI. 3.2x ROAS is pretty good for e-com FB ads."

### 6.4 The never-reveal-you-saw-the-engagement rule

Source: synthesized from `linkedin-dm-social-selling-playbook.md:78-93` ("starting a conversation", observation→insight→question), `:128-138` (value-first message does NOT mention your company), and the engagement doctrine in `signal-linkedin-brand-mentions.md:397-402` ("Be human: don't copy-paste template responses... Build relationship first").

**Rule:** when a prospect surfaces via an engagement signal (commented on your post, engaged with a competitor's post, reacted to a brand mention, viewed your profile), the opener must NOT baldly announce surveillance ("I saw you commented on X and our system flagged you"). Frame it as a natural observation that ties to an insight and a question — the DM framework `observation → insight/challenge → question` (`:85-91`). The engagement is the *reason you reached out*, surfaced conversationally, never as "I'm monitoring your activity."

> Implementation: the opener generator takes the engagement signal as private context that shapes the observation, but the rendered message references only what a peer would naturally notice (the prospect's public post/role/company news), not the tracking mechanism. The single explicit "saw you stalked my profile" archetype (`:386-392`) is a deliberate humor play and the ONLY sanctioned acknowledgment — gate it behind a `playful_tone: true` flag, default off.

### 6.5 Nudge cadence (for quiet threads / `no_reply` state)

Source `linkedin-dm-conversation-state-framework.md:144-158`. `layer: global_library`.

| Timing | Message pattern |
|---|---|
| 4–6 days | Value offer + opt-out: "Happy to leave it there — or I can share a short note on how others structure {relevant topic}. Useful, or skip?" |
| 10–14 days | Gentle check-in: "Quick check — still relevant, or shall I circle back next month?" |
| 30+ days | Re-engage with new context: reference something new from their profile/posts |

Rules (`:154-158`): **maximum 2 nudges before stopping**; always include an easy opt-out; never escalate enthusiasm in a nudge.

---

## 7. 6-Category Mention Taxonomy (auto-classify feed posts)

Source `signal-linkedin-brand-mentions.md:205-226` (canonical 6-category enum at `:215-222`) + supporting sub-pattern catalog at `:57-122`. `layer: global_library`. This classifier auto-tags inbound brand-mention / feed posts for routing.

### 7.1 Category enum (the 6 categories — `signal-linkedin-brand-mentions.md:215-222`)

```
enum mention_category {
  evaluation_buying_intent,      # "Evaluation/Buying Intent"
  customer_feedback,             # "Customer Feedback"
  competitive_mention,           # "Competitive Mention"
  general_discussion,            # "General Discussion"
  advocacy_recommendation,       # "Advocacy/Recommendation"
  question_help_request          # "Question/Help Request"
}
```

### 7.2 Companion enums (emitted alongside category)

Sentiment (`:209-214`): `enum sentiment { positive, negative, neutral, mixed }`
Intent score (`:223-227`): `enum intent_score { high, medium, low }` — high = active evaluation; medium = research mode; low = passive mention.

### 7.3 Sub-pattern catalog per category (for classifier prompt / training — `signal-linkedin-brand-mentions.md:57-122`)

| Category | Sub-type | Trigger phrase patterns |
|---|---|---|
| `evaluation_buying_intent` | Evaluation mentions | "Considering [Product] vs [Competitor]", "Has anyone used [Product]?", "Looking for something like [Product]", "Evaluating [category] tools—[Product] on the list" |
| `question_help_request` | Recommendation requests | "What's the best [category] tool?", "Need help with [use case]—any suggestions?", "Who has experience with [Product]?" |
| `evaluation_buying_intent` | Problem/pain mentions | "Struggling with [pain point]", "Anyone know how to [use case]?", "Frustrated with [competitor]—alternatives?" |
| `customer_feedback` | Negative sentiment | "Having issues with [Product]", "Customer support at [Product] is...", "[Product] doesn't do [feature]", "Disappointed with [Product] because..." |
| `customer_feedback` | Churn risk | "Considering switching from [Product]", "Contract renewal coming up...", "Evaluating alternatives to [Product]" |
| `customer_feedback` | Expansion hints | "[Product] works great for [use case A], but...", "Using [Product] for X, now need Y", "Love [Product 1], wish they had [Product 2]" |
| `advocacy_recommendation` | Positive shoutouts | "Love [Product]!", "Great experience with [Product]", "[Product] team is amazing", "Highly recommend [Product]" |
| `advocacy_recommendation` | Success stories | "We achieved [outcome] using [Product]", "Case study on how we used [Product]", "ROI from [Product] was [metric]" |
| `advocacy_recommendation` | Thought-leadership social | Comments on your company's posts, shares of your content, tags your company in discussions |
| `competitive_mention` | Competitor mentions | "Switching from [Competitor] to [Product]", "[Product] vs [Competitor] comparison", "Why I chose [Competitor] over [Product]" |
| `general_discussion` | Category discussions | Conversations about your category, industry-trend discussions, technology-evaluation conversations |

### 7.4 Routing logic (category + sentiment + ICP → team)

Source `signal-linkedin-brand-mentions.md:255-259`. `layer: orgs` (team mapping is org-config; classifier output is global).

| Condition | Route to |
|---|---|
| High intent + ICP match | Sales team |
| Existing customer + negative sentiment | CS team |
| Positive advocacy | Marketing team |
| Competitor mention | Competitive intel team |

### 7.5 Response-timing SLA per signal (`signal-linkedin-brand-mentions.md:390-395`)

| Mention class | Target response time |
|---|---|
| High-intent mentions | < 2 hours |
| Customer negative mentions | < 1 hour |
| Questions / help requests | < 4 hours |
| Positive advocacy | < 24 hours |
| General mentions | < 48 hours |

### 7.6 Monitoring frequency tiers (`signal-linkedin-brand-mentions.md:404-408`)

`real-time` = target accounts + existing customers · `every 4 hours` = high-priority prospects · `daily` = general brand monitoring · `weekly` = competitive intel + advocacy tracking.

---

## 8. Cache TTL Policy + Graceful Degradation (runtime infra)

### 8.1 Cache TTL (`lead-qualification-framework.md:350-369`)

Per-thread qualification result cached with per-field `enriched_at` timestamps (Choir: cache under the `members` thread record). Enables incremental re-enrichment.

| Signal class | TTL | Examples |
|---|---|---|
| Static | 30 days | title, company name, sector, ATS tech-stack detection, boomerang lookup, geography |
| Dynamic | 7 days | hiring intensity, recent funding events, recent LinkedIn posts, company news |
| Conversation-bound | invalidate on state transition | verdict, displacement_difficulty (recompute when state → `tooling_invite` or `goal_reveal`) |

Invalidation triggers (`:360-365`): `--requalify` flag (force full re-enrich); state transition → `tooling_invite`/`goal_reveal`; 30-day natural expiry (static); 7-day natural expiry (dynamic).

Credit conservation (`:367-369`): re-pull ONLY stale fields, not the full fan-out. First invocation ~2–3 enrichment credits; 5-day-later invocation = 0 (static hit, dynamic warm); 8-day-later ≈ 1 (refresh dynamic only).

### 8.2 Graceful degradation (`lead-qualification-framework.md:373-384`) — do NOT fail-close

| Failure | Behavior |
|---|---|
| Company enrichment returns no data (private SMB / EE mid-market not in DB) | Degrade to LinkedIn-only + Exa. Mark `company_fit_score: provisional`. Cap verdict at PURSUE_NICHE max until enrichment improves. |
| Lead has no LinkedIn URL | Fall back to `first_name + last_name + company_name` search. If still null, surface to user — never silently skip qualification. |
| Customer-list source unreachable | Set `boomerang_detected: false`, log warning to a degradation log, continue non-boomerang path. |
| Boomerang contradicts authority (recruiter-at-customer) | Treat as 2-axis grid (§1.7). Recruiter-at-customer = PURSUE_CHAMPION, not auto-PURSUE. |
| No recent news | Set `buying_stage_signal_news: 0`, continue. Absence is informative (steady-state). |
| Confidence in any score < 50% | Flag verdict `confidence: low` in output. |

---

## 9. Engineer Build Checklist

1. Seed `global_library` tables: scoring point values (§1), verdict thresholds + ordered algorithm (§2.1), `displacement_difficulty` rules (§3), 6-state machine + transitions (§4.1), permissioned ladder (§5), warm-up sequence + message rules + nudge cadence (§6), 6-category mention taxonomy + sub-patterns (§7).
2. Seed `orgs` overrides from TalentLyft defaults: company-size bands, served-vertical list, home-market geography, ATS vendor→tier map, customer list (boomerang), team-routing map.
3. Implement component scorers with caps applied in the §1.5 order (freelancer override → sub-type override → Amazon Germany cap-unless-boomerang).
4. Implement `resolve_verdict()` (§2.1) as an ordered first-match chain — preserve branch order exactly; it is load-bearing.
5. Implement the state classifier + action layer with §4.3 verdict overrides; wire the `displacement_difficulty == HIGH` switch to suppress the turn-5 safety net.
6. Implement the mention classifier emitting `{mention_category, sentiment, intent_score}` → routing (§7.4) + SLA timers (§7.5).
7. Wire cache TTL (§8.1) + graceful degradation (§8.2). Never fail-close.
8. Enforce message rules (§6.3) as a post-generation validator: char cap, single-question, banned-phrase grep, no emoji/exclamation, never-reveal-engagement framing (§6.4).

---

*Spec compiled 2026-06-20 for Choir backend build. All values verbatim from KB source files cited inline. No invented data — see net_new_flags in the returning manifest for gaps requiring net-new engineering.*

# Voice Interview Scripts — Ship-Ready Guided-Form Content (Choir Onboarding)

> **What this is:** The COMPLETE, verbatim onboarding/voice-interview content for Choir's deep-context capture, extracted as ship-ready guided-form data. Engineers render these directly as forms; the AI interviewer fires the probes and runs the gates. This EXTENDS `brainstorms/content-os-app/deep-context-layer-architecture.md` (which TRIMMED both the company intake and the POV synthesis schema to "load-bearing" subsets) — this file carries the FULL set.
>
> **Data-layer tagging (3-layer Choir model):**
> - `MEMBER` = per-member belief/voice capture → `members` table (org_id FK). PART A.
> - `ORG` = shared brand DNA / ICP / customer data → `orgs` table. PART B.
> - `GLOBAL` = app-wide read-only seed (the question banks themselves, probe phrases, gate definitions) → `global_library`. The form templates + probe engine + gate rules in this doc are GLOBAL seed; the captured ANSWERS are MEMBER/ORG.
>
> **Onboarding flow (verbatim 5-phase, ORG-level):** `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:37]`
> (0) Auto-research public surface → (1) Intake form (~45 Q, internal truth) → (2) Discovery call (stories) → (3) Research verification → (4) Deep-dive workshop → asset collection throughout.
>
> **Voice interview = async record→transcribe→process, NOT live conversational agent.** `[VERIFIED: brainstorms/content-os-app/deep-context-layer-architecture.md:50]` Format each question as a voice-dictation prompt; recommend Wispr Flow / Voice Memos / Loom; transcribe; then process. Live voice is explicitly out of scope (conversation-pacing/interrupt-timing/sub-second latency).

---

## Source Map (path:line per part)

| Part | Content | Source |
|------|---------|--------|
| A | Expert-POV 18Q bank, 6 dimensions, [CORE]/[ASYNC] tags + extraction targets | `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:82-128]` |
| A | Probe engine (4 verbatim probes) | `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:130-134]` |
| A | Async/[CORE] mode selection (6 / 12 / 18) | `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:39-74]` |
| A | Crawford 4-Test hot-take gate | `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:166-182]` |
| A | OBI 3-Test gate | `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:186-202]` |
| A | Contrarian Intensity (H/M/L) scoring | `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:145-149]` |
| A | Synthesis output schemas (5 tables) | `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:140-212]` + `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:41-194]` |
| B | Full ~45Q company intake, 8 sections | `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:93-315]` |
| B | Discovery call + verification + workshop scripts (deep extensions) | `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:319-487]` |
| C | Research-first auto-prefill recipe (URL → sources → fields) | `[VERIFIED: .claude/skills/icp-research/SKILL.md:43-205]` + `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:49-69]` |

---

# PART A — Expert-POV Interview (MEMBER layer)

> **Layer:** MEMBER. Captures WHAT the member believes (not HOW they sound — that's Voice DNA). Each answer feeds the `members` table belief/POV columns.
> **Templates = GLOBAL seed; answers = MEMBER.**

## A.0 — Mode selection (which subset of questions to ask)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:39-74]`

| Mode | Questions asked | When (UX trigger) | Duration |
|------|-----------------|-------------------|----------|
| **Quick POV** | 6 questions tagged `[CORE]` | Fast onboarding path; POV needed for positioning only; test if depth exists before full session | ~30 min |
| **Async Extract** | 12 questions tagged `[ASYNC]` (voice-dictation) | Time-constrained members; distributed teams; POV is secondary scope | 5-10 min dictation + 30 min follow-up |
| **Full Interview** | All 18 questions | Content is primary scope; annual deep refresh; founder-led brand buildout | 60-90 min |

**Implementation note:** `[CORE]` (6) is the subset rendered for the quick onboarding path. `[ASYNC]` (12) is the subset formatted as voice-dictation prompts. The full set is 18. A question can carry BOTH tags. See the `tags` column per question below.

**Question count by tag (verbatim from bank):**
- `[CORE]` questions: 1, 2, 7, 8, 10, 12, 16 → **that is 7 marked CORE in the bank**; SKILL.md prose says "6 core questions" for Quick POV `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:71]`. See `net_new_flags` — the engineer must pick which 6 of the 7 [CORE]-tagged to render in the 6-question quick path, OR render all 7. RECOMMEND: render all 7 [CORE]-tagged questions; the "6" in prose predates Q16 being tagged CORE.
- `[ASYNC]` questions: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17 → **16 carry [ASYNC]**; SKILL.md prose says "12 selected questions (marked [ASYNC])" for Async Extract `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:57]`. See `net_new_flags`.

## A.1 — The 18-Question Bank (6 dimensions, verbatim)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:82-128]`

Render each as a card: `text` (verbatim, shown to member) + `extraction_target` (internal, what the synthesizer pulls) + `tags`. The `text` strings below are EXACT — do not paraphrase.

### Dimension 1 — Core Beliefs

| # | Question text (verbatim) | Extraction target | Tags |
|---|--------------------------|-------------------|------|
| 1 | "What do you believe about [your category] that most people in the industry would disagree with?" | Contrarian thesis, category POV | `[CORE]` `[ASYNC]` |
| 2 | "What's the biggest misconception in your market?" | Category framing, enemy definition | `[CORE]` `[ASYNC]` |
| 3 | "What's the one thing you wish every prospect understood before talking to you?" | Value prop seed, education gap | `[ASYNC]` |

### Dimension 2 — Taste Profile

| # | Question text (verbatim) | Extraction target | Tags |
|---|--------------------------|-------------------|------|
| 4 | "What companies do you admire (outside your category) and why?" | Aesthetic preferences, quality bar | `[ASYNC]` |
| 5 | "What does 'good' look like in your space? What does 'bad' look like?" | Quality standards, differentiation signals | `[ASYNC]` |
| 6 | "What trends do you think are overrated? Underrated?" | Contrarian taste, trend narrative | `[ASYNC]` |

### Dimension 3 — Hot Takes

| # | Question text (verbatim) | Extraction target | Tags |
|---|--------------------------|-------------------|------|
| 7 | "If you could make one bold prediction about your industry in 3 years, what would it be?" | Forward-looking thesis, category creation seed | `[CORE]` `[ASYNC]` |
| 8 | "What common practice in your industry do you think is fundamentally wrong?" | Contrarian content fuel, enemy identification | `[CORE]` `[ASYNC]` |
| 9 | "What would you say at a conference that would make half the audience uncomfortable?" | High-contrarian material, thought leadership edge | `[ASYNC]` |

### Dimension 4 — POV Clusters

| # | Question text (verbatim) | Extraction target | Tags |
|---|--------------------------|-------------------|------|
| 10 | "What are the 3-5 topics you want to be known as the expert on?" | Content pillar inputs, thought leadership anchors | `[CORE]` `[ASYNC]` |
| 11 | "When you go on a rant, what is it about?" | Passion topics, authentic content angles | `[ASYNC]` |
| 12 | "What keeps coming up in your sales calls that you feel uniquely qualified to address?" | Sales-content bridge, recurring pain points | `[CORE]` `[ASYNC]` |

### Dimension 5 — Anti-Taste

| # | Question text (verbatim) | Extraction target | Tags |
|---|--------------------------|-------------------|------|
| 13 | "What do you hate seeing in your industry? What practice makes you cringe?" | Contrarian boundaries, differentiation signals | `[ASYNC]` |
| 14 | "What advice is everyone giving that you think is wrong?" | Counter-narrative content, category foils | `[ASYNC]` |
| 15 | "What 'best practice' would you ban if you could?" | Strong contrarian positions, content differentiation | *(no tags — full-interview only)* |

### Dimension 6 — Origin & Experience

| # | Question text (verbatim) | Extraction target | Tags |
|---|--------------------------|-------------------|------|
| 16 | "What experience shaped your strongest belief about this space?" | Origin story, credibility anchor, belief foundation | `[CORE]` `[ASYNC]` |
| 17 | "What's the most expensive lesson you've learned in building this company?" | Hard-won insight, authenticity signal, vulnerability content | `[ASYNC]` |
| 18 | "If you were starting over today, what would you do completely differently?" | Evolved thinking, hindsight wisdom, forward-looking thesis | *(no tags — full-interview only)* |

**Warmup ordering rule (UX, verbatim from troubleshooting):** `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:267]` — "Start with Origin & Experience (Dimension 6) as warmup. Save Hot Takes for second half when trust is built." For the FULL interview, the recommended render order is Dimension 6 → 1 → 2 → 4 → 5 → 3 → 6(rest) → Hot Takes (3/9) last. For Quick POV the [CORE] subset can be asked in numeric order.

## A.2 — Automated Follow-Up Probe Engine

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:130-134]`

When an answer is generic, the AI interviewer fires ONE of these probes (verbatim). These are GLOBAL seed strings.

**The 4 probes (exact text):**

1. "Can you give me a specific example?"
2. "What happened that made you believe this?"
3. "Who specifically would disagree with you on this?"
4. "What did you try that didn't work before arriving at this view?"

**Generic-answer classifier rule (the trigger that fires a probe):**

> The skill's own rule is "use when answers are generic" `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:130]` and, in the troubleshooting section, "Use 'What happened that made you believe this?' to push past surface answers" `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:267]`. The KB does NOT define a quantitative classifier threshold. **Implementable deterministic rule (engineer-ready, derived from the skill's intent — see `net_new_flags`):** fire a probe when the transcribed answer meets ANY of:
> - **No concrete noun:** answer contains zero named tools, companies, frameworks, numbers, dates, or proper nouns (mirrors the Crawford "Specific" test signal).
> - **Hedge-only:** answer is dominated by hedging/abstraction ("it depends", "generally", "you know", "kind of", "stuff like that") with no example.
> - **Too short:** transcribed answer < ~30 words AND lacks a story marker (no "when", "one time", "we had a customer", "I remember").
> - **Restates the question:** answer paraphrases the prompt without adding a claim.
>
> Probe-selection logic: if the answer lacks an example → probe 1; if it states a belief with no origin → probe 2; if it is uncontroversial / lacks an opponent → probe 3; if it is conclusion-only with no journey → probe 4. **Cap: max ONE probe per question** (per skill prose "fires one of these probes"); if the probed answer is still generic, accept and flag the field for human follow-up (Mode B's "30-min follow-up call to drill into gaps" `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:60]`).

## A.3 — Crawford 4-Test Hot-Take Validation Gate

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:166-182]`

Run on EACH H-intensity hot take after the Hot Takes Library is produced. Deterministic pass/fail per test; verdict from the 4-bit score. This is the gate that "stops the app generating provocative-but-indefensible posts."

**The 4 tests (each returns boolean):**

| Test (enum) | Question (internal eval prompt) | Pass criteria (deterministic) |
|-------------|----------------------------------|-------------------------------|
| `counterintuitive` | "Would other practitioners reply 'Actually...'?" | Provokes disagreement or surprise |
| `specific` | "Can they name exact tools, frameworks, patterns?" | Has named, concrete components |
| `quantifiable` | "What's the before/after with numbers?" | At least one measurable metric |
| `demonstrable` | "Can they show this in 5 minutes?" | Artifact, demo, or case study exists |

**Scoring → verdict (deterministic, score = count of true tests, 0-4):**

| Score | Verdict (enum) | Action |
|-------|----------------|--------|
| `4/4` | `USE` | Use for positioning AND content pillars. Founder's strongest differentiation. |
| `3/4` | `PUSH` | Identify the missing dimension; push for it in a follow-up question. |
| `2/4` or below (`≤2`) | `INTERNAL_ONLY` | Internal belief only. Not ready for external content. Keep in extraction doc; do NOT build content pillars around it yet. |

**Interaction with Contrarian Intensity:** `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:182]` — A hot take can be H-intensity (provocative) but fail `specific` or `quantifiable` (emotionally resonant but not defensible). The 4-test catches this. **Store both** `contrarian_intensity` (H/M/L) AND `crawford` (4 booleans + verdict) on every hot take.

## A.4 — OBI (One Big Idea) 3-Test Gate

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:186-202]`

After Phase 2a deliverables, identify the meta-belief all other beliefs orbit.

**The 3 tests (ALL three must pass for a valid OBI):**

| Test (enum) | Question |
|-------------|----------|
| `unifies` | Does it connect the core beliefs into a coherent worldview? |
| `differentiates` | Does it set this founder apart from competitors? |
| `defines` | Does it define a new category or redefine how an existing category should be understood? |

**Process (deterministic steps):** `[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:195-200]`
1. List all core beliefs and hot takes.
2. Look for the underlying pattern — what connects them?
3. Draft the OBI as ONE sentence.
4. Test against the three criteria.
5. If no single OBI emerges → present 2-3 candidates with rationale; the founder chooses (UX: render a single-select picker).

**Pass rule:** OBI is VALID only if `unifies && differentiates && defines` all true. If any false → it's a belief, not the OBI `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:178]`. Output schema: `OBI Statement | How it unifies beliefs | Category implications | Positioning anchor`.

## A.5 — Synthesis Output Schemas (the 5 stored tables)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:140-212]` + `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:41-194]`. These define the MEMBER-table belief columns / child tables.

### A.5.1 — Core Beliefs Document (3-7 beliefs)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:144-149]`

```json
{
  "table": "member_beliefs",
  "layer": "MEMBER",
  "rows": "3-7",
  "fields": {
    "statement": "string — specific enough to disagree with",
    "evidence": "string — why the founder holds this (experience, data, customer stories)",
    "positioning_implication": "string — what this means for market category, messaging, differentiation",
    "contrarian_intensity": "enum: H | M | L"
  },
  "contrarian_intensity_definitions": {
    "H": "High — industry would actively push back; challenges a dominant practice or widely-held assumption; content using this generates debate",
    "M": "Medium — some practitioners would disagree; challenges a common but not universal practice; attracts engaged niche audiences",
    "L": "Low — directionally accepted but under-practiced; most nod but few do it; works for credibility-building not differentiation"
  }
}
```

### A.5.2 — Taste Profile (1 page)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:151-155]` + `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:76-105]`

```json
{
  "table": "member_taste_profile",
  "layer": "MEMBER",
  "fields": {
    "companies_admired": [{ "company": "string", "what_they_admire": "string", "why_it_matters_for_positioning": "string" }],
    "quality_bar": { "good": "string", "bad": "string" },
    "trend_assessments": [{ "trend": "string", "assessment": "enum: Overrated | Underrated", "reasoning": "string" }],
    "anti_taste_signals": ["string — practices they reject, norms they oppose, 'we will never do X' lines"]
  }
}
```

### A.5.3 — Hot Takes Library (5-10 statements)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:157-161]` + `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:113-119]`

```json
{
  "table": "member_hot_takes",
  "layer": "MEMBER",
  "rows": "5-10",
  "fields": {
    "statement": "string",
    "context": "enum: content-safe | sales-call-only",
    "risk_level": "enum: Low | Medium | High",
    "contrarian_intensity": "enum: H | M | L",
    "content_thread": "string — which recurring theme this feeds",
    "crawford": {
      "counterintuitive": "boolean",
      "specific": "boolean",
      "quantifiable": "boolean",
      "demonstrable": "boolean",
      "score": "int 0-4",
      "verdict": "enum: USE | PUSH | INTERNAL_ONLY"
    }
  },
  "note": "Run Crawford 4-test on H-intensity takes only (per A.3); store score+verdict on all."
}
```

### A.5.4 — POV Clusters (3-5 clusters)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:163-164]` + `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:127-138]`

```json
{
  "table": "member_pov_clusters",
  "layer": "MEMBER",
  "rows": "3-5",
  "fields": {
    "topic": "string",
    "thesis": "string — specific, falsifiable belief",
    "enemy": "string — what it argues against (a practice, mindset, or conventional wisdom)",
    "evidence": "string — data, customer stories, experience",
    "implication": "string — what the reader should DO differently",
    "content_formats": "string[] — LinkedIn posts, blog series, talk, podcast episode, etc.",
    "fletch_category": "string — e.g. 'Category 3 (POV & Insights)' or 'Cat 1-6 / Other'"
  }
}
```

### A.5.5 — OBI record

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:202]` + `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:171-180]`

```json
{
  "table": "member_obi",
  "layer": "MEMBER",
  "rows": "1 (or 2-3 candidates pending founder pick)",
  "fields": {
    "statement": "string — one sentence",
    "unifies": "string — how Beliefs 1-N are expressions of this single idea",
    "differentiates": "boolean / string rationale",
    "defines": "string — does this define a new category, redefine an existing one, or sharpen positioning",
    "category_implications": "string",
    "positioning_anchor": "string — how this becomes the through-line for all messaging",
    "test_unifies": "boolean",
    "test_differentiates": "boolean",
    "test_defines": "boolean",
    "is_valid": "boolean = unifies && differentiates && defines",
    "candidate_status": "enum: chosen | candidate"
  }
}
```

### A.5.6 — Belief-to-Content Thread Map (the per-person idea engine)

`[VERIFIED: .claude/skills/expert-pov-extractor/SKILL.md:204-212]` + `[VERIFIED: my-context-os/templates/expert-pov-extraction-template.md:184-194]`. This table converts a stored belief directly into a first-post angle and feeds the content calendar.

```json
{
  "table": "member_belief_content_threads",
  "layer": "MEMBER",
  "description": "Maps each belief, hot take, AND the OBI to actionable content threads. THE per-person idea engine.",
  "fields": {
    "source_ref": "string — 'Belief N' | 'Hot Take N' | 'OBI'",
    "content_thread_name": "string — recurring series name",
    "formats": "string[] — LinkedIn, blog, talk, podcast, etc.",
    "fletch_category": "string — Cat 3 (POV & Insights) / Cat 1-6",
    "first_post_angle": "string — the specific angle for the first piece"
  },
  "feeds": ["content strategy (Chain D, Phase 9)", "LinkedIn content planning (Chain M)", "content calendar"]
}
```

---

# PART B — Company Intake (ORG layer)

> **Layer:** ORG. Captures shared brand DNA, ICP, customer data, voice constraints, engagement parameters → `orgs` table + ORG child tables. Captured ONCE per org; all members inherit.
>
> **Design principle (verbatim):** `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:35]` — "We research the client's public surface (website, LinkedIn, Crunchbase, BuiltWith, G2, ad libraries) BEFORE any conversation. The intake form and calls focus exclusively on **internal truth** — customer data, what's actually working, why deals die, voice constraints, and engagement parameters. This positions us as prepared and respects the client's time."
>
> **Framing shown to user (verbatim):** `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:88]` — "We've already researched your company. These questions focus on things only you know — your customers, what's working, and what you need from us." Client time: ~15-20 minutes.
>
> **Form total (verbatim):** `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:315]` — "~45 questions, ~20 minutes."

## B.0 — Depth tagging legend (P0-quick vs deep)

For Choir, every intake question is tagged for which onboarding tier renders it:
- **`P0-quick`** = render in the minimal fast-start path. These are the load-bearing fields the deep-context spec calls out (Q1.2.1-1.2.7 customer truth + Q1.1.x basics) `[VERIFIED: brainstorms/content-os-app/deep-context-layer-architecture.md:142]` plus voice constraints. Without these, generation is generic.
- **`deep`** = render in the full org onboarding (numbers, competitive, engagement, tools). Valuable but not blocking for first-draft generation.

P0-quick set: §1.1 (all), §1.2 (all 7), §2.2.1-2.2.3 voice constraints (from discovery, B.2). Everything else = `deep`.

## B.1 — Intake Form (8 sections, ~45 questions, verbatim)

`[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:93-315]`

### Section 1.1 — The Basics (3 questions) · `P0-quick`

> Why we ask (verbatim): "This determines our entire analytical approach — whether we validate your ICP from customer data or build it from a dream customer list." `[VERIFIED: :107]`

| # | Question (verbatim) | Type | Options / notes |
|---|---------------------|------|-----------------|
| 1.1.1 | Company name (including parent company or legal entity if different from brand) | text | — |
| 1.1.2 | Website URL | url | seeds the research-first prefill (PART C) |
| 1.1.3 | Company stage | single-select | Pre-revenue / pre-launch (building, no paying customers yet) · Early revenue (1-20 customers, finding product-market fit) · Growth (20+ customers, scaling what works) · Established (mature product, optimizing) |

### Section 1.2 — Your Customers — The Internal Truth (7 questions) · `P0-quick`

> Section preamble (verbatim): "This is what no amount of research can tell us. Your customer data is the single most important input for everything we do." `[VERIFIED: :113]`

| # | Question (verbatim) | Type | Options / why-we-ask |
|---|---------------------|------|----------------------|
| 1.2.1 | Who do you believe your ideal customer is? (Describe the company type AND the person who buys — be as specific as you can.) | long-text | Why: "We'll compare your hypothesis against actual data. Most companies are partially wrong about their ICP — the gap between assumption and reality is where the value is." `[VERIFIED: :117]` |
| 1.2.2 | How many paying customers do you have today? | single-select | 0 (pre-revenue) · 1-5 · 6-20 · 21-100 · 100+ |
| 1.2.3 | Name your 5 BEST customers and what makes them great. (Biggest deals, fastest to close, most enthusiastic, lowest churn — whatever "best" means to you.) | long-text | Conditional: "Skip if pre-revenue. Instead answer 1.2.4." |
| 1.2.4 | If pre-revenue or early stage: List 10-30 companies you'd LOVE as customers. (Company names — we'll research the rest.) | long-text | Conditional on pre-revenue/early stage |
| 1.2.5 | Who is a TERRIBLE fit — even if they show interest? Describe companies or people you should NOT sell to. | long-text | Why: "Missing this answer cost a previous client 73 bad-fit leads in their pipeline. Your exclusion criteria are invisible to external research." `[VERIFIED: :134]` |
| 1.2.6 | What job titles or roles are involved in the buying decision? (Who discovers, who evaluates, who signs, who blocks?) | long-text | — |
| 1.2.7 | How do your potential customers currently solve the problem you address? (Not which competitor — what's their actual process today? Spreadsheets, manual work, a different tool, nothing?) | long-text | Why: "The real competitor is usually inertia or a manual process, not another software product. This shapes all our messaging." `[VERIFIED: :140]` |

### Section 1.3 — Your Internal Numbers (5 questions) · `deep`

> Section preamble (verbatim): "Revenue, deal size, and sales data that isn't publicly available." `[VERIFIED: :146]`

| # | Question (verbatim) | Type | Options |
|---|---------------------|------|---------|
| 1.3.1 | Revenue range | single-select | Pre-revenue · Under $100K ARR · $100K – $500K ARR · $500K – $2M ARR · $2M – $10M ARR · $10M+ ARR |
| 1.3.2 | Average deal size / contract value (if known) | text | optional |
| 1.3.3 | Typical sales cycle length (first contact to signed contract) | text | — |
| 1.3.4 | How do customers buy today? | single-select | Self-serve (sign up on website, no sales involved) · Sales-led (demo → proposal → contract) · Product-led growth (free trial → upgrade) · Hybrid · Not yet established |
| 1.3.5 | If your pricing is NOT on your website: What do you charge? (Tiers, amounts, model — per seat, usage-based, flat fee, etc.) | long-text | Conditional: "Skip if pricing is public — we've already captured it." |

### Section 1.4 — Product & Competitive Context (4 questions) · `deep`

> Section preamble (verbatim): "We'll research your competitors and pricing independently — but your perspective tells us what the data can't." `[VERIFIED: :175]`

| # | Question (verbatim) | Type | Options / why-we-ask |
|---|---------------------|------|----------------------|
| 1.4.1 | Who do you consider your top 3-5 competitors? (Names and websites. We'll expand this list through research, but we want to know who YOU think about.) | long-text | Why: "G2 and Capterra show category peers, but who you actually encounter in deals is often different. Your priority list shapes our battle cards and positioning." `[VERIFIED: :180]` |
| 1.4.2 | Why do customers choose YOU over those competitors? | long-text | — |
| 1.4.3 | Why do you LOSE deals? (To competitors, to "do nothing," to building in-house, etc.) | long-text | Why: "Win reasons are on your website. Loss reasons never are — and they're more valuable for messaging." `[VERIFIED: :185]` |
| 1.4.4 | If your pricing IS public: Is what's on your website accurate and current, or is there a gap between listed pricing and actual deal terms? | long-text | "(Optional — skip if not applicable.)" |

### Section 1.5 — What You've Tried (4 questions) · `deep`

> Section preamble (verbatim): "We can see WHAT channels you're active on. We can't see what's actually working." `[VERIFIED: :193]`

| # | Question (verbatim) | Type | Why-we-ask |
|---|---------------------|------|------------|
| 1.5.1 | What's working right now? (Channels, messages, tactics generating actual results — even small wins.) | long-text | — |
| 1.5.2 | What have you tried that did NOT work? (And if you know, why it failed.) | long-text | Why: "We refuse to repeat what's already been tried and failed. This is the most trust-building question in the form." `[VERIFIED: :199]` |
| 1.5.3 | If you've done outbound (email or LinkedIn DMs): Paste your 1-2 best email templates and share any response/conversion data you have. (Open rate, reply rate, meetings booked, sending volume.) | long-text | — |
| 1.5.4 | Where do you sell today, and where do you WANT to sell? (Geographic markets.) | long-text | — |

### Section 1.6 — The Engagement (6 questions) · `deep`

> Section preamble (verbatim): "What you need, how you work, and how we'll communicate." `[VERIFIED: :208]`
>
> **Choir note:** "The Engagement" / "Working Together" sections (1.6, 1.7) are agency-relationship framed in the source. For Choir self-serve, repurpose 1.6.1-1.6.3 (trigger/outcome/success-metric) as ORG goal capture; 1.6.4-1.6.6 + all of 1.7 are agency-only and OPTIONAL for the product (see `net_new_flags`).

| # | Question (verbatim) | Type | Options |
|---|---------------------|------|---------|
| 1.6.1 | What triggered this? Why now? | long-text | — |
| 1.6.2 | What is the #1 outcome you want from working together? | long-text | — |
| 1.6.3 | How will you measure success? (Pipeline generated, meetings booked, response rate, revenue, positioning clarity — whatever matters to you. Include targets if you have them.) | long-text | — |
| 1.6.4 | Timeline: When do you need first results? / Any hard deadlines? (Funding round, board meeting, launch date) | text (2 fields) | — |
| 1.6.5 | Budget range | single-select | Under $2,000/month · $2,000 – $5,000/month · $5,000 – $10,000/month · $10,000+/month · Project-based (total: $____) · Prefer to discuss |
| 1.6.6 | Have you worked with GTM agencies/consultants before? What was the experience — what worked, what didn't? | long-text | — |

### Section 1.7 — Working Together (5 questions) · `deep` (agency-only; OPTIONAL for Choir)

| # | Question (verbatim) | Type | Options |
|---|---------------------|------|---------|
| 1.7.1 | Primary contact: Name / Title-Role / Email | text (3 fields) | — |
| 1.7.2 | Decision authority | single-select | I make all decisions · I make most, but need approval on budget/strategy from: ____ · I'm project lead but final decisions come from: ____ · Multiple stakeholders — let me explain: ____ |
| 1.7.3 | Preferred communication channel | single-select | Slack · Email · WhatsApp · Teams · Other: ____ |
| 1.7.4 | How do you prefer to receive updates and deliverables? | single-select | Short bullet summaries · Detailed documents · Visual presentations / slides · Loom walkthroughs · Depends on topic |
| 1.7.5 | What language should deliverables be in? | single-select | English · Croatian · Other: ____ · Mixed — explain: ____ |

### Section 1.8 — Tools, Data & Assets (7 questions) · `deep`

> Section preamble (verbatim): "This determines how data-driven our work can be and what we have to work with." `[VERIFIED: :269]`

| # | Question (verbatim) | Type | Options / why-we-ask |
|---|---------------------|------|----------------------|
| 1.8.1 | CRM system | single-select | HubSpot · Salesforce · Pipedrive · Attio · Spreadsheet / no CRM · Other: ____ |
| 1.8.2 | Can you provide a CRM export? (Customer list with deal size, close date, industry, contact titles — CSV or similar.) | single-select | Yes, easily · Yes, but it'll take work to clean · Not possible. Why: "Our entire Phase 1 analysis depends on this. If export isn't possible, we'll use the dream-customer approach instead." `[VERIFIED: :285]` |
| 1.8.3 | Do you record sales calls? If so, which tool and how many recordings are available? | single-select + count | Gong / Fathom / Fireflies / Otter.ai — approximately ____ calls available · Zoom/Teams recording only — approximately ____ calls · No call recording |
| 1.8.4 | What sales and marketing tools do you use day-to-day? (e.g., Clay, Apollo, Sales Navigator, Instantly, Lemlist, Mailchimp, Google Analytics, Mixpanel — list what you actually use, not what you've signed up for.) | long-text | Why: "We detect some tools via BuiltWith, but what you actually USE daily vs. what's installed are different things. This prevents us from recommending tools you already have." `[VERIFIED: :296]` |
| 1.8.5 | Are you willing to grant us access to relevant tools? (CRM, email platform, analytics — read-only is fine for most.) | single-select | Yes · Limited / case-by-case · Prefer to discuss |
| 1.8.6 | Do you have brand assets you can share? (Logo files, brand colors as hex codes, fonts, brand guidelines PDF.) | single-select | Yes — I'll share them · We have some basics (logo) but no formal guidelines · No brand assets exist yet |
| 1.8.7 | Do you have existing strategy or positioning documents? (ICP definitions, messaging frameworks, pitch decks, market research — anything internal.) | single-select | Yes — I'll share them · Some scattered docs · Nothing formal |

**Section count check:** 1.1(3) + 1.2(7) + 1.3(5) + 1.4(4) + 1.5(4) + 1.6(6) + 1.7(5) + 1.8(7) = **41 numbered items across 8 sections** ("~45" includes multi-field sub-questions like 1.6.4 timeline 2-field, 1.7.1 contact 3-field). `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:315]`

## B.2 — Discovery Call Script (deep, narrative extraction) · `deep` (+ 2.2.1-2.2.3 are `P0-quick` for voice)

`[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:319-378]`

> Goal (verbatim): "Stories, not data. We want narratives of real conversations, real deals, real failures. The form gives us facts; the call gives us the human layer that makes messaging authentic." Duration 45-60 min. Rule: "Don't re-ask anything they already answered well." `[VERIFIED: :323-324]`

### 2.1 — Deal Stories & Pain (core — spend 20 min here)

| # | Question (verbatim) | Reveals (extraction target) |
|---|---------------------|----------------------------|
| 2.1.1 | "Walk me through your last 2-3 deals — from first contact to close. What happened?" | actual sales process, buying committee dynamics, bottlenecks, deal velocity |
| 2.1.2 | "What's the 'aha moment' — when does a new customer realize the value?" | core transformation in experiential terms, activation trigger |
| 2.1.3 | "What's the most common reason people say NO or go silent?" | real objections, deal-killers, competitive dynamics |
| 2.1.4 | "If I asked your best customer 'why did you choose them?' — what would they say, in THEIR words?" | differentiators in customer language, not marketing language |
| 2.1.5 | "What gets prospects most excited during conversations or demos?" | strongest hook, what to lead with in outbound |
| 2.1.6 | "What triggers someone to start looking for a solution like yours? What event or frustration makes them go from 'fine' to 'I need to fix this'?" | buying triggers, signal-based outbound timing |
| 2.1.7 | "Any seasonal patterns? When do budgets get approved? When do projects kick off?" | campaign timing, budget cycles |

### 2.2 — Voice & Constraints (10 min) · 2.2.1-2.2.3 are `P0-quick`

| # | Question (verbatim) | Reveals / note |
|---|---------------------|----------------|
| 2.2.1 | "Are there words or phrases you always use? Anything you NEVER want to say?" | language bank, vocabulary constraints, anti-slop rules. **Choir: feeds the negative-signal / phrases-to-never-say voice column.** |
| 2.2.2 | "What's a strong opinion you hold about your industry that most people would disagree with?" | expert POV, thought leadership angles, category beliefs. **Signal detector (verbatim):** "If this answer is rich and surprising, schedule the full Expert POV extraction session." `[VERIFIED: :360]` — **THIS IS THE BRIDGE from company intake (PART B) into the belief interview (PART A).** |
| 2.2.3 | "Is there anything we should absolutely NOT do? Any channels, messages, or approaches that are off-limits?" | hard constraints, brand restrictions, past bad experiences. (Example: "ZendIT had an anti-AI constraint that affected all messaging — invisible until asked.") |
| 2.2.4 | "What does your internal approval process look like for external-facing content or outreach?" | feedback loop speed, bottlenecks, who signs off |

### 2.3 — Data Reality Check (5 min)

| # | Question (verbatim) | Reveals |
|---|---------------------|---------|
| 2.3.1 | "If I asked for a list of all your customers with deal size and close date — how quickly could you actually get that?" | real data readiness vs. form claim. If "weeks"/"complicated" → adjust Phase 1 expectations |
| 2.3.2 | "Is there anyone else on your team we should involve? Who else touches sales, marketing, or customer success?" | hidden stakeholders, potential blockers |

## B.3 — Deep-Dive Workshop Script (deep) · `deep`

`[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:415-487]`. Mines context only extended conversation reveals. Optional for self-serve Choir; high-value for assisted onboarding.

### 4.1 — Dream Customer Exercise (10 min)

| # | Question (verbatim) | Reveals |
|---|---------------------|---------|
| 4.1.1 | "If you could only have 10 customers this year — which specific companies? Name them and tell me why each one." | aspiration-backed ICP, unstated priorities |
| 4.1.2 | "Name 3 companies that LOOK like great customers on paper but actually wouldn't be. Why not?" | anti-persona refinement, hidden disqualification criteria |

### 4.2 — Real Conversation Mining (20 min — "the single most valuable section")

| # | Question (verbatim) | Reveals |
|---|---------------------|---------|
| 4.2.1 | "Tell me about your last sales conversation — narrate it like a movie. What did you say, what did they say, what happened?" | natural pitch, real objection flow, pain language in context |
| 4.2.2 | "When prospects describe their situation before your product, what words do they use? Can you recall specific phrases?" | verbatim customer language — raw material for authentic outbound and copy |
| 4.2.3 | "What's the most surprising thing a customer or prospect has ever said about your product or market?" | positioning angles invisible to research, unexpected use cases |
| 4.2.4 | "Tell me about a deal that died. What happened? Where exactly did it fall apart?" | specific failure points, structural blockers, timing issues |

### 4.3 — Credibility Mining (10 min)

| # | Question (verbatim) | Reveals |
|---|---------------------|---------|
| 4.3.1 | "What's YOUR background? How did you end up building this?" | founder story, domain credibility, trust-building assets |
| 4.3.2 | "Anyone on the team with deep domain expertise that would make customers trust you more?" | credibility assets matchable to specific personas |
| 4.3.3 | "Any notable customers, partnerships, awards, or certifications?" | social proof inventory (NDA'd logos and informal wins are invisible) |

### 4.4 — Market Reachability (10 min)

| # | Question (verbatim) | Reveals |
|---|---------------------|---------|
| 4.4.1 | "Where do your target customers hang out? LinkedIn, industry forums, Slack communities, conferences, trade publications?" | channel opportunities, community-based outbound |
| 4.4.2 | "Are your targets easy to find and reach? Can you find them on LinkedIn? Are their emails available?" | data reachability (if 49%+ of TAM unreachable, GTM approach changes) |
| 4.4.3 | "What industry events or conferences matter in your space?" | timing triggers, event-based outbound |

### 4.5 — Compliance & Legal (5 min)

| # | Question (verbatim) | Reveals |
|---|---------------------|---------|
| 4.5.1 | "Any legal, regulatory, or compliance constraints we need to know about? (GDPR specifics, industry regulations, data handling rules)" | outbound compliance, content disclaimers, data scope limits |

## B.4 — Question → System Mapping (which ORG fields each section populates)

`[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:557-572]`

| Intake Section | Feeds Into (ORG model) |
|----------------|------------------------|
| 1.1 Basics (stage) | Phase 1 approach routing, engagement scoping |
| 1.2 Customers (ICP, best/worst, buyer roles, status quo) | ICP frameworks, persona-development, targeting |
| 1.3 Numbers (revenue, ACV, cycle, GTM motion, pricing) | Pricing strategy, pipeline estimation, segment scoring |
| 1.4 Product & competitive (competitors, win/loss, pricing gap) | Battle cards, positioning, competitive-research |
| 1.5 GTM history (working/not working, outbound, geo) | Channel strategy, outbound-optimizer |
| 1.6 Engagement (trigger, goals, metrics, timeline, budget) | Scoping, quality gates, success criteria |
| 1.7 Working together (contact, authority, comms, language) | Contacts, delivery format, content language |
| 1.8 Tools, data & assets (CRM, calls, tools, brand, strategy docs) | Data readiness gate, voice extraction |
| Discovery call (deal stories, objections, triggers, voice) | Personas, messaging, objection library, voice-style-guide |
| Verification session (positioning, competitors, ICP, tech) | Corrected ICP, battle cards, competitive analysis |
| Workshop (dream customers, conversation mining, credibility) | Pain hierarchy, language bank, outbound credibility, anti-persona |

---

# PART C — Research-First Auto-Prefill Recipe (ORG layer, pre-form)

> **Doctrine (verbatim):** `[VERIFIED: brainstorms/content-os-app/deep-context-layer-architecture.md:129]` — the system "auto-researches the public surface BEFORE asking the founder anything, then the interview asks only internal truth." This is the onboarding differentiator. Member/org NEVER answers what the URL can answer.
>
> **UX pattern (the un-inventable-specifics rule):** `[VERIFIED: brainstorms/content-os-app/deep-context-layer-architecture.md:106]` — pre-fill each question with an AI best-guess from research; leave a `→YOU ADD` blank ONLY where a checkable specific (real story, real number, verbatim message) can't be invented. Those un-inventable specifics are what no competitor captures.

## C.1 — Trigger

Input: **Company URL** (intake Q1.1.2). Optional: company name (extracted from URL if absent), context/purpose, our-product-positioning. `[VERIFIED: .claude/skills/icp-research/SKILL.md:26-30]`

## C.2 — Fetch plan (URL → public sources, parallel batches)

`[VERIFIED: .claude/skills/icp-research/SKILL.md:45-63]` + `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:54-68]`

**Batch 1 (immediate):**
| Fetch | Tool | Pulls |
|-------|------|-------|
| `[url]` homepage | WebFetch | positioning, value prop, CTA, social proof |
| `[url]/about` | WebFetch | founding, team, mission, investors |
| `[url]/pricing` | WebFetch | tiers, models, price points |

**Batch 2 (parallel):**
| Fetch | Tool | Pulls |
|-------|------|-------|
| `[url]/product` or `/features` or `/platform` | WebFetch | capabilities |
| `[url]/customers` or `/case-studies` | WebFetch | named customers, outcomes |
| `[url]/integrations` | WebFetch | tech ecosystem |

**Batch 3 (semantic search):**
| Query (verbatim) | Tool | type |
|------------------|------|------|
| "[company] customers case studies testimonials" | `mcp__exa__web_search_exa` | auto |
| "[company] funding round investors" | `mcp__exa__web_search_exa` | auto |
| "[company] target market ideal customer" | `mcp__exa__web_search_exa` | neural |

**Additional public-surface sources (from intake Phase 0 research table):** `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:54-68]`
| What | Source |
|------|--------|
| Industry, vertical, category | Website + G2/Capterra category listings |
| Team size, headcount | LinkedIn company page |
| Founding date, HQ, geography | LinkedIn + Crunchbase |
| Funding history, investors, rounds | Crunchbase |
| Published pricing + tiers | Pricing page (+ Wayback Machine for history) |
| Front-end tech stack | BuiltWith / Wappalyzer |
| Competitor landscape | G2 "Compared to" sidebar, Capterra alternatives, Google "[product] vs" |
| Active paid ads | Meta Ad Library, Google Ads Transparency, LinkedIn Ad Library |
| Content footprint | LinkedIn company page, founder posts, blog frequency, YouTube |
| Public reviews + sentiment | G2, Capterra, Product Hunt, app store reviews |
| Founder backgrounds | LinkedIn profiles, about page, press, podcasts |
| Job postings (stack + hiring signals) | LinkedIn Jobs, careers page |
| Employer reputation | Glassdoor rating + cons themes, Blind |

## C.3 — Prefill map (which research output prefills which intake field)

Each prefilled field carries `value`, `source` (citation tag), `confidence` (level). The user VERIFIES (research-verification phase). Fields marked DO-NOT-PREFILL are the un-inventable internal-truth specifics.

| Intake field | Prefill from | Prefillable? |
|--------------|--------------|--------------|
| 1.1.1 Company name | URL / homepage / about | YES (high) |
| 1.1.2 Website URL | (input) | given |
| 1.1.3 Company stage | funding + headcount + customer-page maturity → inferred | YES (low/medium — flag for confirm) |
| 1.2.1 ICP hypothesis | customers/case-studies + "target market" search → DRAFT only | PARTIAL — present AI draft, `→YOU ADD` the real internal ICP |
| 1.2.2 # paying customers | customers page count (floor only) | NO — internal truth, DO-NOT-PREFILL |
| 1.2.3 5 best customers | (cannot know "best") | NO — DO-NOT-PREFILL (`→YOU ADD`) |
| 1.2.4 Dream customers | (aspiration) | NO — DO-NOT-PREFILL (`→YOU ADD`) |
| 1.2.5 Terrible-fit / anti-ICP | (invisible to research) | NO — DO-NOT-PREFILL — explicitly "invisible to external research" `[VERIFIED: intake:134]` |
| 1.2.6 Buyer roles/titles | personas from case studies + JD analysis → DRAFT | PARTIAL — AI draft, confirm |
| 1.2.7 Status-quo / how they solve today | inferred from positioning ("replaces X") → DRAFT | PARTIAL |
| 1.3.x Internal numbers | pricing (if public) for 1.3.5 only | 1.3.5 PARTIAL (public pricing); 1.3.1-1.3.4 NO — DO-NOT-PREFILL |
| 1.4.1 Competitors | G2 "Compared to", Capterra alternatives, "[product] vs" → DRAFT shortlist | YES (medium) — user reprioritizes |
| 1.4.2 Why chosen | homepage differentiators → DRAFT | PARTIAL |
| 1.4.3 Why lose deals | (never public) | NO — DO-NOT-PREFILL — "Loss reasons never are" `[VERIFIED: intake:185]` |
| 1.5.x What you've tried | ad libraries + content cadence (channels active) → DRAFT for 1.5.1 channels | PARTIAL — channels yes, "what's WORKING" no |
| 1.8.1 CRM / 1.8.4 tools | BuiltWith front-end detect → DRAFT (front-end only) | PARTIAL — "BuiltWith detects front-end only; what they USE vs installed differs" `[VERIFIED: intake:296,595]` |
| 1.8.6 Brand assets | logo/colors scrape from site → DRAFT (hex, logo) | PARTIAL — formal guidelines NO |
| Voice (HOW they sound) | scrape member LinkedIn posts → present for member to pick 3-5 most authentic | YES (bootstraps prose-samples) `[VERIFIED: deep-context:106]` |

## C.4 — Source + confidence tagging (per prefilled field)

`[VERIFIED: .claude/skills/icp-research/SKILL.md:122-142]`. Every prefilled value gets TWO tags.

**Citation tag (source traceability):**
| Tag | Meaning |
|-----|---------|
| `[VERIFIED: URL]` | confirmed from primary source |
| `[COMPANY-STATED]` | from the researched company's own materials |
| `[INFERRED: source1 + source2]` | derived from multiple signals |
| `[UNVERIFIABLE]` | no source available |
| `[STALE: accessed YYYY-MM-DD]` | data older than freshness threshold |

**Confidence level (reliability):**
| Level | Sources |
|-------|---------|
| High | official website, press release, SEC filing, named case study with URL |
| Medium | G2/Capterra reviews, credible reporting (TechCrunch/Forbes), company blog |
| Low | single Reddit comment, blog mention, job-posting inference, social-media claim |

**Staleness rules (deterministic):** `[VERIFIED: .claude/skills/icp-research/SKILL.md:136-139]`
- Company website data > 90 days old → `[STALE]`
- Pricing data > 30 days old → `[STALE]`
- Review data > 90 days old → downgrade confidence to Medium max

**Field/record confidence rollup:** `[VERIFIED: .claude/skills/icp-research/SKILL.md:141-142]`
- Section-level = majority confidence level of its data points.
- Report-level = High if 8+ sections High/Medium; Medium if 5-7; Low if <5.

**Anti-fabrication gate (enforce on prefill):** `[VERIFIED: .claude/skills/icp-research/SKILL.md:174,185-186]` — Every number traces to a source URL or is tagged `[UNVERIFIABLE]`. Never invent TAM/market sizes/pricing. If "Contact Sales", record that exactly. Tag company's own claims `[COMPANY-STATED]` (not independent verification). Single low-authority source → `[NEEDS CORROBORATION]` + attempt a second search.

**Minimum quality threshold to proceed:** `[VERIFIED: .claude/skills/icp-research/SKILL.md:71]` — at least 5 of 12 ICP sections must have High/Medium confidence before synthesis.

## C.5 — Verification handoff (research → user confirm)

After prefill, the research-verification step presents findings for correction (maps to intake Phase 3). `[VERIFIED: my-context-os/09-agency/processes/client-onboarding-intake-form.md:380-411]` Present: product/positioning summary, competitor shortlist, detected tech stack, ICP hypothesis, public review themes, ad/content activity — user reacts ("What's missing? What's wrong?"). The single most expensive error to catch here is wrong ICP (the ZendIT BOP exclusion = 73 wasted leads) `[VERIFIED: intake:403]`.

---

## Appendix — Engineer build notes

- **GLOBAL seed tables** (ship in `global_library` migration, app-wide read-only): `pov_question_bank` (18 rows, A.1), `pov_probe_engine` (4 rows, A.2), `crawford_tests` (4 rows + scoring map, A.3), `obi_tests` (3 rows, A.4), `contrarian_intensity_defs` (3 rows, A.5.1), `intake_question_bank` (~45 rows, B.1), `discovery_call_bank` / `workshop_bank` (B.2-B.3), `prefill_recipe` (C.2-C.4 source/confidence maps).
- **MEMBER answer tables** (org_id FK via member): `member_beliefs`, `member_taste_profile`, `member_hot_takes`, `member_pov_clusters`, `member_obi`, `member_belief_content_threads`, plus raw `member_interview_transcripts` (async record→transcribe source).
- **ORG answer tables:** `org_intake_answers` (keyed to intake_question_bank), `org_icp`, `org_competitors`, `org_voice_constraints` (from 2.2.1-2.2.3), `org_research_prefill` (with source+confidence per field).
- **Bridge wiring:** intake Q2.2.2 "rich and surprising" → trigger the full PART A POV interview. Make this an explicit state transition.
- **Generation precondition (hard stop):** `[VERIFIED: brainstorms/content-os-app/deep-context-layer-architecture.md:303]` — generation refuses to run until the member's voice source AND universal anti-slop are loaded. Surface a "complete your voice interview" empty state instead of generating generic output.

---

*Extracted verbatim from 4 KB sources. All question text, probe strings, gate definitions, enums, and thresholds are exact lifts. Derived/net-new items (deterministic probe-classifier thresholds, P0/deep depth tags, Choir layer assignments) are flagged in the manifest's net_new_flags. Companion: `brainstorms/content-os-app/deep-context-layer-architecture.md`.*

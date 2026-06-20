# Choir — Canonical Context Data Model (Backend Build Spec)

> The schema the whole app is built on. An engineer builds the backend directly from this spec.
> Every field carries its **type** and a **source path:line** so the value is traceable.
> Enum values referenced here (e.g. `pain_severity`, `contrarian_intensity`) are defined as DB CHECK-constraint lists in the sibling file `dimension-enums.json` — this doc references them by name and does NOT re-list the members.
>
> **Generated:** 2026-06-20
> **Companion:** `./dimension-enums.json` (all controlled vocabularies)

---

## 0. The 3-Layer Split (non-negotiable architecture)

Choir splits all context into three layers. This is a direct lift from the deep-context architecture doc, which mirrors the KB's L1 / L2-org / L2-member voice layering.
`[VERIFIED: brainstorms/content-os-app/deep-context-layer-architecture.md:161-269]`

> **LOGICAL vs PHYSICAL names (read this first):** §0-§2 of this doc use **logical** layer-model entity names (the `org_*` / `member_*` prefixed conceptual rows, plus logical seed names like `hooks` / `body_templates`). The **canonical PHYSICAL table names that an engineer creates** live in `db-schema.sql` and `feed-schema.sql`; the **`global_library_*` physical seed-table names** are catalogued in §3 below. The most-load-bearing physical mappings (post-reconciliation, R-G2/G5/decisions 1+7): logical `org_brand_dna` → physical **`brand_dna`**; logical `member_voice_dna`/`member_voice_profile` → physical **`voice_profiles`**; logical "drafts" → physical **`posts`** (status-scoped); logical `org_personas` → physical **`personas`**; logical seed `hooks`/`frameworks`/`body_templates`/`cta_patterns` → physical `global_library_hooks`/`_frameworks`/`_body_templates`/`_ctas`. Identity PKs are `orgs(org_id)` / `members(member_id)` (db-schema canonical). `feed_profiles` + `feed_posts` are defined ONCE, in `feed-schema.sql` (which loads after db-schema.sql).

| Layer | Table(s) | Scope | Writable by | Source |
|-------|----------|-------|-------------|--------|
| `global_library` | `hooks`, `frameworks`, `body_templates`, `cta_patterns`, `power_words`, `proven_posts`, `interview_questions` (+ DM/comment/anti-slop tables — see §3 for the full physical `global_library_*` list) | App-wide, read-only to all orgs — the reusable seed knowledge | App admins only; orgs reference, never mutate | `deep-context-layer-architecture.md:167-171` (`[VERIFIED split: NulaOne/README.md:408-419]`) |
| `org` | `orgs` + child rows (`org_segments`, `org_personas`, `org_pains`, `org_buying_signals`, `org_competitors`, `org_brand_dna`, `org_learnings`) — physical: `personas`, `pains`, `buying_signals`, `brand_dna`, ... | One per customer org — shared brand DNA + ICP every member inherits | Org admins | `deep-context-layer-architecture.md:175-218` |
| `member` | `members` + child rows (`member_prose_samples`, `member_core_beliefs`, `member_hot_takes`, `member_pov_clusters`, `member_belief_content_map`) — physical: `voice_profiles`, `prose_samples`, `beliefs`, `expert_pov` | One per person in an org — voice + beliefs, distinct per member | The member + org admin | `deep-context-layer-architecture.md:220-263` |

**Relationship (explicit):**
- `members.org_id` → `orgs.org_id` (FK, **NOT NULL**). Every member belongs to exactly one org. `[VERIFIED: deep-context-layer-architecture.md:222, :329]`
- `orgs` reference `global_library` rows by id (e.g. `member_belief_content_map.framework_id` → `frameworks.id`). **Org content references global; global never references org.** `[VERIFIED: deep-context-layer-architecture.md:269]`
- `members.persona_ref` → one `org_personas.persona_id` within the SAME org — "which org persona this member writes TO" (register modulation). `[VERIFIED: deep-context-layer-architecture.md:262]`

**Isolation invariant (enforce at the query layer, not the UI):** every read/write carries `org_id` from the session; cross-`org_id` access is rejected server-side. Member voice never bleeds into another member's; shared brand DNA loads as the layer underneath each member's voice. `[VERIFIED: deep-context-layer-architecture.md:267]`. Ports the canonical KB rule *"Client voice NEVER mixes with owner voice"* `[VERIFIED: .claude/voice-dna/LOADING-PROTOCOL.md:153]`.

**Index-not-summary discipline:** the org record points to canonical source files / index rows; it never denormalizes them into a summary that drifts. `[VERIFIED: deep-context-layer-architecture.md:269]`.

---

## 1. `org` — Company-Context Object (org layer)

The org record is the 12-section company-context/ICP schema, **trimmed to what a content engine needs** (keep §4 Segments, §5 Personas, §6 Pains, §7 Buying Signals, §9 Competitors, §11 Content Signals; drop deep TAM/committee depth). Every sourced field carries `source` + `confidence`. `[VERIFIED schema: .claude/skills/icp-research/references/output-template.md:7-90; trimming decision: deep-context-layer-architecture.md:184-185]`

### 1.1 `orgs` (root)

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `org_id` | uuid (PK) | NOT NULL | deep-context:176 |
| `company` | text | NOT NULL, `[SOURCE]`-tagged | output-template.md:9; deep-context:178 |
| `url` | text | | output-template.md:10; deep-context:179 |
| `stage` | text | CHECK ∈ `stage` (see enums; net-new ladder) | deep-context:180 (intake Q1.1.3) |
| `product_category` | text | | output-template.md:12; deep-context:181 |
| `generated` | date | | output-template.md:11 |
| `sections_populated` | smallint | 0–12 | output-template.md:13 |
| `overall_confidence` | text | CHECK ∈ `confidence_level` | output-template.md:14 |
| `confidence_breakdown_high` | int | | output-template.md:16 |
| `confidence_breakdown_medium` | int | | output-template.md:17 |
| `confidence_breakdown_low` | int | | output-template.md:18 |
| `staleness_flags` | int | computed from `staleness_rule` | output-template.md:19; dimension-schemas.md:181-185 |
| `needs_corroboration` | int | | output-template.md:20 |
| `one_line_positioning` | text | `[COMPANY-STATED]` | output-template.md:45 |

**Company Overview firmographics** (output-template.md §1, lines 37-43) — store on `orgs` or a 1:1 `org_overview` row, each as `{value, source, confidence}` triples:
`industry` (→ `industry_level_1` enum), `founded`, `hq_location`, `company_size` (→ `company_size_band`), `funding`, `business_model` (→ `business_model` enum), `revenue_range`. `[VERIFIED: output-template.md:37-43]`

### 1.2 `org_segments` (org.icp.segments[]) — §4 ICP Segments

`[VERIFIED: output-template.md:107-150; deep-context:189]` — composes 3 frameworks: Attribute-Based, Theme-Based, ICP-Paragraph.

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `segment_id` | uuid (PK) | | derived |
| `org_id` | uuid (FK→orgs) | NOT NULL | isolation key |
| `name` | text | | output-template.md:144 |
| `priority` | text | CHECK ∈ `segment_priority` (PRIMARY/HIGH/SECONDARY) | output-template.md:138-140 |
| `acv_estimate` | text | | output-template.md:136 |
| `evidence_url` | text | | output-template.md:137 |
| `confidence` | text | CHECK ∈ `confidence_level` | output-template.md:137 |
| `icp_paragraph` | text | "best for / who are / focus on / struggling to" fill-in | output-template.md:132 |
| `priorities` | text | | output-template.md:146 |
| `icp_fit` | text | | output-template.md:147 |
| `budget_sales_cycle` | text | | output-template.md:148 |
| `unique_approach` | text | | output-template.md:149 |
| `proof_points` | text | | output-template.md:150 |

**`org_segments.attributes[]`** (Attribute-Based ICP, output-template.md:115-120) — child rows `{attribute ∈ [Firmographics, Situation, Organization, Technology], description, observable_signals, weight ∈ icp_attribute_weight}`.

**`org_segments.themes[]`** (Theme-Based ICP, output-template.md:124-128) — child rows `{theme (Adjective+Noun), what, why, evidence_url}`.

**Firmographic sub-fields used as targeting constraints** (these resolve to enums): `size_band` → `company_size_band`; `industry_l1` → `industry_level_1`; `hq_region` → `geo_region`; `geographic_focus` → `geographic_focus`. `[VERIFIED: dimension-schemas.md:11-19, 31-52, 64-80]`

### 1.3 `org_personas` (org.icp.personas[]) — §5 Buyer Personas (8-Component Blueprint)

The 8-component persona blueprint. `[VERIFIED: persona-development-playbook.md:78-202; output-template.md:154-212; deep-context:190]`. Each persona is one row + child tables. `members.persona_ref` points at one of these.

| Field | Type | Constraint / Enum | Source (persona-playbook unless noted) |
|-------|------|-------------------|--------|
| `persona_id` | uuid (PK) | | derived |
| `org_id` | uuid (FK→orgs) | NOT NULL | isolation key |
| `name` | text | | output-template.md:160 |
| `buying_role` | text | CHECK ∈ `buying_committee_role` | output-template.md:160; playbook:255-266 |
| **Component 1 — Identity Profile** | | | playbook:82-94 |
| `title_patterns` | text[] | all variations (exact title match misses 40-60%) | playbook:88, :92 |
| `seniority_band` | text | CHECK ∈ `seniority_band` | playbook:90; dimension-schemas.md:90-96 |
| `department` | text | | playbook:90 |
| `reports_to` | text | | playbook:91 |
| `team_size` | text | | playbook:92 |
| `tenure` | text | ("new in role" trigger relevance) | playbook:93 |
| `linkedin_keywords` | text[] | headline/About phrases | playbook:94 |
| **Component 5 — Buying Behavior** | | | playbook:156-165 |
| `research_style` | text | G2/peers/LinkedIn/events | playbook:159 |
| `decision_speed` | text | days-weeks / months | playbook:160 |
| `risk_tolerance` | text | early adopter / show-me-case-study | playbook:161 |
| `champion_or_buyer` | text | signs check / sells internally | playbook:162 |
| `objection_pattern` | text | | playbook:163 |
| `preferred_channel` | text | email/LinkedIn DM/phone/in-person | playbook:164 |
| `meeting_format` | text | 15-min intro / 30-min demo / 60-min deep dive | playbook:165 |

Child tables of `org_personas`:

- **Component 2 — `persona_day_in_life[]`** `{time_block, activity, frustration, opportunity}` `[VERIFIED: playbook:96-105]`
- **Component 3 — `persona_pain_hierarchy[]`** `{rank ∈ pain_severity (P1-P5), category, specific_pain, urgency ∈ pain_urgency_label, budget_authority, weekly_trigger (REQUIRED — see §1.4 gate)}` `[VERIFIED: playbook:107-141]`
- **Component 4 — `persona_motivations[]`** `{type ∈ [Career, Team, Recognition, Control, Efficiency], what_they_want, how_to_reference}` `[VERIFIED: playbook:143-153]`
- **Component 6 — `persona_language_bank[]`** `{category ∈ [Problem, Goal, Frustration, Success, Evaluation], their_language (verbatim), not_your_language, source_url}` `[VERIFIED: playbook:167-179; output-template.md:188-195]`
- **Component 7 — `persona_anti_signals[]`** (disqualifiers) `{signal, why_dq}` `[VERIFIED: playbook:181-192; output-template.md:206-210]`
- **Component 8 — `persona_competitive[]`** `{category ∈ [Direct, Indirect, Status Quo, Internal Build], description, positioning_approach}` `[VERIFIED: playbook:194-201]`

**Machine-readable scoring fields** (for the multi-persona pipeline scoring layer — persona becomes a runtime scoring step): `title_patterns` (exact + regex), `seniority_band`, department keywords, industry verticals, pain-point keywords (from language bank), disqualifier signals (from anti-persona), buying triggers. `[VERIFIED: persona-development-playbook.md:360-369]`

### 1.4 `org_pains` (org.icp.pains[]) — §6 aggregate Pain library + the Pain Validation Gate

The content-engine pain record (deep-context trims §6 to a flat visceral pain list). `[VERIFIED schema: deep-context-layer-architecture.md:191-201; output-template.md:216-241]`

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `pain_id` | uuid (PK) | | derived |
| `org_id` | uuid (FK→orgs) | NOT NULL | isolation key |
| `segment` | text | | deep-context:193 |
| `pain` | text | NOT NULL — visceral, dated (e.g. "hunched over a spreadsheet ringing late-payers") | deep-context:194 |
| **`weekly_trigger`** | text | **NOT NULL — REQUIRED. Pain Validation Gate (see below).** | deep-context:195; playbook:119-141 |
| `severity` | text | CHECK ∈ `pain_severity` (P1-P5) | deep-context:196; dimension-schemas.md:159-165 |
| `message_angle` | text | | deep-context:197 |
| `affected_personas` | uuid[] | FK → org_personas | output-template.md:222 |
| `source` | text | e.g. "Q1.2 / Reddit-mined" | deep-context:198 |
| `confidence` | text | CHECK ∈ `confidence_level` + staleness | deep-context:199 |

> **PAIN VALIDATION GATE — field-level constraint on `weekly_trigger` (REQUIRED, NOT NULL).**
> `[VERIFIED: persona-development-playbook.md:119-141; deep-context-layer-architecture.md:195]`
>
> A pain row cannot be persisted without a nameable weekly trigger moment. The test (run for every pain P1-P5 before shipping): *name the weekly moment this pain hits this persona* — Monday pipeline review? Tuesday deal desk? Wednesday forecast call with CRO? Thursday 1:1 with the struggling rep? Friday report assembly for the CEO? QBR? Board prep? Slack from the CRO at 9pm?
>
> If you cannot name the trigger moment, the pain is too abstract — a pain without a weekly trigger is a feature list, not a pain. `[VERIFIED: playbook:133]`
> - **Good (passes):** "Sales Enablement Director gets Slack from the CRO every Monday asking why new-rep ramp time slipped again" — trigger = Monday pipeline review + CRO escalation. `[VERIFIED: playbook:135]`
> - **Bad (fails — reject the row):** "Sales Enablement Director struggles to measure enablement ROI" — no weekly moment, no escalation path. `[VERIFIED: playbook:137]`
>
> **Implementable rule:** `weekly_trigger` is `NOT NULL` AND must be non-generic. Enforce at the app/service layer with a validation gate (an LLM or rule check) that rejects rows where the trigger is absent or a generic restatement of the pain. Origin: Praxium 2026-04-22. `[VERIFIED: playbook:141]`

### 1.5 `org_buying_signals` (org.icp.buying_signals[]) — §7

`[VERIFIED: output-template.md:244-259; dimension-schemas.md:135-151; deep-context:203]` — event model feeding the idea/trigger pillars.

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `signal_id` | uuid (PK) | | derived |
| `org_id` | uuid (FK→orgs) | NOT NULL | isolation key |
| `category` | text | CHECK ∈ `buying_signal_category` (8 ranked) | dimension-schemas.md:135-144 |
| `applicability` | text | | output-template.md:251 |
| `detection_method` | text | | output-template.md:251 |
| `strength_tier` | text | CHECK ∈ `signal_strength_tier` (A/B/C-tier) | dimension-schemas.md:148-151 |
| `source` | text | | output-template.md:251 |
| `confidence` | text | CHECK ∈ `confidence_level` | output-template.md:251 |

### 1.6 `org_competitors` (org.icp.competitors[]) — §9

`[VERIFIED: output-template.md:297-316]`

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `competitor_id` | uuid (PK) | | derived |
| `org_id` | uuid (FK→orgs) | NOT NULL | isolation key |
| `name` | text | | output-template.md:305 |
| `category` | text | CHECK ∈ `competitor_category` (Direct/Indirect/Status Quo) | output-template.md:306-308 |
| `key_strength` | text | | output-template.md:305 |
| `key_weakness` | text | | output-template.md:305 |
| `threat_level` | text | CHECK ∈ `competitor_threat_level` (High/Med/Low) | output-template.md:305 |
| `source_url` | text | | output-template.md:305 |

### 1.7 `org_brand_dna` (org.brand_dna, 1:1 with orgs) — shared brand DNA (L2-org)

Every member inherits this. `[VERIFIED: deep-context-layer-architecture.md:206-215]`

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `org_id` | uuid (PK, FK→orgs) | NOT NULL | deep-context:207 |
| `voice_rules` | jsonb | tone do/don't shared across team | deep-context:208 |
| `positioning` | text | | deep-context:209 |
| `narrative_atom_audience` | text | 7×5 reuse: write 7, place 35 | deep-context:210-212 |
| `narrative_atom_problem` | text | | deep-context:211 |
| `narrative_atom_outcome` | text | | deep-context:211 |
| `narrative_atom_story` | text | | deep-context:212 |
| `narrative_atom_framework` | text | | deep-context:212 |
| `narrative_atom_proof` | text | | deep-context:212 |
| `narrative_atom_offer` | text | | deep-context:212 |
| `audience_sophistication` | text | CHECK ∈ `audience_sophistication` (config knob: drives persuasion register) | deep-context:214 |

### 1.8 `org_learnings` (org.learnings[]) — compounding memory

`{learning_id, org_id (FK), what_worked, evidence, ranking_input}` — compounding "what posts worked" memory feeding the content-ranking pillar. `[VERIFIED: deep-context-layer-architecture.md:217]`

### 1.9 `org_sales_motion` (org.icp.sales_motion, 1:1) — §8 trimmed

`{org_id (FK), type ∈ sales_motion_type [PLG/SLG/Hybrid/Community-Led], free_trial bool, demo_required bool, self_serve_checkout text}` `[VERIFIED: output-template.md:288-293]`

### 1.10 `org_source_index` (output-template §Source Index) — traceability

`{source_id, org_id (FK), url, accessed date, used_for_sections, authority_tier ∈ authority_tier [Tier-1/2/3], confidence ∈ confidence_level}` `[VERIFIED: output-template.md:412-418]`

---

## 2. `member` — Member-Context Object (member layer)

One per person. `members.org_id` FK to `orgs`. Holds `voice_dna` (HOW they sound, 10-section) + `prose_samples` (the active ingredient) + `expert_pov` (WHAT they believe, 7 tables). `[VERIFIED schema: deep-context-layer-architecture.md:220-263]`

### 2.1 `members` (root)

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `member_id` | uuid (PK) | NOT NULL | deep-context:221 |
| `org_id` | uuid (FK→orgs) | **NOT NULL — isolation key, every read/write carries it** | deep-context:222, :329 |
| `role` | text | | deep-context:223 |
| `persona_ref` | uuid (FK→org_personas) | which org persona this member writes TO (register modulation) | deep-context:262 |

### 2.2 `member.voice_dna` — 10-Section core-voice schema (HOW they sound)

The 10-section per-member voice schema; the fully-worked example is `_owner/core-voice.md`. Store as a 1:1 `member_voice_dna` row (jsonb sub-objects where noted) keyed by `member_id`. `[VERIFIED schema: .claude/voice-dna/_owner/core-voice.md:9-120, full file:1-276; deep-context:225-237]`

| § | Section | Field(s) | Type | Source (core-voice.md) |
|---|---------|----------|------|------------------------|
| 1 | **Core Voice Attributes** | `core_attributes` jsonb: `{formality, directness (→voice_directness), humor, contrarian_tendency (→voice_contrarian_tendency), energy, vulnerability}` + `personality` notes | jsonb | :9-27 |
| 2 | **Sentence & Structure Patterns** | `sentence_patterns` (sentence style), `structural_patterns` (per-platform: LinkedIn opener/body/close, Newsletter) | text/jsonb | :30-53 |
| 3 | **Hook Formulas** | `hook_formulas[]` `{pattern, real_example, why_it_works}` (PROVEN) | jsonb[] | :56-68 |
| 3b | **Hooks to AVOID** | `hooks_to_avoid[]` (NEGATIVE signal — what stops AI-slop) | text[] | :69-74 |
| 4 | **Formatting Conventions** | `formatting` jsonb: per-platform line breaks, bullets, bold, emoji policy (max N), hashtag policy, link placement, length range, cadence, language mix | jsonb | :77-94 |
| 5 | **Vocabulary & Phrasing** | `vocabulary` jsonb: `{signature_terms[], phrases_that_sound_like_them[] (spoken + written + best-of-AI), phrases_to_avoid[]}` | jsonb | :97-138 |
| 6 | **CTA Patterns** | `cta_patterns` jsonb: per-platform CTA rules + ranked CTA priority | jsonb | :141-157 |
| 7 | **Content Themes (Pillars)** | `content_pillars_ref` (pointer to pillars file; not denormalized) | text | :160-162 |
| 8 | **What NOT to Do** | `what_not_to_do[]` (voice-level prohibitions) + universal anti-patterns pointer | text[] | :166-178 |
| 9 | **Quick Reference: LinkedIn Post Template** | `post_templates` jsonb: opinion/observation, data/insight, milestone templates | jsonb | :181-216 |
| 10 | **Quick Reference: Newsletter Opener Template** | `newsletter_template` | text | :220-228 |
| + | **Spoken vs Written transform** | `spoken_vs_written_transform[]` `{spoken_pattern, written_adaptation}` (filler-strip, point-first flip, keep/drop list) | jsonb[] | :232-248 |
| + | **Owner/Member Interaction Mode** | `interaction_mode` (governs working-turn replies, NOT published content — lead-with-verdict, minimal hedging) | jsonb | :251-262 |
| + | metadata | `voice_dna_version`, `primary_source`, `last_updated` | | :276, :1-6 |

> **Note on §7 (Content Themes):** core-voice.md §7 is a pointer to `content-pillars.md`, not inline data. Store as a reference, honoring index-not-summary. `[VERIFIED: core-voice.md:160-162]`

### 2.3 `member_prose_samples` (member.prose_samples[]) — L3, REQUIRED, the active ingredient

`[VERIFIED: deep-context-layer-architecture.md:104, :239-244; client-voice-dna-template.md:97-130; LOADING-PROTOCOL.md:43-46, 58-65 (via deep-context)]`

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `sample_id` | uuid (PK) | | derived |
| `member_id` | uuid (FK→members) | NOT NULL | isolation |
| `text` | text | NOT NULL, **200-600 words**, verbatim, pre-AI preferred | deep-context:242; client-voice-template:106, :128 |
| `mode` / `voice_mode` | text | CHECK ∈ `prose_sample_voice_mode` (Authoritative/Conversational/Analytical/Contrarian/Builder-Teacher...) | deep-context:242; client-voice-template:101 |
| `source_url` | text | | client-voice-template:99 |
| `date_published` | date | | client-voice-template:100 |
| `word_count` | int | CHECK >= 200 | client-voice-template:128 |
| `why_this_sample` | text | what voice characteristic it demonstrates | client-voice-template:108 |

**Count + length constraint (`prose_sample_count_constraint`):** 3-5 samples per member; each 200-600 words; reject < 200 words. Absence degrades personal-brand content to lower-fidelity description-only fallback; for brand/site copy absence is a HARD STOP (generation refuses). `[VERIFIED: deep-context-layer-architecture.md:104, :241-243]`

**Anti-patterns (validation):** no AI-flattened copy, no paraphrase (verbatim only), no <200w samples, performance signal ≠ voice signal. `[VERIFIED: client-voice-dna-template.md:124-130]`

### 2.4 `member.expert_pov` — Expert POV (WHAT they believe), 7 structured tables

`[VERIFIED schema: .claude/skills/expert-pov-extractor/SKILL.md:140-212; deep-context-layer-architecture.md:246-260]`

The architecture doc labels this **"7 structured tables"** (deep-context:246). The seven, as relational tables:

**Table 1 — `member_core_beliefs`** (3-7 beliefs) `[VERIFIED: SKILL.md:145-149]`

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `belief_id` uuid (PK), `member_id` uuid (FK) | | NOT NULL | |
| `statement` | text | NOT NULL | SKILL.md:146 |
| `evidence` | text | why they hold it | SKILL.md:146 |
| `positioning_implication` | text | | SKILL.md:146 |
| `contrarian_intensity` | text | CHECK ∈ `contrarian_intensity` (H/M/L) | SKILL.md:145-149 |

**Table 2 — `member_taste_profile`** (1:1 with member) `[VERIFIED: SKILL.md:151-155]`
`{member_id (PK,FK), admired text[] (companies + why), quality_bar text, trends_overrated text[], trends_underrated text[], anti_taste text[] ("we will never do X")}`

**Table 3 — `member_hot_takes`** (5-10 statements) `[VERIFIED: SKILL.md:157-182]`

| Field | Type | Constraint / Enum | Source |
|-------|------|-------------------|--------|
| `hot_take_id` uuid (PK), `member_id` uuid (FK) | | NOT NULL | |
| `statement` | text | NOT NULL | SKILL.md:158 |
| `scope` | text | CHECK ∈ `hot_take_scope` (content-safe / sales-only) | SKILL.md:159; deep-context:252 |
| `risk_level` | text | CHECK ∈ `hot_take_risk_level` (Low/Medium/High) | SKILL.md:160 |
| `contrarian_intensity` | text | CHECK ∈ `contrarian_intensity` (H/M/L) | SKILL.md:160 |
| `content_thread` | text | which recurring theme this feeds | SKILL.md:161 |
| `crawford_counterintuitive` | bool | Crawford 4-Test | SKILL.md:172 |
| `crawford_specific` | bool | | SKILL.md:173 |
| `crawford_quantifiable` | bool | | SKILL.md:174 |
| `crawford_demonstrable` | bool | | SKILL.md:175 |
| `crawford_score` | text | CHECK ∈ `crawford_4test.score_enum` ("4/4"..."0/4"); drives publish-eligibility | SKILL.md:177-182; deep-context:254 |

> The Crawford 4-Test nested validation (4 booleans + score) is the per-hot-take quality gate that stops the app generating provocative-but-indefensible posts. `crawford_score` action: 4/4 → positioning + pillars; 3/4 → push for missing dimension; ≤2/4 → internal belief only, do NOT build content. `[VERIFIED: SKILL.md:177-182; deep-context:114]`

**Table 4 — `member_pov_clusters`** (3-5 clusters) `[VERIFIED: SKILL.md:163-164]`
`{cluster_id (PK), member_id (FK), topic, thesis (specific falsifiable belief), enemy (what it argues against), evidence, implication (what reader should DO differently), formats text[], fletch_category (→ fletch_category enum, net-new)}`

**Table 5 — `member_obi`** (One Big Idea, 1:1 with member) `[VERIFIED: SKILL.md:186-202]`
`{member_id (PK,FK), statement, unifies bool, differentiates bool, defines bool, category_implications text, positioning_anchor text}` — all three booleans must pass (`obi_test`). If none emerges, store 2-3 candidates (`obi_candidates[]`) for founder choice.

**Table 6 — `member_belief_content_map`** (the per-person idea engine) `[VERIFIED: SKILL.md:204-212; deep-context:258-259]`
`{map_id (PK), member_id (FK), belief text (or belief_id/hot_take_id ref), thread_name, formats text[], framework_id (FK→global_library.frameworks, "Fletch Category"), first_post_angle}` — converts a stored belief directly into a first-post angle; **feeds the content calendar.**

**Table 7 — `member_expert_pov_meta`** (extraction provenance, 1:1) `[VERIFIED: SKILL.md:39-74; :219-222]`
`{member_id (PK,FK), extraction_mode (→ expert_pov_extraction_mode: full_interview/async_extract/quick_pov), interview_completed_at, storage_ref}`.

> **Note on the "7 tables" count:** the deep-context JSON sketch (deep-context:248-260) shows 6 named sub-objects (core_beliefs, taste_profile, hot_takes, pov_clusters, obi, belief_to_content_map). The architecture prose calls it "7 structured tables" (deep-context:246) — the 7th surfaces when the per-hot-take Crawford 4-Test (SKILL.md:166-182) is normalized into its own validation table OR when the extraction-meta provenance (SKILL.md:219-222) is split out. Both normalizations are represented above; an engineer may inline the Crawford fields into `member_hot_takes` (as done here) and keep `member_expert_pov_meta` as the 7th table. `[VERIFIED count source: deep-context-layer-architecture.md:246]`

---

## 3. `global_library` — App-wide read-only seed DBs

Orgs/members reference these by FK; never mutate. The actual content is extracted in sibling `seed-data/` and `prompts/` artifacts. **These are the RECONCILED `global_library_*` table names** that match both `db-schema.sql` DDL and the `seed-data/*.json` shapes (every seed array now has a destination — R-G4 / decision 3). Counts are the README ground-truth (python-parsed), not source-doc headline labels. `[VERIFIED: db-schema.sql LAYER 1 + LAYER 1 ANTI-SLOP; seed-data/README.md]`

**Primary seed tables (one per seed file's main array):**

| `global_library_*` table | Seed source (array) | Count | Referenced by | PK |
|--------------------------|---------------------|:-----:|---------------|----|
| `global_library_hooks` | `hooks.json` hooks[] | 72 (of documented 141) | content generation; `posts.hook_id` | TEXT (`hook_001`) |
| `global_library_frameworks` | `frameworks.json` frameworks[] | 13 (12 w/ prompt) | `member_belief_content_map.framework_id`; `posts.framework_id` | TEXT (`aida`) |
| `global_library_body_templates` | `body-templates.json` body_templates[] | 77 | content generation | TEXT (`act-01`) |
| `global_library_ctas` | `cta-bank.json` cta_patterns[] | 18 | content generation (selected by `goal`) | TEXT (`cta_save_reach`) |
| `global_library_power_words` | `frameworks.json` power_words.by_category | 100 (20×5) | headline/hook generator | INTEGER (UNIQUE(word,category)) |
| `global_library_proven_posts` | source CSVs (load step) | 86 labeled | few-shot / training data | INTEGER |
| `global_library_dm_templates` | `dm-templates.json` dm_templates[] | 48 | engage-step DM composer | TEXT (`conn_mutual_group`) |
| `global_library_comment_types` | `comment-types.json` comment_types[] | 11 | engage-step comment composer | TEXT (`alic_personal_advice`) |
| `global_library_interview_questions` | `prompts/voice-interview-scripts.md` | 18 (Expert POV) | onboarding interview flow; tagged CORE/ASYNC | TEXT |

**Sub-array tables (every seed sub-array now has a home — R-G4 / decision 3):**

| `global_library_*` table | Seed source (sub-array) | Count |
|--------------------------|-------------------------|:-----:|
| `global_library_emotional_hook_types` | `hooks.json` emotional_hook_types[] | 12 |
| `global_library_fill_in_templates` | `hooks.json` fill_in_templates[] | 10 |
| `global_library_hook_prompts` | `hooks.json` hook_prompts[] | 30 |
| `global_library_headline_formulas` | `hooks.json` headline_formulas[] | 34 |
| `global_library_dr_register_map` | `frameworks.json` dr_register_map (editorial + ads_sales techniques) | ~24 |
| `global_library_slop_structural_tells` | `frameworks.json` dr_register_map.slop_structural_tells (S1-S7) | 7 |
| `global_library_full_post_templates` | `body-templates.json` full_post_templates[] (A-E) | 5 |
| `global_library_comment_gating` | `cta-bank.json` comment_gating[] | 4 |
| `global_library_ps_closers` | `cta-bank.json` ps_closers[] | 4 |
| `global_library_continuation_tease` | `cta-bank.json` continuation_tease[] | 2 |
| `global_library_dm_warmup_sequence` | `dm-templates.json` warmup_sequence[] | 6 |
| `global_library_comment_linter_rules` | `comment-types.json` linter_rules[] | 9 |

**Anti-slop + config (anti-slop-killlist.json; runtime-parse of `anti-slop-universal.md` is the CANONICAL path — these tables exist for the seed-from-JSON path, keep CI-synced):**

| `global_library_*` table | Seed source | Count |
|--------------------------|-------------|:-----:|
| `global_library_antislop_kill_words` | `anti-slop-killlist.json` kill_words.all[] | 70 |
| `global_library_antislop_banned_phrases` | `anti-slop-killlist.json` banned_phrases.all[] | 28 |
| `global_library_antislop_register_gated_phrases` | `anti-slop-killlist.json` register_gated_phrases.all[] | 11 |
| `global_library_antislop_structural_patterns` | `anti-slop-killlist.json` structural_patterns.patterns[] (S1-S7) | 7 |
| `global_library_config` | seed sub-OBJECTS (not arrays): anti-slop em-dash/curly/imperative/number sets; dm warmup_account_safety_protocol; hooks five_hook_rules + formatting_thresholds; comment-types engagement_weight_model + reply principles | 1 row per key |

> **Load order:** all `global_library_*` DDL runs first; then the seven seed files load (`seed-data/README.md` order: anti-slop → frameworks+power_words → hooks → body-templates → cta-bank → dm-templates → comment-types). No FKs between seeds.

`[VERIFIED split provenance: my-context-os/09-agency/clients/NulaOne/README.md:408-419]` (via deep-context:171)

---

## 4. Entity-Relationship Summary

```
global_library (read-only, app-wide)
  hooks · frameworks · body_templates · cta_patterns · power_words · proven_posts · interview_questions
        ▲ referenced by FK (org/member → global; never reverse)
        │
orgs (org_id PK)
  ├─ org_overview (1:1)            §1 firmographics
  ├─ org_segments[] ──┬─ attributes[]   §4 ICP
  │                   └─ themes[]
  ├─ org_personas[] ──┬─ persona_day_in_life[]       §5 — 8-component blueprint
  │                   ├─ persona_pain_hierarchy[] (weekly_trigger REQUIRED)
  │                   ├─ persona_motivations[]
  │                   ├─ persona_language_bank[]
  │                   ├─ persona_anti_signals[]
  │                   └─ persona_competitive[]
  ├─ org_pains[] (weekly_trigger NOT NULL — Pain Validation Gate)   §6
  ├─ org_buying_signals[]          §7
  ├─ org_competitors[]             §9
  ├─ org_brand_dna (1:1)           shared brand DNA (L2-org)
  ├─ org_sales_motion (1:1)        §8 trimmed
  ├─ org_source_index[]            traceability
  └─ org_learnings[]               compounding memory
        ▲ org_id FK (NOT NULL)
        │
members (member_id PK, org_id FK NOT NULL, persona_ref FK→org_personas)
  ├─ member_voice_dna (1:1)              10-section core-voice (HOW)
  ├─ member_prose_samples[] (3-5, 200-600w, REQUIRED)   L3 active ingredient
  └─ member.expert_pov — 7 tables (WHAT):
       member_core_beliefs[] · member_taste_profile(1:1) · member_hot_takes[] (Crawford 4-test) ·
       member_pov_clusters[] · member_obi(1:1) · member_belief_content_map[] · member_expert_pov_meta(1:1)
```

**Isolation:** every `org_*` and `member_*` row carries (or is reachable via) `org_id`; queries filter on session `org_id`; cross-org access rejected server-side. `[VERIFIED: deep-context-layer-architecture.md:267, :329]`

---

## 5. Net-New / Unresolved (engineer must source or decide)

- `stage` enum: no closed list in KB — recommended ladder supplied in `dimension-enums.json`. `[deep-context:180]`
- `audience_sophistication` enum: example value only ('Enterprise'); recommended Schwartz-awareness ladder supplied. `[deep-context:214]`
- `voice_directness` / `voice_contrarian_tendency`: core-voice.md stores prose descriptors; discretized buckets are recommended net-new (keep verbatim descriptor in a companion free-text column). `[core-voice.md:13, :15]`
- `fletch_category`: only "Cat 3 (POV & Insights)" is named in the source; full 1-6 Fletch taxonomy must be sourced from `startup-gtm-messaging-framework` before constraining. `[SKILL.md:164, :232]`
- `prose_sample_voice_mode`: open enum ("...etc.") — recommended seed values supplied; allow free-text. `[client-voice-dna-template.md:101]`

---

*Source files read in full: output-template.md (437 lines), dimension-schemas.md (193 lines), core-voice.md (276 lines), persona-development-playbook.md (401 lines), personas-template.md (134 lines), client-voice-dna-template.md (199 lines), expert-pov-extractor/SKILL.md (283 lines), deep-context-layer-architecture.md §4 (161-270). Generated 2026-06-20.*

---
title: Choir Seed Data Manifest
layer: global_library
status: load-order-defined
created: 2026-06-20
---

# Seed Data Manifest

All seven files in this folder are **`layer: global_library`** — app-wide, read-only, NO `org_id`/`member_id` FK. They are the seeded persuasion + anti-slop databases every org references. Load them once at app boot, AFTER the `global_library_*` DDL has run.

> **Counts are real.** Every count below is from `python json` parse of the file (and `parseAntiSlop()` ground-truth for the kill-list), not from the source-document headline labels (which under/over-count in several cases — noted inline).

## Seed table

> **Phase 0 reconciliation DONE (2026-06-20).** The DATA-MODEL critic's NOT-READY findings G2-G5 are closed. The DDL-status column below now reads ✅ — every seed array AND sub-array has a destination table in `../schemas/db-schema.sql`, seed shapes match columns, and the two SQL files co-load (db-schema first, then feed-schema). Full before/after: `../schemas/RECONCILIATION-CHANGELOG.md`.

| Order | File | What it holds | Item count | Loads into (`global_library_*`) | DDL status |
|:---:|------|---------------|:---:|---------------------------------|------------|
| 1 | `anti-slop-killlist.json` | 70 kill-words + 28 banned phrases + 11 register-gated phrases + S1-S7 structural patterns + em-dash threshold | 109 records | runtime-parse of `anti-slop-universal.md` (CANONICAL) OR `global_library_antislop_kill_words` / `_banned_phrases` / `_register_gated_phrases` / `_structural_patterns` (+ `global_library_config` for em-dash/curly/imperative/number sets) | ✅ runtime-parse canonical; seed-from-JSON tables now exist (keep CI-synced to the markdown SoT) |
| 2 | `frameworks.json` | 13 frameworks (12 w/ verbatim LLM prompt) + 100 power words (5 categories) + DR Register Map | 13 frameworks / 100 power words | `global_library_frameworks` (TEXT PK, +`full_name`/`structure`), `global_library_power_words` (UNIQUE(word,category)), `global_library_dr_register_map`, `global_library_slop_structural_tells` | ✅ all destinations exist (DR register map + S1-S7 tells now have tables) |
| 3 | `hooks.json` | 72 verbatim hooks + 12 emotional types + 10 fill-in templates + 30 hook prompts + 34 headline formulas | 158 (72 hooks) | `global_library_hooks` (+ `_emotional_hook_types`, `_fill_in_templates`, `_hook_prompts`, `_headline_formulas`) | ✅ columns conform to seed (TEXT `id`, `text`, `category`, `emotional_trigger`); all 4 sub-arrays have tables |
| 4 | `body-templates.json` | 77 single-line body structural patterns (4 categories) + 5 full post templates A-E | 82 (77 + 5) | `global_library_body_templates` (+`category`) + `global_library_full_post_templates` | ✅ renamed from `global_library_templates`; `category` column added; A-E full-template table added |
| 5 | `cta-bank.json` | 18 goal-mapped CTA patterns + 4 comment-gating + 4 P.S. closers + 2 continuation-tease | 28 | `global_library_ctas` (+`goal`+`subtype`) + `_comment_gating` + `_ps_closers` + `_continuation_tease` | ✅ `goal` selector column added; all 3 sub-arrays have tables |
| 6 | `dm-templates.json` | 48 DM/connection templates (11 scenarios) + 6-step warm-up sequence + account-safety protocol | 54 | `global_library_dm_templates` + `global_library_dm_warmup_sequence` (+ `global_library_config` for the account-safety protocol object) | ✅ tables added |
| 7 | `comment-types.json` | 11 comment types (6 Alic + 5 Browne incl. Sidecar) + 9 deterministic linter rules | 24 | `global_library_comment_types` + `global_library_comment_linter_rules` (+ `global_library_config` for engagement_weight_model + reply principles) | ✅ tables added |

**Plus (not in this folder, referenced by the catalog):**
- `proven_posts` — the 86-post labeled corpus (verified 43+43 via `csv.DictReader`, NEVER `wc -l`). Schema + indexes exist in `../schemas/db-schema.sql` as `global_library_proven_posts`; the 86 rows are a **load-from-source-CSV** step, not yet a materialized seed artifact.
- `interview_questions` — `../schemas/data-model.md` §3 lists this as the 7th global_library seed table (the 18 Expert-POV questions); `dimension-enums.json` defines `interview_question_tag` for it. The question text lives in `../prompts/voice-interview-scripts.md`. **`global_library_interview_questions` now exists in `db-schema.sql`** (TEXT `id`, `section`, `question`, `tags` JSON, `ordinal`) — the table is created; the 18 rows are a load-from-`voice-interview-scripts.md` step.

## Load order rationale

1. **anti-slop FIRST** — the sanitizer needs it at boot regardless of DB state; everything downstream that generates passes through this gate.
2. **frameworks + power_words** — the generation engine's active ingredient (the per-framework `llm_prompt` is load-bearing data, not a description).
3. **hooks** — the retrieval pool the generator and library browse against.
4. **body-templates** — the structural shapes hooks + frameworks compose into.
5. **cta-bank** — closers selected by member goal.
6. **dm-templates** — engage-step composition bank.
7. **comment-types** — engage-step comment picker + linter.

Within `global_library` there are no FKs between seeds, so order is for clarity, not referential integrity — load all seven before any org/member onboarding writes occur.

## Before you load — shape mismatches (Phase 0 reconciliation — RESOLVED 2026-06-20)

These were confirmed by the DATA-MODEL COHERENCE critic (verdict: **NOT-READY** on the schema pair). All are now **FIXED** in `../schemas/db-schema.sql` (see `../schemas/RECONCILIATION-CHANGELOG.md` for before/after; `../00-BACKEND-BUILD-SPEC.md` §9 items 4-5):

- ✅ **`hooks.json`** — `global_library_hooks` now has TEXT `id` (== `hook_001`), `text` (was `hook_text`), `category` (was `hook_type`), and an ADDED `emotional_trigger` column. AUTOINCREMENT removed.
- ✅ **`cta-bank.json`** — `global_library_ctas` ADDED `goal TEXT CHECK(...)` (the bank's selector) + `subtype`; `template` (was `cta_text`); TEXT `id`.
- ✅ **`frameworks.json`** — `global_library_power_words` keyed on `UNIQUE(word, category)` so "Shocking" loads in BOTH attention_grabbers and emotional_appeal. `global_library_frameworks` now TEXT `id` (== `aida`) + `full_name` + `structure` (JSON) + NULLABLE `llm_prompt` (PAIPS has none — do NOT fabricate).
- ✅ **`body-templates.json`** — `global_library_body_templates` (renamed from `global_library_templates`) ADDED a `category` CHECK column (actionable/analytical/motivational/story) + TEXT `id`; `structure` (was `template_body`); A-E full templates have a `global_library_full_post_templates` table.
- ✅ **`dm-templates.json`, `comment-types.json`** — both now have `global_library_*` tables (`global_library_dm_templates` + `_dm_warmup_sequence`; `global_library_comment_types` + `_comment_linter_rules`). Config OBJECTS (account-safety protocol, engagement-weight model) land in `global_library_config`.
- ✅ **`anti-slop-killlist.json`** — runtime-parse stays the canonical path; seed-from-JSON tables added (`_antislop_kill_words` / `_banned_phrases` / `_register_gated_phrases` / `_structural_patterns`).

## Notes on count vs source labels (honest reconciliation)

- **hooks: 72, not 141.** The source 141-row Notion CSV was never exported to the KB; only the category-count table exists (documented in `hooks.json` `_meta.category_breakdown_141_db`, which sums to 141). The 72 are every concrete verbatim hook present across the 4 source files. Source-or-generate the remaining ~69 before claiming the full DB. Do NOT silently fabricate.
- **body-templates: 77, not 74.** The source doc labels it "74"/"70+" but the numbered table rows total 77 (Actionable 35 + Analytical 15 + Motivational 22 + Story 5).
- **dm-templates: 48, not "25+".** The playbook headline undercounts; 48 is the count once every sequence step + branch is enumerated.
- **anti-slop: 70/28/11/S1-S7** confirmed by running `parseAntiSlop()` against `anti-slop-universal.md` (the canonical source). If seeding from JSON instead of runtime-parse, own the CI re-extraction step to keep this file in sync with the markdown.

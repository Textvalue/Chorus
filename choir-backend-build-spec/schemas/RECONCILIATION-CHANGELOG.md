# Data-Model Reconciliation Changelog

> **Status:** DATA-MODEL COHERENCE critic returned **NOT-READY** (findings G1-G5 / `00-BACKEND-BUILD-SPEC.md` §9 items 2-5). This pass closes G2-G5 (the loadable-schema blockers). G1 (per-member voice isolation, §9 item 1) is net-new design work, NOT a coherence fix, and is left as an open item.
>
> **Verification:** the reconciled schema was executed end-to-end against SQLite 3.50.4 — `db-schema.sql` then `feed-schema.sql` co-load (50 tables, `PRAGMA foreign_key_check` = 0 problems), and a full seed-load simulation inserted every `seed-data/*.json` array + sub-array into its destination table at the exact expected counts (22/22 tables green; "Shocking" loaded in both power-word categories). The next agent's better-sqlite3 load + seed-map will pass.
>
> **Generated:** 2026-06-20

---

## Files changed

| File | What changed |
|------|--------------|
| `schemas/db-schema.sql` | Global-library seed tables reshaped to match seed JSON (TEXT PKs, renamed/added columns); orphaned-seed tables added (DM/comment/interview/anti-slop + sub-arrays + config); `posts.status` CHECK extended to 8 RBAC states; `posts.framework_id`/`hook_id` switched to TEXT; the duplicate `feed_profiles`/`feed_posts` definitions REMOVED (now canonical in feed-schema.sql). |
| `schemas/feed-schema.sql` | `orgs`/`members` stubs DELETED; every FK switched to `orgs(org_id)`/`members(member_id)`; `feed_profiles`/`feed_posts` made the single canonical definitions (merged in the scoring + classification columns from the removed db-schema copies); `feed_posts` gained `org_id NOT NULL` + `UNIQUE(org_id,url)` (was global `UNIQUE(url)`); load-order documented (loads AFTER db-schema.sql). |
| `schemas/multi-tenancy-spec.md` | RLS + RBAC table names changed to canonical db-schema names: `member_voice_profiles`→`voice_profiles`, `drafts`→`posts`, `org_brand_dna`→`brand_dna`, `org_personas`→`personas`, `org_icp`→`personas`/`pains`/`buying_signals`; `members.role`→`members.app_role`; `draft_status`→`posts.status`; `draft_audit`→`post_audit`. |
| `schemas/dimension-enums.json` | Added `post_status` enum (8 states) as the single source of truth kept in sync with `posts.status` CHECK + the RBAC state machine. |
| `schemas/data-model.md` | §0 logical-vs-physical name note added; §3 global_library catalog rewritten to the reconciled physical `global_library_*` table list (primary + sub-array + anti-slop + config) with ground-truth counts + load order. |
| `seed-data/README.md` | Seed table DDL-status column flipped ✅ (every array has a destination); "known shape mismatches" section marked RESOLVED with the specific fix per file. |

---

## Decision 1 — Identity convention: db-schema is canonical (closes G2)

**Critic finding (G2):** `db-schema.sql` uses `orgs(org_id)`/`members(member_id)`; `feed-schema.sql` used `orgs(id)`/`members(id)`. Both `CREATE TABLE IF NOT EXISTS` — under a single load the second stub no-ops and its FKs target a non-existent `id` column.

**Resolution:** db-schema.sql is canonical. feed-schema.sql's `orgs`/`members` stubs deleted; every FK re-pointed; load order documented (db-schema first).

**feed-schema.sql — before:**
```sql
CREATE TABLE IF NOT EXISTS orgs (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS members (
    id          TEXT PRIMARY KEY,
    org_id      TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    ...
);
-- and: tracked_accounts.org_id REFERENCES orgs(id), feed_profiles.member_id REFERENCES members(id),
--      feed_posts.member_id REFERENCES members(id), signal_cards.org_id REFERENCES orgs(id),
--      signal_cards.claimed_by REFERENCES members(id)
```

**feed-schema.sql — after:**
```sql
-- Org / member scaffolding: NONE HERE.
-- orgs(org_id) + members(member_id) are defined in db-schema.sql (loaded first).
-- Every FK below targets orgs(org_id) / members(member_id) — the canonical columns.
-- e.g.  org_id TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE
--       member_id TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE
```
All 7 FKs migrated (`tracked_accounts`, `tracked_topics`, `feed_profiles` ×2, `feed_posts`, `signal_cards` ×2).

---

## Decision 2 — feed_profiles / feed_posts defined once (closes G3)

**Critic finding (G3):** `feed_profiles`/`feed_posts` defined in BOTH files, incompatibly — different columns, different dedup keys (db-schema `UNIQUE(org_id,post_url)` vs feed-schema global `UNIQUE(url)`), and feed-schema's `feed_posts` had **no `org_id`** (broke the isolation invariant).

**Resolution:** feed-schema.sql holds the SINGLE canonical (richer) definition. The db-schema duplicates were removed and replaced with a pointer comment. The per-prospect qualification scoring (`person_authority_score`, `company_fit_score`, `lock_in_risk_score`, `buying_stage_score`, `verdict`, `displacement_difficulty`) + auto-classification (`classification`, `drafted_comment`, `drafted_dm`, `engaged`, `engaged_at`) columns that lived only in the db-schema copies were MERGED into the canonical feed-schema versions. `feed_posts` gained `org_id NOT NULL` + `UNIQUE(org_id, url)` so two orgs tracking the same public post do not collide.

**db-schema.sql — before:** full `CREATE TABLE feed_profiles (...)` + `CREATE TABLE feed_posts (...)` (the duplicates).

**db-schema.sql — after:**
```sql
-- *** feed_profiles + feed_posts are NOT defined here. ***
-- ... RESOLUTION: feed-schema.sql holds the SINGLE canonical, richer definition ...
-- feed-schema.sql loads AFTER db-schema.sql.
```

**feed-schema.sql `feed_posts` dedup — before:**
```sql
CREATE TABLE IF NOT EXISTS feed_posts (
    id                TEXT PRIMARY KEY,
    profile_id        TEXT NOT NULL REFERENCES feed_profiles(id) ON DELETE CASCADE,
    member_id         TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    url               TEXT NOT NULL UNIQUE,          -- global; two orgs collide
    ...                                              -- NO org_id
);
```

**feed-schema.sql `feed_posts` dedup — after:**
```sql
CREATE TABLE IF NOT EXISTS feed_posts (
    id                TEXT PRIMARY KEY,
    org_id            TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,  -- ADDED: isolation key
    profile_id        TEXT NOT NULL REFERENCES feed_profiles(id) ON DELETE CASCADE,
    member_id         TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
    url               TEXT NOT NULL,                 -- dedup within org
    ... classification, drafted_comment, drafted_dm, engaged, engaged_at ...  -- MERGED from db-schema
    UNIQUE (org_id, url)                             -- two orgs may track the same public post
);
```
> `feed_profiles` is deliberately NOT `UNIQUE(org_id, profile_url)` — the model is a per-MEMBER watch-list (`UNIQUE(member_id, profile_url)`), so two members of one org may each track the same person. Org-level dedup belongs on `feed_posts` (the public artifact), not `feed_profiles` (the per-member follow).

---

## Decision 3 — Every orphaned seed array has a destination table (closes G4)

**Critic finding (G4):** `body-templates.json`, `dm-templates.json`, `comment-types.json`, and `interview_questions` had no destination table; hooks sub-arrays, DR register map, anti-slop kill-list, and CTA sub-arrays were likewise homeless.

**Resolution:** added the missing `global_library_*` DDL. Every seed array AND sub-array now has a table; seed config OBJECTS (not arrays) land in a documented `global_library_config` JSON catch-all.

**Tables ADDED in db-schema.sql:**
- Hooks sub-arrays: `global_library_emotional_hook_types`, `_fill_in_templates`, `_hook_prompts`, `_headline_formulas`
- Frameworks sub-objects: `global_library_dr_register_map`, `global_library_slop_structural_tells`
- Body templates: `global_library_full_post_templates` (A-E)
- CTA sub-arrays: `global_library_comment_gating`, `_ps_closers`, `_continuation_tease`
- DM templates: `global_library_dm_templates`, `global_library_dm_warmup_sequence`
- Comment types: `global_library_comment_types`, `global_library_comment_linter_rules`
- Interview questions: `global_library_interview_questions`
- Anti-slop: `global_library_antislop_kill_words`, `_banned_phrases`, `_register_gated_phrases`, `_structural_patterns`
- Catch-all for config objects: `global_library_config`

**Renamed:** `global_library_templates` → `global_library_body_templates` (unambiguous seed mapping).

> Anti-slop note: runtime-parse of `anti-slop-universal.md` via `sanitize-copy.mjs parseAntiSlop()` remains the CANONICAL path (per `seed-data/README.md` item 1). The four anti-slop tables exist only for the seed-from-JSON path and must be CI-synced to the markdown SoT.

---

## Decision 4 — Seed shape ↔ column alignment (closes G5, part 1)

**Critic finding (G5):** seed shapes didn't match DDL columns. The schema was conformed to the seeds (the seeds are the real data).

| Seed (file.array) | Seed key | Was (DDL column) | Now (DDL column) |
|-------------------|----------|------------------|------------------|
| `hooks.json` hooks[] | `text` | `hook_text` | **`text`** |
| `hooks.json` hooks[] | `category` | `hook_type` | **`category`** |
| `hooks.json` hooks[] | `emotional_trigger` | (none) | **`emotional_trigger`** ADDED |
| `frameworks.json` frameworks[] | `full_name` | (none) | **`full_name`** ADDED |
| `frameworks.json` frameworks[] | `structure[]` | (none) | **`structure`** (JSON TEXT) ADDED |
| `frameworks.json` frameworks[] | `llm_prompt` | `NOT NULL` | **NULLABLE** (PAIPS has none) |
| `body-templates.json` body_templates[] | `structure` | `template_body` | **`structure`** |
| `body-templates.json` body_templates[] | id-prefix (act/ana/mot/sto) | (none) | **`category`** CHECK ADDED |
| `cta-bank.json` cta_patterns[] | `goal` | (none) | **`goal`** CHECK ADDED (load-bearing selector) |
| `cta-bank.json` cta_patterns[] | `subtype` | `cta_type` | **`subtype`** |
| `cta-bank.json` cta_patterns[] | `template` | `cta_text` | **`template`** |

---

## Decision 5 — Seed PK type: TEXT for read-only seed tables (closes G5, part 2)

**Critic finding (G5):** seed ids are strings (`hook_001`, `aida`, `act-01`, `cta_save_reach`) but DDL used `INTEGER PRIMARY KEY AUTOINCREMENT`.

**Resolution:** every read-only global_library seed table whose seed carries a string id now has `id TEXT PRIMARY KEY` (no autoincrement). Downstream FKs adjusted: `posts.framework_id` and `posts.hook_id` switched from INTEGER to **TEXT** to match `global_library_frameworks(id)` / `global_library_hooks(id)`.

**db-schema.sql — before:** `id INTEGER PRIMARY KEY AUTOINCREMENT` on hooks/frameworks/body-templates/ctas; `framework_id INTEGER`, `hook_id INTEGER` on posts.
**db-schema.sql — after:** `id TEXT PRIMARY KEY` on those seed tables; `framework_id TEXT`, `hook_id TEXT` on posts.

> `global_library_power_words` keeps `INTEGER PRIMARY KEY AUTOINCREMENT` — the seed has no per-word string id (just word+category pairs). `global_library_proven_posts` keeps INTEGER (load-from-CSV, no seed id). Integer-id sub-arrays (`emotional_hook_types`, `fill_in_templates`, `hook_prompts`, `headline_formulas`, `dm_warmup_sequence`) keep their integer seed ids as `INTEGER PRIMARY KEY` (NOT autoincrement — the value is the seed id).

---

## Decision 6 — power_words UNIQUE(word, category) (closes G5, part 3)

**Critic finding (G5):** `power_words.flat_list` contains "Shocking" twice (attention_grabbers + emotional_appeal). `UNIQUE(word)` rejected the second row.

**db-schema.sql — before:**
```sql
word            TEXT NOT NULL UNIQUE,
category        TEXT,
```
**db-schema.sql — after:**
```sql
word            TEXT NOT NULL,
category        TEXT NOT NULL,
...
UNIQUE(word, category)   -- 'Shocking' repeats across 2 categories
```
**Verified:** seed-load inserts "Shocking" in both `attention_grabbers` and `emotional_appeal`; power_words count = 100.

---

## Decision 7 — RLS / RBAC table names → canonical db-schema names (closes G5, part 4)

**Critic finding (G5):** `multi-tenancy-spec.md` referenced `member_voice_profiles` / `drafts` / `org_brand_dna` (and `org_icp` / `org_personas`); db-schema canonical names are `voice_profiles` / `posts` / `brand_dna`. db-schema names are canonical (the master spec `00-BACKEND-BUILD-SPEC.md` references them) — so the SPEC was edited, the tables were NOT renamed.

| multi-tenancy-spec (before) | db-schema canonical (after) |
|-----------------------------|------------------------------|
| `member_voice_profiles` | `voice_profiles` |
| `drafts` | `posts` (status-scoped; no separate drafts table) |
| `org_brand_dna` | `brand_dna` |
| `org_personas` | `personas` |
| `org_icp` | `personas` + `pains` + `buying_signals` (the org "ICP" set) |
| `members.role` | `members.app_role` (`role` is the free-text job title) |
| `draft_status` enum | `posts.status` |
| `draft_audit` table | `post_audit` (keyed to `posts.id`) |

RLS block, gate pseudocode (§2.3), §3.2 load order, §4.2 roles, §4.3 state enum, §4.4 transition matrix, §4.5-4.6 rules + tests, and the §5 GAP-B prose all updated.

---

## Decision 8 — posts.status includes all RBAC states (closes G5, part 5)

**Critic finding (G5):** `posts.status` CHECK lacked `changes_requested` and `archived` that the RBAC state machine (`multi-tenancy-spec.md` §4.3) needs.

**db-schema.sql — before:**
```sql
CHECK (status IN ('draft','pending','approved','scheduled','published','rejected'))
```
**db-schema.sql — after:**
```sql
CHECK (status IN ('draft','pending','approved','scheduled','published',
                  'rejected','changes_requested','archived'))
```
**Kept in sync:** `dimension-enums.json` gained a `post_status` enum with the same 8 values; `multi-tenancy-spec.md` §4.3 now states the enum IS `posts.status`. **Verified:** all 8 states insert; an unknown state is rejected by the CHECK.

---

## Open items (NOT closed by this pass)

1. **G1 — per-member voice isolation within one org (net-new, NOT a coherence fix).** No `member_id` RLS predicate / per-member vector namespace yet. This is design work (`data-model.md` §5 GAP-A; `multi-tenancy-spec.md` §5), out of scope for a coherence reconciliation. Left for the moment a 2nd member onboards.
2. **Generation-gate status columns are unbacked.** `multi-tenancy-spec.md` §2.3 reads `prose_samples ... status='active'` and `brand_dna ... status='approved'`, but db-schema's `prose_samples` and `brand_dna` tables have NO `status` column. Recommendation: add `status TEXT` to both (`brand_dna`: `draft|approved`; `prose_samples`: `active|archived`) so the gate query is loadable. Deferred here because it is gate-logic-vs-schema, not one of the G1-G5 identity/duplicate/orphan/shape findings.
3. **hooks 72-of-141 shortfall (§9 item 10), PAIPS has no llm_prompt (§9 item 14), proven_posts not yet seeded (§9 item 13), interview_questions 18 rows are a load step.** These are content-completeness items, not schema-coherence; the tables/columns now exist to receive them. Do NOT fabricate missing rows.
4. **12 lead-magnet types + 30 visual types (§9 item 11) have NO source data** — explicitly descoped, NOT given fabricated tables (per task instruction). Add `lead-magnet-types.json` / a visual-types seed later or leave descoped.

---

*Reconciliation lead pass, 2026-06-20. Closes G2-G5 (`00-BACKEND-BUILD-SPEC.md` §9 items 2-5). Schema verified loadable + seed-mappable against SQLite 3.50.4.*

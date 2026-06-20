-- =============================================================================
-- Choir — SQLite schema (better-sqlite3, WAL, single file, hand-written DDL)
-- =============================================================================
-- Engine target: SQLite 3.x via better-sqlite3. No ORM, no migration tooling.
-- All DDL is CREATE TABLE IF NOT EXISTS, executed once at app boot from a single
-- SCHEMA_SQL string (the db.mjs pattern). New columns added inline via ALTER on
-- bumped SCHEMA_VERSION, tracked by a single-row schema_meta table.
--
-- 3-layer data model (see brainstorms/content-os-app/feature-map.json:287, :327):
--   global_library_*  — app-wide, READ-ONLY seed DBs (hooks/frameworks/templates/
--                       ctas/power_words). Every org references; never per-org.
--   orgs / brand_dna / personas / pains — shared per-org brand DNA, ICP, personas.
--   members / voice_profiles / prose_samples / beliefs — per-member, org_id FK.
--   posts / engagement — operational tables (feed_profiles / feed_posts live in feed-schema.sql).
--
-- Isolation invariant: every org-scoped read/write carries org_id from session;
-- cross-org_id access rejected server-side (ports pre-tool-guard Check 1 client
-- isolation; deep-context-layer-architecture.md:267).
--
-- Enum-as-column-constraint discipline: enums below are lifted verbatim from
-- .claude/skills/icp-research/references/dimension-schemas.md (Company Size Bands,
-- Persona Seniority Bands, Buying Signal Categories, Pain Severity Scale,
-- Confidence Level Definitions) — encoded as CHECK constraints so team
-- aggregation is possible from day 1 (feature-map.json:327).
--
-- SQLite type notes: SQLite has no native BOOLEAN (use INTEGER 0/1, as db.mjs
-- does for `enabled`), no native JSON type (use TEXT holding JSON; arrays/objects
-- like prose_samples[], all_hooks[], narrative_atoms{} stored as JSON TEXT), no
-- native UUID (use TEXT — generate app-side). Timestamps are ISO-8601 TEXT
-- (db.mjs convention: new Date().toISOString()).
-- =============================================================================


-- #############################################################################
-- PART 1 — REFERENCE: original outbound db.mjs tables (verbatim, as comments)
-- Source: scripts/outbound/lib/db.mjs:29-80 (read this session, full file)
-- These are the tables Choir's spine is CLONED FROM. Reproduced exactly so an
-- engineer can diff the Choir adaptation against the proven original.
-- #############################################################################
--
-- CREATE TABLE IF NOT EXISTS schema_meta (              -- db.mjs:30-33
--   key TEXT PRIMARY KEY,
--   value TEXT NOT NULL
-- );
--
-- CREATE TABLE IF NOT EXISTS sends (                    -- db.mjs:35-49
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   thread_id TEXT NOT NULL,
--   signal_type TEXT NOT NULL,
--   lead_email TEXT,
--   lead_linkedin_url TEXT,
--   company_name TEXT,
--   company_domain TEXT,
--   sent_at TEXT NOT NULL,
--   platform TEXT NOT NULL,
--   campaign_id TEXT,
--   template_signature TEXT,
--   client TEXT NOT NULL,
--   UNIQUE(thread_id, platform)
-- );
-- CREATE INDEX IF NOT EXISTS idx_sends_signal_sent ON sends(signal_type, sent_at);   -- db.mjs:51
-- CREATE INDEX IF NOT EXISTS idx_sends_client_sent ON sends(client, sent_at);        -- db.mjs:52
--
-- CREATE TABLE IF NOT EXISTS replies (                  -- db.mjs:54-65
--   id INTEGER PRIMARY KEY AUTOINCREMENT,
--   thread_id TEXT NOT NULL,
--   message_id TEXT UNIQUE,
--   intent TEXT,
--   intent_confidence TEXT,
--   from_email TEXT,
--   received_at TEXT NOT NULL,
--   drafted_at TEXT,
--   handoff_path TEXT,
--   client TEXT NOT NULL
-- );
-- CREATE INDEX IF NOT EXISTS idx_replies_thread   ON replies(thread_id);    -- db.mjs:67
-- CREATE INDEX IF NOT EXISTS idx_replies_received ON replies(received_at);  -- db.mjs:68
--
-- CREATE TABLE IF NOT EXISTS template_state (           -- db.mjs:70-79
--   client TEXT NOT NULL,
--   signal_type TEXT NOT NULL,
--   enabled INTEGER NOT NULL DEFAULT 0,    -- circuit-breaker: 0 = not approved
--   paused_reason TEXT,                    -- set on auto-pause (reply-floor breach)
--   paused_at TEXT,
--   approved_at TEXT,                      -- set by /approve-template
--   last_send_at TEXT,
--   PRIMARY KEY (client, signal_type)
-- );
--
-- Mapping outbound -> Choir:
--   sends           -> posts (the published-artifact ledger + status lifecycle)
--   replies         -> engagement (inbound interactions back on a post)
--   template_state  -> member_cadence_state (per-member posting-cadence + safety
--                      circuit-breaker; see checkPostingCadence in state-store.md)
--   client          -> org_id (the isolation key)
--   signal_type     -> pillar / post_type (the per-template grouping key)


-- #############################################################################
-- PART 2 — CHOIR SCHEMA (runnable SQLite DDL)
-- #############################################################################

-- -----------------------------------------------------------------------------
-- schema_meta — single-row version marker (db.mjs:30-33, cloned verbatim)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
-- App boot inserts ('version', '1') if absent (db.mjs:100-107).


-- =============================================================================
-- LAYER 1 — GLOBAL LIBRARY (app-wide, READ-ONLY seed DBs)
-- No org_id. Seeded once from the KB markdown tables (feature-map.json:66).
-- Every org references these by id; orgs never write here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- global_library_hooks — hook DB (hooks.json hooks[]; 72 materialized of documented 141)
-- Each row keeps its when-to-use / category / emotional-trigger metadata for
-- contextual recommendation. Columns conform to hooks.json hooks[] shape (R-G5/item-5):
--   seed id  'hook_001' (string)  -> id TEXT PK (NOT autoincrement)
--   seed text                     -> text       (was hook_text — renamed to match seed)
--   seed category                 -> category   (was hook_type — single field can't hold both)
--   seed emotional_trigger        -> emotional_trigger (ADDED — seed carries it separately)
--   seed source                   -> source_ref
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_hooks (
  id                TEXT PRIMARY KEY,          -- == seed id e.g. 'hook_001' (read-only seed; no autoincrement)
  text              TEXT NOT NULL,             -- the verbatim hook / first line (hooks.json .text)
  category          TEXT NOT NULL,             -- hooks.json .category (Result, Observations/Opinion, Data...)
  emotional_trigger TEXT,                      -- hooks.json .emotional_trigger (curiosity, fear, credibility...)
  when_to_use       TEXT,                      -- contextual-recommendation metadata (hooks.json .when_to_use)
  best_for          TEXT,                      -- pillar / post_type / format fit hint (derived; nullable)
  char_count        INTEGER,                   -- for the 210-char fold linter (computed at seed)
  is_avoid          INTEGER NOT NULL DEFAULT 0,  -- 1 = hooks-to-AVOID (negative signal, core-voice.md:69-74)
  source_ref        TEXT                       -- KB path:line provenance (hooks.json .source)
);
CREATE INDEX IF NOT EXISTS idx_glh_category ON global_library_hooks(category);

-- hooks.json sub-array: emotional_hook_types[] (12 rows) — the 12-emotion taxonomy with mechanism + example.
CREATE TABLE IF NOT EXISTS global_library_emotional_hook_types (
  id              INTEGER PRIMARY KEY,         -- == seed id (1..12; integer in seed)
  name            TEXT NOT NULL,               -- e.g. 'Inspiration', 'Fear', 'Curiosity'
  reader_reaction TEXT,                        -- e.g. 'Damn, I want that'
  emotion         TEXT,                        -- e.g. 'Aspiration, desire'
  mechanism       TEXT,                        -- how the emotion is triggered
  subtypes        TEXT,                        -- JSON array | NULL (Curiosity has subtypes[])
  when_to_use     TEXT,
  example         TEXT,
  note            TEXT,                        -- NULL except Faces/Celebration
  warning         TEXT,                        -- NULL except Celebration
  source_ref      TEXT
);

-- hooks.json sub-array: fill_in_templates[] (10 rows) — fill-in hook formats with format + why_it_works.
CREATE TABLE IF NOT EXISTS global_library_fill_in_templates (
  id              INTEGER PRIMARY KEY,         -- == seed id (1..10)
  name            TEXT NOT NULL,               -- e.g. 'Dream Outcome Without Obstacle'
  format          TEXT NOT NULL,               -- the {{slot}} template string
  example         TEXT,
  why_it_works    TEXT,
  source_ref      TEXT
);

-- hooks.json sub-array: hook_prompts[] (30 rows) — AI hook-generator prompt grid, grouped by set.
CREATE TABLE IF NOT EXISTS global_library_hook_prompts (
  id              INTEGER PRIMARY KEY,         -- == seed id (1..30)
  prompt_set      TEXT NOT NULL,               -- seed .set e.g. 'A: Achievement and Transformation'
  prompt          TEXT NOT NULL,               -- the prompt template
  source_ref      TEXT
);

-- hooks.json sub-array: headline_formulas[] (34 rows) — profile/headline formulas with exemplars.
CREATE TABLE IF NOT EXISTS global_library_headline_formulas (
  id                INTEGER PRIMARY KEY,       -- == seed id (1..34)
  category          TEXT NOT NULL,             -- e.g. 'Help Statement + Credibility'
  pattern           TEXT,                      -- abstract pattern
  template          TEXT NOT NULL,             -- fill-in template
  exemplar_creator  TEXT,
  exemplar_headline TEXT,
  source_ref        TEXT
);

-- -----------------------------------------------------------------------------
-- global_library_frameworks — 13 frameworks (12 w/ embedded LLM prompt; PAIPS prompt is NULL)
-- (frameworks.json frameworks[]). llm_prompt is the load-bearing data — the persuasion
-- engine, not a description. Columns conform to frameworks.json frameworks[] shape (R-G5/item-5):
--   seed id 'aida'/'pas'/'paips' (string) -> id TEXT PK (NOT autoincrement)
--   seed full_name                        -> full_name (ADDED)
--   seed structure[]                      -> structure (JSON TEXT, ADDED)
--   seed llm_prompt                        -> llm_prompt (NULLABLE — PAIPS has none; do NOT fabricate)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_frameworks (
  id              TEXT PRIMARY KEY,          -- == seed id e.g. 'aida', 'pas', 'paips' (read-only seed)
  name            TEXT NOT NULL,             -- AIDA, PAS, BAB, PASTOR, ...
  full_name       TEXT,                      -- e.g. 'Attention, Interest, Desire, Action'
  description     TEXT,                      -- what the framework does
  structure       TEXT,                      -- JSON array of the framework's component steps
  llm_prompt      TEXT,                      -- the embedded ChatGPT/Claude prompt (verbatim) | NULL for PAIPS (item 14)
  llm_prompt_note TEXT,                      -- frameworks.json .llm_prompt_note: present where llm_prompt is NULL (PAIPS "do-not-fabricate" engineering note) | NULL otherwise
  when_to_use     TEXT,
  best_for        TEXT,                      -- post_type fit (derived; nullable)
  source_ref      TEXT                       -- frameworks.json .source
);

-- frameworks.json sub-object: dr_register_map — the DR Register Map firewall doctrine.
-- One row per technique; register discriminates editorial (register_neutral) vs ads_sales (register_gated).
-- (frameworks.json dr_register_map.editorial.techniques[] + .ads_sales.techniques[])
CREATE TABLE IF NOT EXISTS global_library_dr_register_map (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  register        TEXT NOT NULL              -- 'editorial' (register_neutral, ANY register) | 'ads_sales' (register_gated)
                    CHECK (register IN ('editorial','ads_sales')),
  technique       TEXT NOT NULL,             -- verbatim technique string
  source_ref      TEXT,                      -- 05-marketing-demand/copywriting/_index.md:46-65
  UNIQUE(register, technique)
);

-- frameworks.json sub-object: dr_register_map.slop_structural_tells (S1-S7) — the structural slop detectors.
-- S1-S5 deterministic (hard-fail editorial); S6-S7 advisory/taste-level. Mirrors anti-slop structural_patterns
-- (deliberate denormalized copy so the copy-quality pipeline can read either seed).
CREATE TABLE IF NOT EXISTS global_library_slop_structural_tells (
  id              TEXT PRIMARY KEY,          -- 'S1'..'S7' (== seed id)
  tell            TEXT NOT NULL,             -- short label
  definition      TEXT NOT NULL,
  killed_example  TEXT,                      -- a shipped offender
  deterministic   INTEGER NOT NULL DEFAULT 0,  -- 1 for S1-S5 (code-detectable), 0 for S6-S7 (taste-level)
  source_ref      TEXT
);

-- -----------------------------------------------------------------------------
-- global_library_body_templates — 77 single-line body structural patterns (body-templates.json body_templates[])
-- The "shape" layer: post-body structure into which framework + hook are filled.
-- Columns conform to body-templates.json body_templates[] shape (R-G5/item-5):
--   seed id 'act-01'/'ana-05'/'mot-22'/'sto-03' -> id TEXT PK (read-only seed)
--   seed name                                    -> name
--   seed structure                               -> structure (was template_body — renamed to match seed)
--   category prefix (act/ana/mot/sto)            -> category (ADDED — body-templates.json README item: was missing)
--   seed when_to_use / format_notes / source     -> when_to_use / format_notes / source_ref
-- NOTE: renamed from global_library_templates to *_body_templates for unambiguous seed mapping.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_body_templates (
  id              TEXT PRIMARY KEY,          -- == seed id e.g. 'act-01' (read-only seed)
  category        TEXT NOT NULL              -- ADDED: act|ana|mot|sto (actionable/analytical/motivational/story)
                    CHECK (category IN ('actionable','analytical','motivational','story')),
  name            TEXT NOT NULL,             -- e.g. 'If you get that'
  structure       TEXT NOT NULL,             -- the structural formula (body-templates.json .structure)
  when_to_use     TEXT,                      -- category-level guidance (.when_to_use)
  format_notes    TEXT,                      -- pairing hint (.format_notes)
  source_ref      TEXT                       -- .source
);
CREATE INDEX IF NOT EXISTS idx_glbt_category ON global_library_body_templates(category);

-- body-templates.json sub-array: full_post_templates[] (5 rows, A-E) — complete verbatim post skeletons.
-- (body-templates.json README item: "NO table for A-E full templates" — added here)
CREATE TABLE IF NOT EXISTS global_library_full_post_templates (
  id              TEXT PRIMARY KEY,          -- 'A'..'E' (== seed id)
  name            TEXT NOT NULL,             -- e.g. 'The Comprehensive Breakdown'
  char_range      TEXT,                      -- e.g. '2,500-2,900 chars'
  when_to_use     TEXT,
  why_it_works    TEXT,                      -- NULL except template D
  skeleton        TEXT NOT NULL,             -- the full \n-delimited post skeleton with [SLOTS]
  source_ref      TEXT
);

-- -----------------------------------------------------------------------------
-- global_library_ctas — CTA patterns (cta-bank.json cta_patterns[], 18 rows)
-- Columns conform to cta-bank.json cta_patterns[] shape (R-G5/item-5):
--   seed id 'cta_save_reach'   -> id TEXT PK (read-only seed)
--   seed goal                  -> goal (ADDED — the load-bearing selector; was missing)
--   seed subtype               -> subtype (ADDED — was 'cta_type')
--   seed template              -> template (was 'cta_text' — renamed to match seed)
--   seed when_to_use / source  -> when_to_use / source_ref
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_ctas (
  id              TEXT PRIMARY KEY,          -- == seed id e.g. 'cta_save_reach' (read-only seed)
  goal            TEXT NOT NULL              -- ADDED: the bank's selector (cta-bank.json goals_enum)
                    CHECK (goal IN ('lead-gen','engagement','follow','DM','booking')),
  subtype         TEXT NOT NULL,             -- save-prompt | comment-prompt | debate-prompt | follow-prompt | dm-prompt | link-in-comments | save-then-asset | profile-cta | profile-headline
  template        TEXT NOT NULL,             -- the CTA template with [slots]/{slots} (cta-bank.json .template)
  when_to_use     TEXT,                      -- .when_to_use
  source_ref      TEXT                       -- .source
);
CREATE INDEX IF NOT EXISTS idx_glcta_goal ON global_library_ctas(goal);

-- cta-bank.json sub-array: comment_gating[] (4 rows) — keyword/emoji comment-gate patterns.
CREATE TABLE IF NOT EXISTS global_library_comment_gating (
  id              TEXT PRIMARY KEY,          -- == seed id e.g. 'gate_keyword_share'
  pattern         TEXT NOT NULL,             -- the gate pattern with [KEYWORD]
  goal            TEXT NOT NULL              -- DM | engagement (cta-bank.json goals subset used here)
                    CHECK (goal IN ('lead-gen','engagement','follow','DM','booking')),
  mechanism       TEXT,                      -- keyword-comment-gate | keyword-comment-gate-plus-connect | emoji-comment-gate
  when_to_use     TEXT,
  source_ref      TEXT
);

-- cta-bank.json sub-array: ps_closers[] (4 rows) — proven P.S. engagement closers.
CREATE TABLE IF NOT EXISTS global_library_ps_closers (
  id              TEXT PRIMARY KEY,          -- == seed id e.g. 'ps_add_to_stack'
  pattern         TEXT NOT NULL,             -- the P.S. closer text
  goal            TEXT NOT NULL
                    CHECK (goal IN ('lead-gen','engagement','follow','DM','booking')),
  when_to_use     TEXT,
  source_ref      TEXT
);

-- cta-bank.json sub-array: continuation_tease[] (2 rows) — drive-to-comments / follow tease patterns.
CREATE TABLE IF NOT EXISTS global_library_continuation_tease (
  id              TEXT PRIMARY KEY,          -- == seed id e.g. 'tease_continuing_comments'
  pattern         TEXT NOT NULL,
  goal            TEXT NOT NULL
                    CHECK (goal IN ('lead-gen','engagement','follow','DM','booking')),
  when_to_use     TEXT,
  source_ref      TEXT
);

-- -----------------------------------------------------------------------------
-- global_library_power_words — 100 power words (frameworks.json power_words.by_category, 20 x 5 categories)
-- Seed has NO per-word string id (just word + category pairs) -> INTEGER autoincrement PK is correct.
-- UNIQUE(word) was WRONG (R-G5/item-5): power_words.flat_list contains "Shocking" TWICE
-- (attention_grabbers + emotional_appeal). Key on (word, category) so both rows load.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_power_words (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  word            TEXT NOT NULL,
  category        TEXT NOT NULL,            -- attention_grabbers | emotional_appeal | authority_and_trust | exclusivity | impact_and_change
  source_ref      TEXT,
  UNIQUE(word, category)                    -- was UNIQUE(word); 'Shocking' repeats across 2 categories
);

-- -----------------------------------------------------------------------------
-- global_library_proven_posts — 86 labeled posts (feature-map.json:168 proven_posts(86))
-- Few-shot exemplar corpus for verbatim-anchored generation (feature-map.json:83).
-- Source CSVs: kenny-posts-reference.csv, mich-posts-reference.csv (feature-map.json:79-80).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_proven_posts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  post_text       TEXT NOT NULL,            -- verbatim full post
  author          TEXT,                     -- kenny | mich | ... (corpus origin)
  pillar          TEXT,                     -- synthesis|access|contrarian|simplifying (lc-agent:151)
  format          TEXT,                     -- text|carousel|lead_magnet|infographic
  hook_type       TEXT,                     -- label used for retrieval
  performance_label TEXT,                   -- high|medium|low (labeled corpus)
  source_ref      TEXT
);
CREATE INDEX IF NOT EXISTS idx_glpp_pillar ON global_library_proven_posts(pillar);

-- -----------------------------------------------------------------------------
-- global_library_dm_templates — 48 DM/connection templates (dm-templates.json dm_templates[])
-- Was ORPHANED (seed-data/README item 6: "NO table exists"). Columns conform to seed shape:
--   seed id 'conn_mutual_group' -> id TEXT PK; scenario/category/template/char_cap/when_to_use/source
--   optional seed keys (message_type, sequence_position, branch, industry, trigger, performance_note,
--   char_cap_soft, anti_example) captured in dedicated nullable columns.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_dm_templates (
  id                TEXT PRIMARY KEY,          -- == seed id e.g. 'conn_mutual_group'
  scenario          TEXT NOT NULL,             -- connection_request | lead_magnet_delivery | competitor_lead_stealing | warm_trigger | cold_opener | follow_up | ...
  category          TEXT,                      -- human-readable group e.g. 'Connection Request'
  template          TEXT NOT NULL,             -- the DM body with {merge_variables}
  char_cap          INTEGER,                   -- 300 for connection notes; NULL for connected-DMs
  char_cap_soft     INTEGER,                   -- soft cap (engagement SKILL.md ~280) | NULL
  message_type      TEXT,                      -- 'voice_note' | NULL
  sequence_position INTEGER,                   -- step # in a multi-message sequence | NULL
  branch            TEXT,                      -- 'if_opened' | 'if_not_opened' | NULL
  industry          TEXT,                      -- industry-specific sequences only | NULL
  trigger           TEXT,                      -- warm-trigger scenarios: funding_round, company_follower, ... | NULL
  performance_note  TEXT,                      -- e.g. '30% reply rate' | NULL
  anti_example      TEXT,                      -- what NOT to do | NULL
  when_to_use       TEXT,
  source_ref        TEXT
);
CREATE INDEX IF NOT EXISTS idx_gldm_scenario ON global_library_dm_templates(scenario);

-- dm-templates.json sub-array: warmup_sequence[] (6 steps) — the per-prospect multi-touch warm-up.
CREATE TABLE IF NOT EXISTS global_library_dm_warmup_sequence (
  step            INTEGER PRIMARY KEY,         -- 1..6 (== seed step)
  day_offset      TEXT NOT NULL,               -- e.g. '-7 to -1', '0', '1 to 3'
  phase           TEXT NOT NULL,               -- multi_touch_warmup | connection_request | first_dm | follow_up_1 | ...
  action          TEXT NOT NULL,
  channel         TEXT,                        -- engagement | connection_request | dm
  rule            TEXT,
  source_ref      TEXT
);
-- NOTE: dm-templates.json also carries warmup_account_safety_protocol (a single config object, not an array).
-- Stored as a one-row JSON config (see global_library_config below) — not a per-row table.

-- -----------------------------------------------------------------------------
-- global_library_comment_types — 11 comment types (comment-types.json comment_types[])
-- Was ORPHANED (seed-data/README item 7: "NO table exists"). 6 Alic + 5 Browne incl. Sidecar.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_comment_types (
  id                     TEXT PRIMARY KEY,     -- == seed id e.g. 'alic_personal_advice', 'browne_sidecar'
  name                   TEXT NOT NULL,        -- e.g. 'Personal Advice', 'Sidecar Comment (Growth Hack)'
  author                 TEXT NOT NULL         -- 'Alic' | 'Browne'
                           CHECK (author IN ('Alic','Browne')),
  description            TEXT,
  example                TEXT,                  -- NULL where seed example is null
  example_note           TEXT,                  -- NULL except where present
  engagement_weight      INTEGER,               -- algorithm action weight (2 or 4)
  engagement_weight_basis TEXT,                 -- 'meaningful_comment_over_15_words' | 'short_comment_under_15_words'
  optimizes_for          TEXT,                  -- 'demonstrating_expertise' | 'building_connections'
  highest_roi            INTEGER NOT NULL DEFAULT 0,  -- 1 for Sidecar
  when_to_use            TEXT,                  -- NULL except where present
  requirements           TEXT,                  -- JSON array | NULL (Sidecar)
  expected_outcome       TEXT,                  -- JSON array | NULL (Sidecar)
  source_ref             TEXT
);

-- comment-types.json sub-array: linter_rules[] (9 deterministic comment-quality rules).
CREATE TABLE IF NOT EXISTS global_library_comment_linter_rules (
  rule                   TEXT PRIMARY KEY,      -- == seed .rule e.g. 'block_generic_great_post'
  description            TEXT NOT NULL,
  match_phrases          TEXT,                  -- JSON array of trigger phrases | NULL
  match_type             TEXT,                  -- e.g. 'case_insensitive_substring_when_comment_is_short' | NULL
  threshold              TEXT,                  -- the rule threshold prose
  severity               TEXT NOT NULL          -- 'block' | 'warn' | 'info'
                           CHECK (severity IN ('block','warn','info')),
  reason                 TEXT,
  weight_meaningful_comment INTEGER,            -- min_word_count rule only: algo weight for >=15-word comments (seed .weight_meaningful_comment) | NULL
  weight_short_comment      INTEGER,            -- min_word_count rule only: algo weight for <15-word comments (seed .weight_short_comment) | NULL
  source_ref             TEXT
);

-- -----------------------------------------------------------------------------
-- global_library_interview_questions — 18 Expert-POV interview questions (data-model.md:334)
-- Was ORPHANED (seed-data/README "No global_library_interview_questions table exists yet").
-- Question TEXT lives in ../prompts/voice-interview-scripts.md; tags drive the 3 extraction modes.
-- dimension-enums.json `interview_question_tag` (CORE/ASYNC) constrains the tags column.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_interview_questions (
  id              TEXT PRIMARY KEY,            -- question id (q01.. or section-derived)
  section         TEXT,                        -- the 8-section Expert-POV bank section
  question        TEXT NOT NULL,               -- the verbatim question text
  tags            TEXT,                        -- JSON array subset of {CORE,ASYNC} (interview_question_tag enum)
  ordinal         INTEGER,                     -- display order within the bank
  source_ref      TEXT                         -- expert-pov-extractor SKILL.md:84-128 / voice-interview-scripts.md
);

-- =============================================================================
-- LAYER 1 — ANTI-SLOP KILL-LIST (anti-slop-killlist.json)
-- CANONICAL PATH = runtime-parse of anti-slop-universal.md via sanitize-copy.mjs parseAntiSlop()
-- (seed-data/README item 1). These tables exist ONLY for the seed-from-JSON path; if seeding
-- from JSON, own the CI re-extraction step to keep them in sync with the markdown SoT.
-- counts (ground-truth 2026-06-20): kill_words=70, banned_phrases=28, register_gated_phrases=11.
-- =============================================================================

-- anti-slop kill_words.all[] (70) — whole-word, case-insensitive sanitizer vocabulary.
CREATE TABLE IF NOT EXISTS global_library_antislop_kill_words (
  word            TEXT PRIMARY KEY,            -- e.g. 'delve', 'leverage', 'here''s the thing:'
  category        TEXT,                        -- verbs|adjectives|nouns_abstract|transitions|filler (UI grouping) | NULL
  use_instead     TEXT,                        -- replacement suggestion | NULL
  source_ref      TEXT
);

-- anti-slop banned_phrases.all[] (28) — case-insensitive substring bans.
CREATE TABLE IF NOT EXISTS global_library_antislop_banned_phrases (
  phrase          TEXT PRIMARY KEY,            -- e.g. 'in today''s fast-paced world'
  category        TEXT,                        -- opening|transitional|closing|chatbot_artifacts|pseudo_profound_flourishes | NULL
  source_ref      TEXT
);

-- anti-slop register_gated_phrases.all[] (11) — DR urgency/scarcity CTAs; hard-fail ONLY under editorial register.
CREATE TABLE IF NOT EXISTS global_library_antislop_register_gated_phrases (
  phrase          TEXT PRIMARY KEY,            -- e.g. 'act now', 'limited time'
  active_register TEXT NOT NULL DEFAULT 'editorial',  -- only enforced when register === this
  source_ref      TEXT
);

-- anti-slop structural_patterns.patterns[] (S1-S7) — sanitizer structural slop detectors.
-- (Same data as global_library_slop_structural_tells above; kept as a parallel anti-slop-side
-- table because the anti-slop seed carries the full detection regex/scope/enforcement metadata.)
CREATE TABLE IF NOT EXISTS global_library_antislop_structural_patterns (
  id              TEXT PRIMARY KEY,            -- 'S1'..'S7'
  type            TEXT NOT NULL,               -- e.g. 'aphorism-the-x-is-the-y'
  description     TEXT NOT NULL,
  shipped_offender_example TEXT,
  detection       TEXT,                        -- regex / heuristic prose (NULL for S6/S7 taste-level)
  scope           TEXT,                        -- 'sentence' | 'headline candidate' | 'n/a'
  enforcement     TEXT NOT NULL,               -- 'editorial=HARD-FAIL; default=WARN' | 'NOT mechanized (taste-level)'
  source_ref      TEXT
);

-- -----------------------------------------------------------------------------
-- global_library_config — single-row JSON catch-all for seed config OBJECTS (not arrays).
-- Holds: anti-slop em_dash_max_per_paragraph + curly_quotes_banned + imperative_verbs_set
--        + number_words_set; dm-templates warmup_account_safety_protocol;
--        hooks five_hook_rules + hook_formatting_thresholds; comment-types engagement_weight_model
--        + reply_to_own_comments_principles. One row per config key; value is JSON TEXT.
-- (These are seed sub-objects with no natural per-row table; a documented JSON column per task item 3.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS global_library_config (
  config_key      TEXT PRIMARY KEY,            -- e.g. 'antislop_em_dash_max', 'dm_warmup_account_safety', 'hooks_five_rules'
  value           TEXT NOT NULL,               -- JSON-encoded config object
  source_ref      TEXT
);


-- =============================================================================
-- LAYER 2 — ORG (shared brand DNA, ICP, personas, pains) — per-org, isolation root
-- =============================================================================

-- -----------------------------------------------------------------------------
-- orgs — tenant root. identity block = research-first auto-prefill (Phase 0).
-- (deep-context-layer-architecture.md:174-186; intake-form.md:35 research-first)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orgs (
  org_id            TEXT PRIMARY KEY,        -- uuid, app-generated
  company           TEXT NOT NULL,           -- [SOURCE]-tagged identity (dcla:178)
  url               TEXT,                    -- the company URL onboarding entry point
  stage             TEXT,                    -- intake Q1.1.3 (e.g. seed/growth)
  product_category  TEXT,
  size_band         TEXT
                      CHECK (size_band IS NULL OR size_band IN
                        ('Micro','Small','Mid-Small','Mid-Market',
                         'Upper-Mid','Enterprise','Large Enterprise')),
                        -- Company Size Bands, dimension-schemas.md:11-19
  industry_l1       TEXT,                    -- Industry Taxonomy L1, dimension-schemas.md:31-52
  industry_l2       TEXT,                    -- record both levels (dimension-schemas.md:54)
  hq_country        TEXT,                    -- ISO 3166-1 alpha-2 (dimension-schemas.md:66)
  hq_region         TEXT,                    -- North America|EMEA|APAC|LATAM (dimension-schemas.md:67)
  created_at        TEXT NOT NULL,
  updated_at        TEXT
);

-- -----------------------------------------------------------------------------
-- brand_dna — shared L2-org voice layer; every member inherits this
-- (deep-context-layer-architecture.md:207-215). One row per org.
-- narrative_atoms = 7x5 reuse block stored as JSON (dcla:210-213).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_dna (
  org_id                   TEXT PRIMARY KEY REFERENCES orgs(org_id) ON DELETE CASCADE,
  positioning              TEXT,             -- one-paragraph positioning (dcla:212)
  voice_rules              TEXT,             -- JSON: tone do/don't shared across team (dcla:208)
  narrative_atoms          TEXT,             -- JSON: {audience,problem,outcome,story,framework,proof,offer} (dcla:210-213)
  audience_sophistication  TEXT              -- persuasion register knob (dcla:214)
                             CHECK (audience_sophistication IS NULL OR audience_sophistication IN
                               ('Unaware','Problem-Aware','Solution-Aware','Product-Aware','Most-Aware','Enterprise')),
  brand_colors             TEXT,             -- JSON: confidence-scored hex, [NEEDS VERIFICATION] flags (feature-map.json:261)
  brand_fonts              TEXT,             -- JSON: never-invented; flagged if unknown
  image_prompt_modifier    TEXT,             -- 50-75 word brand prompt-modifier (feature-map.json:261)
  created_at               TEXT NOT NULL,
  updated_at               TEXT
);

-- -----------------------------------------------------------------------------
-- personas — org-shared buyer personas (ONE shared PERSONAS per org; feature-map.json:287).
-- 8-component blueprint (persona-development-playbook). Members write TO a persona.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS personas (
  id                TEXT PRIMARY KEY,        -- uuid
  org_id            TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  name              TEXT NOT NULL,           -- persona label
  seniority_band    TEXT
                      CHECK (seniority_band IS NULL OR seniority_band IN
                        ('C-Suite','VP','Director','Manager','IC')),
                        -- Persona Seniority Bands, dimension-schemas.md:90-96
  buying_authority  TEXT,                    -- Economic Buyer|Budget Authority|Champion|Influencer|End User (dimension-schemas.md:92-96)
  titles            TEXT,                    -- JSON array of title examples
  identity_profile  TEXT,                    -- JSON: 8-component blueprint
  jobs_to_be_done   TEXT,                    -- JSON
  is_anti_persona   INTEGER NOT NULL DEFAULT 0,  -- from intake Q1.2.5 topic-exclusion (dcla:202, :147)
  source            TEXT,                    -- [SOURCE: file] traceability
  confidence        TEXT
                      CHECK (confidence IS NULL OR confidence IN ('High','Medium','Low')),
                        -- Confidence Level Definitions, dimension-schemas.md:175-179
  created_at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_personas_org ON personas(org_id);

-- -----------------------------------------------------------------------------
-- pains — org-shared pain library; each pain MUST pass the Pain Validation Gate
-- (weekly_trigger REQUIRED — persona-development-playbook.md:125-133; dcla:153-157).
-- Every nameable trigger moment = a postable hook.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pains (
  id              TEXT PRIMARY KEY,          -- uuid
  org_id          TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  persona_id      TEXT REFERENCES personas(id) ON DELETE SET NULL,
  pain            TEXT NOT NULL,             -- visceral, dated, embodied (dcla:194)
  weekly_trigger  TEXT NOT NULL,             -- REQUIRED: the weekly moment it hits the desk (gate)
  severity        TEXT NOT NULL
                    CHECK (severity IN ('P1','P2','P3','P4','P5')),
                      -- Pain Severity Scale, dimension-schemas.md:159-165
  message_angle   TEXT,                      -- the derived outreach/content angle
  source          TEXT,                      -- Q1.2 / Reddit-mined / etc. (dcla:198)
  confidence      TEXT
                    CHECK (confidence IS NULL OR confidence IN ('High','Medium','Low')),
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pains_org ON pains(org_id);
CREATE INDEX IF NOT EXISTS idx_pains_severity ON pains(org_id, severity);

-- -----------------------------------------------------------------------------
-- buying_signals — org event model (Pillar E/F news + signal ideation; dcla:203)
-- Categories from the 6+2 ranked taxonomy (dimension-schemas.md:135-144).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS buying_signals (
  id                TEXT PRIMARY KEY,
  org_id            TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  signal_category   TEXT NOT NULL
                      CHECK (signal_category IN
                        ('Former Customers / Alumni','Job Changes (Champions)','Hiring Signals',
                         'Funding Events','Technology Changes','Content Engagement',
                         'Regulatory Triggers','Market Expansion')),
                        -- Buying Signal Categories, dimension-schemas.md:137-144
  signal_strength   TEXT
                      CHECK (signal_strength IS NULL OR signal_strength IN ('A-tier','B-tier','C-tier')),
                        -- Signal strength grading, dimension-schemas.md:149-151
  description       TEXT,
  detection_source  TEXT,
  created_at        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_signals_org ON buying_signals(org_id);


-- =============================================================================
-- LAYER 2 (member) — MEMBERS (per-member voice + prose + beliefs), org_id FK
-- =============================================================================

-- -----------------------------------------------------------------------------
-- members — one per person; org_id is the isolation key on every read/write.
-- (deep-context-layer-architecture.md:220-224)
-- Approval roles: authority fields final-say|needs-approval|advisory (feature-map.json:295).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS members (
  member_id      TEXT PRIMARY KEY,           -- uuid
  org_id         TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  name           TEXT,
  email          TEXT,
  role           TEXT,                       -- job role / title
  app_role       TEXT NOT NULL DEFAULT 'member'
                   CHECK (app_role IN ('admin','member','approver')),
                     -- admin sets brand DNA; members draft; approver greenlights (feature-map.json:295)
  authority      TEXT NOT NULL DEFAULT 'needs-approval'
                   CHECK (authority IN ('final-say','needs-approval','advisory')),
                     -- approval-flow authority field (feature-map.json:295)
  persona_ref    TEXT REFERENCES personas(id) ON DELETE SET NULL,
                     -- which org persona this member writes TO (register modulation; dcla:262)
  linkedin_url   TEXT,                       -- for prose-sample bootstrap scrape + publishing
  onboarding_complete INTEGER NOT NULL DEFAULT 0,  -- gate: voice interview done? (feature-map.json:295)
  created_at     TEXT NOT NULL,
  updated_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_members_org ON members(org_id);

-- -----------------------------------------------------------------------------
-- voice_profiles — the 10-section core-voice schema (HOW they sound). One per member.
-- (deep-context-layer-architecture.md:225-237; core-voice.md:9-120)
-- JSON-blob columns hold the structured sub-schemas verbatim.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS voice_profiles (
  member_id              TEXT PRIMARY KEY REFERENCES members(member_id) ON DELETE CASCADE,
  org_id                 TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,  -- denorm for isolation queries
  core_attributes        TEXT,              -- JSON: {formality,directness,humor,contrarian_tendency,energy,vulnerability} (core-voice.md:9-27)
  sentence_patterns      TEXT,              -- JSON / text (core-voice.md:30-53)
  hook_formulas          TEXT,              -- JSON array of proven hooks (core-voice.md:56-74)
  hooks_to_avoid         TEXT,              -- JSON array — NEGATIVE signal (core-voice.md:69-74)
  formatting_conventions TEXT,              -- JSON (core-voice.md:77-94)
  vocabulary             TEXT,              -- JSON: {signature_terms[],phrases_that_sound_like_them[],phrases_to_avoid[]} (core-voice.md:97-120)
  spoken_vs_written_transform TEXT,         -- JSON: filler-strip, point-first flip (dcla:236)
  voice_summary          TEXT,              -- compact always-loaded index line (dcla:277)
  extracted_5char        TEXT,              -- JSON: cached 5-characteristic pre-draft extraction (dcla:295)
  created_at             TEXT NOT NULL,
  updated_at             TEXT
);

-- -----------------------------------------------------------------------------
-- prose_samples — L3 active style-transfer ingredient. 3-5 verbatim 200-600w posts.
-- REQUIRED (not optional); absence flags lower-fidelity fallback (dcla:239-244; LOADING-PROTOCOL.md:43-46,58-65).
-- One row per sample (the [] in the canonical model).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prose_samples (
  id            TEXT PRIMARY KEY,            -- uuid
  member_id     TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  org_id        TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  text          TEXT NOT NULL,               -- verbatim 200-600 word pre-AI post
  word_count    INTEGER,                     -- gate target 200-600 (LOADING-PROTOCOL.md:58-65)
  mode          TEXT,                        -- e.g. Builder-Teacher (dcla:242)
  source        TEXT,                        -- 'linkedin-scrape' | 'paste'
  created_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_prose_member ON prose_samples(member_id);

-- -----------------------------------------------------------------------------
-- beliefs — Expert POV core_beliefs + hot_takes (WHAT they believe). Per member.
-- (expert-pov-extractor SKILL.md:140-212; dcla:248-260)
-- type discriminates core_belief vs hot_take; Crawford gate fields apply to hot_takes.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS beliefs (
  id                     TEXT PRIMARY KEY,    -- uuid
  member_id              TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  org_id                 TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  belief_type            TEXT NOT NULL
                           CHECK (belief_type IN ('core_belief','hot_take')),
  statement              TEXT NOT NULL,
  evidence               TEXT,                -- core_belief: Evidence (expert-pov SKILL.md:145-149)
  positioning_implication TEXT,              -- core_belief
  contrarian_intensity   TEXT
                           CHECK (contrarian_intensity IS NULL OR contrarian_intensity IN ('H','M','L')),
                             -- H=industry pushes back; M=some disagree; L=under-practiced (expert-pov SKILL.md:145-149)
  -- hot_take-only fields:
  scope                  TEXT
                           CHECK (scope IS NULL OR scope IN ('content-safe','sales-only')),  -- (dcla:252)
  risk                   TEXT,                -- hot-take risk note (expert-pov SKILL.md:166-182)
  crawford_counterintuitive INTEGER,         -- Crawford 4-Test (expert-pov SKILL.md:166-182; dcla:114)
  crawford_specific         INTEGER,
  crawford_quantifiable     INTEGER,
  crawford_demonstrable     INTEGER,
  crawford_score         TEXT,                -- e.g. '4/4'; 4/4 -> positioning+content; <=2/4 -> internal only
  created_at             TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_beliefs_member ON beliefs(member_id, belief_type);

-- -----------------------------------------------------------------------------
-- expert_pov — singleton Expert POV records per member: taste_profile, pov_clusters,
-- OBI, belief_to_content_map (the per-person idea engine -> feeds the calendar).
-- (expert-pov-extractor SKILL.md:151-212; dcla:251-259)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expert_pov (
  member_id              TEXT PRIMARY KEY REFERENCES members(member_id) ON DELETE CASCADE,
  org_id                 TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  taste_profile          TEXT,              -- JSON: {admired[],quality_bar,overrated[],underrated[],anti_taste[]} (expert-pov SKILL.md:151-155)
  pov_clusters           TEXT,              -- JSON array: {topic,thesis,enemy,evidence,implication,formats[]} (expert-pov SKILL.md:163-164)
  obi_statement          TEXT,              -- One Big Idea meta-belief (expert-pov SKILL.md:186-202)
  obi_unifies            TEXT,              -- OBI 3-test
  obi_differentiates     TEXT,
  obi_defines_category   TEXT,
  belief_to_content_map  TEXT,              -- JSON array: {belief,thread_name,formats[],fletch_category,first_post_angle} (expert-pov SKILL.md:204-212)
  created_at             TEXT NOT NULL,
  updated_at             TEXT
);


-- =============================================================================
-- OPERATIONAL — POSTS (status lifecycle) + ENGAGEMENT (feed/perf metrics)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- posts — the draft->approval-queue->publish spine. CLONED FROM sends (db.mjs:35-49).
-- status lifecycle: draft -> pending -> approved -> published (+ rejected, scheduled).
-- (feature-map.json:302, :310; mirrors sends + template_state.enabled gate)
-- The author_member_id 'final-say' authority skips pending; else needs approver greenlight.
-- Strategy-card fields (pillar/post_type/format/hook/framework/psychology) lifted
-- from linkedin-content-agent step-2-strategy.json (lc-agent:147-163).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id            TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,        -- isolation key (== sends.client)
  author_member_id  TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  approver_member_id TEXT REFERENCES members(member_id) ON DELETE SET NULL,         -- who greenlit
  status            TEXT NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft','pending','approved','scheduled','published',
                                        'rejected','changes_requested','archived')),
                        -- full RBAC state machine (multi-tenancy-spec §4.3 draft_status): added
                        -- changes_requested + archived (R-G5/item-5; kept in sync with dimension-enums post_status)
  -- strategy card (deterministic routing, lc-agent step-2-strategy.json:147-163):
  pillar            TEXT
                      CHECK (pillar IS NULL OR pillar IN ('synthesis','access','contrarian','simplifying')),  -- lc-agent:151
  post_type         TEXT,                    -- message-type->post-type router output (feature-map.json:132)
  format            TEXT NOT NULL DEFAULT 'text'
                      CHECK (format IN ('text','carousel','lead_magnet','infographic')),  -- lc-agent:153
  framework_id      TEXT REFERENCES global_library_frameworks(id),  -- TEXT: frameworks.id is seed id ('aida') not int
  hook_id           TEXT REFERENCES global_library_hooks(id),       -- TEXT: hooks.id is seed id ('hook_001') not int
  selected_hook     TEXT,                    -- the resolved hook text (lc-agent:156)
  psychology_lever  TEXT,                    -- lc-agent:158
  message_type      TEXT
                      CHECK (message_type IS NULL OR message_type IN
                        ('experience','knowledge','opinion','observation','result','question')),  -- lc-agent step-1:137
  belief_id         TEXT REFERENCES beliefs(id) ON DELETE SET NULL,  -- belief-to-content provenance (dcla:259)
  -- content:
  body              TEXT,                    -- the post text (lc-agent step-3 post_text:170)
  character_count   INTEGER,                 -- lc-agent step-3:171; for fold/length linter
  carousel_slides   TEXT,                    -- JSON array of slides | NULL (lc-agent:172)
  visual_brief      TEXT,                    -- JSON | NULL (lc-agent:173)
  king_comment      TEXT,                    -- the first/king comment (lc-agent:177)
  reasoning         TEXT,                    -- generation reasoning (build-review-page Reasoning section)
  -- quality-gate state:
  sanitize_pass     INTEGER,                 -- 0/1 sanitize-copy.mjs hard-fail result (feature-map.json:91)
  sanitize_violations TEXT,                  -- JSON array of violations (feature-map.json:100)
  -- scheduling/publish:
  scheduled_at      TEXT,                    -- ISO-8601 slot (Tue-Thu 7:30-8:30; feature-map.json:140)
  published_at      TEXT,                    -- == sends.sent_at; set on publish
  linkedin_post_urn TEXT,                    -- platform id after publish (net-new publishing API)
  -- audit:
  created_at        TEXT NOT NULL,
  approved_at       TEXT,                    -- == template_state.approved_at semantics
  rejected_reason   TEXT,
  source_signal     TEXT                     -- build-review-page source_signal (Pillar E/F provenance)
);
CREATE INDEX IF NOT EXISTS idx_posts_org_status   ON posts(org_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_member_status ON posts(author_member_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_published    ON posts(org_id, published_at);  -- cadence lookback (== idx_sends_client_sent)

-- -----------------------------------------------------------------------------
-- engagement — inbound interactions + performance metrics on a published post.
-- CLONED FROM replies (db.mjs:54-65). Powers the learning loop (org.learnings; dcla:217).
-- intent enum mirrors replies.intent semantics for inbound DMs/comments.
-- NOTE: LinkedIn analytics ingestion is NET-NEW (no first-party export; feature-map.json:333).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engagement (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id           INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  org_id            TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  member_id         TEXT REFERENCES members(member_id) ON DELETE SET NULL,
  -- aggregate performance metrics (snapshot per pull):
  metric_type       TEXT NOT NULL DEFAULT 'snapshot'
                      CHECK (metric_type IN ('snapshot','interaction')),
  impressions       INTEGER,                 -- perf snapshot
  reactions         INTEGER,                 -- likes/celebrates/supports (analyze-influencer:56-127)
  comments_count    INTEGER,
  shares            INTEGER,
  saves             INTEGER,
  engagement_rate   REAL,                    -- computed reactions+comments / impressions
  captured_at       TEXT NOT NULL,           -- == replies.received_at; metric pull time
  -- per-interaction rows (metric_type='interaction'): an inbound comment/DM to act on
  interaction_kind  TEXT,                    -- comment | dm | reaction
  from_name         TEXT,
  from_linkedin_url TEXT,
  intent            TEXT,                    -- positive|objection|neutral... (== replies.intent)
  intent_confidence TEXT,                    -- (== replies.intent_confidence)
  message_text      TEXT,
  drafted_reply     TEXT                     -- AI-drafted response (== replies.handoff_path payload)
);
CREATE INDEX IF NOT EXISTS idx_engagement_post     ON engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_engagement_captured ON engagement(captured_at);


-- =============================================================================
-- OPERATIONAL — FEED (marked-people two-table model; cookie-free scrape)
-- *** feed_profiles + feed_posts are NOT defined here. ***
-- They were defined in BOTH this file and feed-schema.sql (R-G3 / critic finding 3 / decision 2):
-- the two definitions collided (different columns, different dedup keys, and feed-schema's earlier
-- feed_posts had no org_id). RESOLUTION: feed-schema.sql holds the SINGLE canonical, richer
-- definition (full 6-reaction breakdown, engagement averages, feed_weight, trigger classification),
-- and the per-prospect qualification scoring + auto-classification + drafted_comment/dm columns that
-- previously lived HERE have been MERGED INTO feed-schema.sql's canonical versions.
-- feed-schema.sql loads AFTER db-schema.sql (it FKs orgs(org_id)/members(member_id) defined above).
-- See ./feed-schema.sql §"LAYER: member — FEED PROFILES + FEED POSTS" and RECONCILIATION-CHANGELOG.md.
-- =============================================================================


-- =============================================================================
-- OPERATIONAL — member_cadence_state (posting-cadence + safety circuit-breaker)
-- ADAPTED FROM template_state (db.mjs:70-79). checkCircuitBreakers -> checkPostingCadence.
-- The outbound (client, signal_type) PK becomes (org_id, member_id): cadence is
-- PER PERSON (you cannot post 5x/day as one human even across pillars).
-- Safety numbers verified: 24hr spacing (+120% visibility / -50% if <24h),
-- 3-4x/week cap (linkedin-algorithm-2025-2026.md:183-184, :246; feature-map.json:140).
-- =============================================================================
CREATE TABLE IF NOT EXISTS member_cadence_state (
  org_id              TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
  member_id           TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
  auto_publish_enabled INTEGER NOT NULL DEFAULT 0,  -- == template_state.enabled (0 until approved)
  paused_reason       TEXT,                   -- set on auto-pause (== template_state.paused_reason)
  paused_at           TEXT,
  approved_at         TEXT,                   -- == template_state.approved_at
  last_publish_at     TEXT,                   -- == template_state.last_send_at; drives 24hr spacing check
  weekly_cap          INTEGER NOT NULL DEFAULT 4,   -- 3-4x/week max (default 4)
  min_spacing_hours   INTEGER NOT NULL DEFAULT 24,  -- hard-block < 24h spacing
  PRIMARY KEY (org_id, member_id)
);


-- =============================================================================
-- BOOT NOTE
-- After SCHEMA_SQL exec: PRAGMA journal_mode = WAL (db.mjs:98); INSERT
-- schema_meta('version','1') if absent (db.mjs:100-107). Seed the global_library_*
-- tables once from the KB markdown tables; orgs/members created at onboarding.
-- =============================================================================

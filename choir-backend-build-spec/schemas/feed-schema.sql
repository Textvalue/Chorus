-- =============================================================================
-- Choir — Personal Feed + News/Signal Engine + Trigger Catalog schema
-- Runnable SQLite DDL. Engineers seed/migrate directly from this file.
-- =============================================================================
-- *** LOAD ORDER: this file loads AFTER db-schema.sql. ***
-- db-schema.sql is the CANONICAL identity convention: orgs(org_id TEXT PK),
-- members(member_id TEXT PK). This file does NOT define orgs/members — it FKs into
-- the tables db-schema.sql created. (R-G2 / critic finding 1 / decision 1.) The old
-- orgs(id)/members(id) stubs that used to sit here were DELETED: under
-- CREATE TABLE IF NOT EXISTS they would have no-op'd against db-schema's tables and
-- left every FK below pointing at a non-existent `id` column.
-- Companion spec (rules + formulas + verbatim catalog): ../rules-engines/feed-and-signals.md
--
-- 3-layer data model:
--   global_library : trigger_catalog, trigger_urgency_window, news_type_decay (app-wide, read-only seed)
--   org            : tracked_accounts, tracked_topics, signal_cards (shared brand DNA / account list)
--   member         : feed_profiles, feed_posts (per-member watch-list; org_id + member_id FK)
--
-- feed_profiles + feed_posts are the SINGLE canonical definitions for the whole app
-- (they were duplicated in db-schema.sql; that duplicate was removed — R-G3 / decision 2).
-- The per-prospect qualification scoring + auto-classification + drafted comment/DM columns
-- that previously lived only in db-schema's copies are MERGED into the canonical versions below.
--
-- Sources (verbatim-traced; see spec for full citations):
--   feed_profile/feed_post two-table model + URL dedup
--     -> 02-outbound-systems/clay/analyze-influencer-post-engagement.md:92-99,135-157,189,299
--   cookie-free scheduled scrape, time-window
--     -> 02-outbound-systems/enrichment/linkedin-engagement-targeting-rapidapi.md:114-227
--   news capture fields + NOVEL/ACTION/KNOWN triage + decay windows
--     -> 02-outbound-systems/clay/signal-company-news.md:104-179,208-211
--   worked signal-row format (signal/date/source/expiry/angle)
--     -> 02-outbound-systems/enrichment/hr-tech-segment-signals-2026-05.md:46-124
--   trigger catalog (9 categories, 87 triggers, urgency windows, priority matrix)
--     -> 02-outbound-systems/enrichment/master-trigger-catalog.md:108-373,295-310
-- =============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- Org / member scaffolding: NONE HERE.
-- orgs(org_id) + members(member_id) are defined in db-schema.sql (loaded first).
-- Every FK below targets orgs(org_id) / members(member_id) — the canonical columns.
-- -----------------------------------------------------------------------------

-- =============================================================================
-- LAYER: global_library  — TRIGGER CATALOG (read-only app-wide seed)
-- 9 categories, 87 numbered triggers; near-duplicates preserved & grouped.
-- master-trigger-catalog.md:108-348
-- =============================================================================
CREATE TABLE IF NOT EXISTS trigger_catalog (
    id                  INTEGER PRIMARY KEY,         -- catalog # 1..81 (source numbering, verbatim)
    catalog_label       TEXT,                        -- e.g. "30b", "4/5" for grouped/lettered source rows
    name                TEXT NOT NULL,               -- e.g. "Multi-Thread Engagement"
    category_id         INTEGER NOT NULL,            -- 1..9 (see trigger_category)
    details             TEXT NOT NULL,               -- verbatim "Details" column
    data_sources        TEXT NOT NULL,               -- verbatim "Data Sources" column (comma list)
    intent_type         TEXT NOT NULL,               -- e.g. "Account-level intent", "Growth", "Risk"
    verticals           TEXT,                        -- Category 9 only (e.g. "Medical Devices, Aerospace")
    -- dedup of source near-duplicates (master-trigger-catalog.md:213-215)
    is_near_duplicate   INTEGER NOT NULL DEFAULT 0,  -- 1 if a near-dup of another row
    dedupe_group        TEXT,                        -- shared key for a near-dup group (NULL if unique)
    -- account-attribution gate (master-trigger-catalog.md:498-510)
    account_attributable INTEGER NOT NULL DEFAULT 1, -- 0 if data source is anonymized at source (G2/Capterra/TrustRadius)
    -- priority model (master-trigger-catalog.md:295-308)
    stack_rank          INTEGER,                     -- 1..10 deterministic tie-break; NULL if not ranked
    is_top25            INTEGER NOT NULL DEFAULT 0,   -- 1 if in the spec's seed-first top ~25 (spec §4.2)
    FOREIGN KEY (category_id) REFERENCES trigger_category(id)
);
CREATE INDEX IF NOT EXISTS ix_trigger_catalog_cat   ON trigger_catalog(category_id);
CREATE INDEX IF NOT EXISTS ix_trigger_catalog_stack ON trigger_catalog(stack_rank);
CREATE INDEX IF NOT EXISTS ix_trigger_catalog_group ON trigger_catalog(dedupe_group);

CREATE TABLE IF NOT EXISTS trigger_category (
    id           INTEGER PRIMARY KEY,   -- 1..9
    name         TEXT NOT NULL,
    trigger_count INTEGER NOT NULL,     -- declared count per source header
    is_first_party INTEGER NOT NULL DEFAULT 0  -- 1 for Cat 8 (CRM/relationship-origin signals)
);

-- Seed: the 9 categories (verbatim names + counts) master-trigger-catalog.md:108,125,140,156,165,184,199,314,334
INSERT OR REPLACE INTO trigger_category (id, name, trigger_count, is_first_party) VALUES
    (1, 'Hiring & Personnel',                                12, 0),
    (2, 'Funding & Financial',                               10, 0),
    (3, 'Technology & Digital',                              10, 0),
    (4, 'Legal & Compliance',                                 4, 0),
    (5, 'Market & Competitive',                              14, 0),
    (6, 'Sentiment & Reputation',                            10, 0),
    (7, 'Operational',                                        9, 0),
    (8, 'Relationship & Re-Engagement',                       7, 1),  -- first-party / CRM-origin (:328)
    (9, 'Industry-Specific Regulatory & Certification',       5, 0);

-- =============================================================================
-- LAYER: global_library — URGENCY WINDOWS + ANGLE TEMPLATES
-- Attaches window + message-angle template + best-persona to core trigger types.
-- Prose windows converted to hours so feed_weight (spec §1.4) and
-- signal_card.expires_at (spec §3.3) can consume them numerically.
-- master-trigger-catalog.md:232-248 (core) + :367-373 (Category 9)
-- =============================================================================
CREATE TABLE IF NOT EXISTS trigger_urgency_window (
    id                       INTEGER PRIMARY KEY AUTOINCREMENT,
    trigger_type             TEXT NOT NULL UNIQUE,   -- e.g. "competitor_churn", "new_funding_round"
    display_name             TEXT NOT NULL,          -- e.g. "Competitor churn"
    urgency_window_hours_min INTEGER NOT NULL,       -- earliest actionable (actionable_from offset)
    urgency_window_hours_max INTEGER NOT NULL,       -- expiry offset (stale after)
    window_prose             TEXT NOT NULL,          -- verbatim "Urgency Window" string
    angle_template           TEXT NOT NULL,          -- verbatim "Message Angle" template (with {{slots}})
    best_persona             TEXT NOT NULL,          -- verbatim "Best Persona"
    catalog_category_id      INTEGER REFERENCES trigger_category(id)
);

-- Seed: urgency windows (verbatim angle templates; hours computed from prose)
INSERT OR REPLACE INTO trigger_urgency_window
  (trigger_type, display_name, urgency_window_hours_min, urgency_window_hours_max, window_prose, angle_template, best_persona, catalog_category_id) VALUES
  ('hiring_target_role','Hiring for target role',0,672,'Within 1 week of posting. Stale after 4 weeks.','Hiring {{role}} usually means you''re building the {{function}} engine. Here''s what teams at your stage do first.','Hiring manager or their boss',1),
  ('leadership_change','Leadership change',336,1440,'Day 14-60 of new role. Too early = onboarding. Too late = already decided.','Most new {{title}}s in the first 90 days need to [outcome you help with]. Here''s what we see working.','The new executive directly',1),
  ('new_funding_round','New funding round',168,720,'Within 2 weeks. Stale after 30 days.','Post-{{round}}, most teams invest in [your category] within 90 days. Here''s what works.','CEO (Seed), VP Sales/CRO (Series A+), RevOps (Series B+)',2),
  ('earnings_revenue_event','Earnings/revenue event',24,504,'1-3 weeks after announcement','Miss: When the board is asking about pipeline, efficiency becomes the priority. Growth: Scaling from $Xm to $Ym usually means outbound becomes a must-have.','CFO, CRO, VP Sales',2),
  ('tech_stack_change','Tech stack change',0,336,'Within 2 weeks. Stack changes take 3-6 months to settle.','Teams migrating to {{newTool}} usually also rethink their {{yourCategory}} approach.','Stack owner: RevOps, VP Sales, or CTO depending on category',3),
  ('content_publication','Content publication',0,48,'Within 48 hours. Stale references look lazy, not relevant.','Your [post/article] about {{topic}} resonated. We''re seeing the same pattern across our clients.','The author directly',3),
  ('regulatory_market_change','Regulatory/market change',0,1344,'2-8 weeks after announcement','With {{regulation/change}}, most {{industry}} teams are rethinking {{category}}. Here''s what we''re seeing.','Compliance lead, General Counsel, COO',4),
  ('competitor_churn','Competitor churn',0,48,'Immediate. Highest-urgency trigger. Contact within 48 hours.','Teams moving off {{competitor}} typically care most about {{differentiator}}. Here''s how we handle that.','Original purchase decision-maker',5),
  ('product_launch','Product launch',168,672,'1-4 weeks after launch. During launch week they''re too busy.','New product launches usually mean new audience, new pipeline targets. How''s the GTM plan?','VP Marketing, VP Sales, or Product Marketing lead',5),
  ('award_recognition','Award or recognition',0,336,'Within 1-2 weeks. Congratulations expire quickly.','Congrats on {{award}}. Companies at your trajectory usually need {{what you offer}} next.','CEO, CMO, or award recipient',6),
  ('conference_event','Conference/event attendance',0,168,'1-2 weeks BEFORE the event or within 1 week after.','Before: Ahead of {{event}} -- thought you''d want to see this relevant to {{topic}}. After: Hope {{event}} was great. Based on the sessions, you might find this useful.','The attendee/speaker directly',7),
  ('ma_activity','M&A activity',720,2160,'30-90 days post-announcement (integration planning phase)','Post-acquisition teams usually need to consolidate tools and scale faster. Here''s what helps.','CTO, COO, VP Ops (integration leads)',7),
  ('iso_audit_certification','ISO audit/certification',2160,4320,'3-6 months before audit deadline (predictable cycles)','Companies preparing for ISO re-certification typically discover gaps in {{your category}}.','Quality Director, VP Operations',9),
  ('fda_510k_clearance','FDA 510(k) clearance',0,672,'Within 2-4 weeks of clearance (scale-up begins)','Teams scaling from clearance to production usually need {{your category}} within 90 days.','VP Regulatory, VP Engineering',9),
  ('patent_activity','Patent activity',720,2160,'1-3 months after filing cluster detected','Your recent patent activity in {{technology area}} suggests new product development. Companies at this stage typically evaluate {{your category}}.','VP Engineering, CTO, Director of R&D',9),
  ('product_recall','Product recall',0,168,'Immediate -- within 1 week (board-level scrutiny)','After a recall, teams need to overhaul {{process}} fast. Here''s what prevents recurrence.','VP Quality, CEO',9),
  ('engineering_hiring_surge','Engineering hiring surge',0,336,'Within 2 weeks of posting cluster','Hiring {{N}} engineers usually means a major product push. Teams at your stage often need {{your category}} to support the build.','VP Engineering, Hiring Manager, COO',9);

-- =============================================================================
-- LAYER: global_library — NEWS-TYPE DECAY DEFAULTS
-- The News-to-Outreach Mapping table (signal-company-news.md:171-179).
-- Used when a news item maps to a news_type rather than a fine-grained trigger.
-- =============================================================================
CREATE TABLE IF NOT EXISTS news_type_decay (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    news_type       TEXT NOT NULL UNIQUE,    -- 'data_breach','funding','product_launch','leadership_change','expansion'
    target_role     TEXT NOT NULL,           -- verbatim "Target Role"
    message_angle   TEXT NOT NULL,           -- verbatim "Message Angle"
    window_days_min INTEGER NOT NULL,        -- verbatim "Timing" lower bound
    window_days_max INTEGER NOT NULL,        -- verbatim "Timing" upper bound
    urgency_tier    TEXT NOT NULL            -- crisis|growth|change|market (signal-company-news.md:44-72)
);
INSERT OR REPLACE INTO news_type_decay (news_type, target_role, message_angle, window_days_min, window_days_max, urgency_tier) VALUES
  ('data_breach',      'CISO, CTO',                 'Security posture, incident response', 3,  7,  'crisis'),
  ('funding',          'CRO, CMO, VP Sales',        'Growth infrastructure, scaling',      7,  14, 'growth'),
  ('product_launch',   'CMO, VP Marketing',         'Go-to-market, demand gen',            14, 30, 'growth'),
  ('leadership_change','New exec directly',         'Fresh perspective, new priorities',   30, 60, 'change'),
  ('expansion',        'CRO, VP Sales',             'Regional scaling, team growth',       14, 30, 'growth');

-- =============================================================================
-- LAYER: org — TRACKED ACCOUNTS + TOPICS (what news to pull)  shared brand DNA
-- signal-company-news.md:76,90-102
-- =============================================================================
CREATE TABLE IF NOT EXISTS tracked_accounts (
    id            TEXT PRIMARY KEY,
    org_id        TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    company_name  TEXT NOT NULL,
    domain        TEXT,                         -- input company domain (claybook step 1)
    linkedin_url  TEXT,
    source        TEXT,                         -- 'abm'|'crm'|'manual'|'inbound'|'event'|'content-download'
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (org_id, domain)
);
CREATE INDEX IF NOT EXISTS ix_tracked_accounts_org ON tracked_accounts(org_id);

CREATE TABLE IF NOT EXISTS tracked_topics (
    id            TEXT PRIMARY KEY,
    org_id        TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    topic         TEXT NOT NULL,                -- ICP topic / keyword to match news against
    fetch_cadence TEXT NOT NULL DEFAULT 'weekly', -- 'daily'(crisis)|'weekly'(growth)|'monthly'(leadership) :208-211
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (org_id, topic)
);
CREATE INDEX IF NOT EXISTS ix_tracked_topics_org ON tracked_topics(org_id);

-- =============================================================================
-- LAYER: member — FEED PROFILES (the marked person) + FEED POSTS (scraped)
-- The two-table model. analyze-influencer-post-engagement.md:92-99
-- =============================================================================

-- feed_profile == Clay "Influencers Table" (profile-level). :96-133
-- CANONICAL definition (the db-schema.sql duplicate was removed — R-G3 / decision 2).
-- Merged in the per-prospect qualification scoring columns that previously lived only in db-schema.
-- FKs target orgs(org_id) / members(member_id) — the canonical db-schema columns (R-G2 / decision 1).
CREATE TABLE IF NOT EXISTS feed_profiles (
    id                    TEXT PRIMARY KEY,
    member_id             TEXT NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,  -- per-member watch-list (the marker)
    org_id                TEXT NOT NULL REFERENCES orgs(org_id)       ON DELETE CASCADE,  -- denormalized for isolation
    profile_url           TEXT NOT NULL,            -- tracked LinkedIn profile/company URL (scrape input)
    display_name          TEXT,
    headline              TEXT,                     -- profile headline/summary (:131-132)
    title                 TEXT,                     -- (merged from db-schema feed_profiles) job title
    company_name          TEXT,                     -- (merged from db-schema feed_profiles) account
    company_url           TEXT,                     -- (merged from db-schema feed_profiles)
    industry              TEXT,                     -- industry/specialization (:130)
    location              TEXT,
    languages             TEXT,
    profile_completeness  REAL,                     -- profile completeness score (:133)
    -- follower metrics (:111-114)
    follower_count        INTEGER,
    follower_growth_rate  REAL,
    connection_count      INTEGER,
    -- engagement averages (rolling, profile-level) (:123-127)
    avg_reactions_per_post REAL,
    avg_comments_per_post  REAL,
    avg_engagement_rate    REAL,                    -- baseline for feed_post.engagement_rate normalization (spec §1.4)
    engagement_trend       TEXT,                    -- 'increasing'|'decreasing' (:127)
    -- per-prospect qualification scoring (MERGED from db-schema feed_profiles; feature-map.json:211-220)
    person_authority_score   INTEGER,               -- 4-component rubric
    company_fit_score        INTEGER,
    lock_in_risk_score       INTEGER,
    buying_stage_score       INTEGER,
    verdict               TEXT
                            CHECK (verdict IS NULL OR verdict IN
                              ('PURSUE','PURSUE_NICHE','PURSUE_CHAMPION','NURTURE','DISQUALIFY')),
                              -- 5-verdict taxonomy (feature-map.json:212; agents-quality.md Chain N)
    displacement_difficulty  REAL,                  -- scalar (feature-map.json:212)
    -- watch-list + scrape control
    relationship          TEXT,                     -- 'peer'|'prospect'|'influencer'|'competitor'|'champion'
    active                INTEGER NOT NULL DEFAULT 1,
    scrape_interval_minutes INTEGER NOT NULL DEFAULT 60,  -- hourly default (:194 real-time/hourly/daily)
    last_scraped_at       TEXT,                     -- scrape time-window lower bound (rapidapi :125-130,:202-205)
    marked_at             TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (member_id, profile_url)                 -- a member marks a given person once
    -- NOTE: deliberately NOT UNIQUE(org_id, profile_url). The model is a per-MEMBER watch-list:
    -- two members of the same org may each independently track the same public profile. The
    -- db-schema duplicate's org-level UNIQUE(org_id,linkedin_url) was the wrong grain for the
    -- per-member model and is dropped (decision 2). org-level dedup belongs on feed_posts (public
    -- post), not feed_profiles (per-member follow). See feed_posts UNIQUE(org_id,url) below.
);
CREATE INDEX IF NOT EXISTS ix_feed_profiles_member ON feed_profiles(member_id);
CREATE INDEX IF NOT EXISTS ix_feed_profiles_org    ON feed_profiles(org_id, active);
CREATE INDEX IF NOT EXISTS ix_feed_profiles_due    ON feed_profiles(active, last_scraped_at);

-- feed_post == Clay "Posts Table" (post-level). DEDUP ON (org_id, url). :135-157,:189,:299
-- CANONICAL definition (the db-schema.sql duplicate was removed — R-G3 / decision 2).
-- FIXES vs the earlier feed-schema version: ADDED org_id NOT NULL (was absent — broke the isolation
-- invariant, critic finding 3); changed global UNIQUE(url) -> UNIQUE(org_id, url) so two orgs may each
-- track the same public post without colliding (decision 2). Merged in the auto-classification +
-- drafted comment/DM + engaged columns that previously lived only in db-schema's copy.
CREATE TABLE IF NOT EXISTS feed_posts (
    id                TEXT PRIMARY KEY,
    org_id            TEXT NOT NULL REFERENCES orgs(org_id)        ON DELETE CASCADE,  -- ADDED: isolation key (was missing)
    profile_id        TEXT NOT NULL REFERENCES feed_profiles(id)   ON DELETE CASCADE,
    member_id         TEXT NOT NULL REFERENCES members(member_id)  ON DELETE CASCADE,  -- denormalized for member-feed query
    -- DEDUP IDENTIFIER (:146 "Post URL -> Primary identifier"); scoped to org so two orgs don't collide
    url               TEXT NOT NULL,                 -- post URL (dedup within org via UNIQUE(org_id,url) below)
    content           TEXT,                          -- post content/copy (:152)
    post_type         TEXT,                          -- 'text'|'image'|'video'|'article-share' (:120,:155)
    published_at      TEXT NOT NULL,                 -- publish date+time (:153); drives golden-hour freshness
    -- reactions breakdown (the six LinkedIn reaction types, verbatim :154)
    react_like        INTEGER NOT NULL DEFAULT 0,
    react_celebrate   INTEGER NOT NULL DEFAULT 0,
    react_support     INTEGER NOT NULL DEFAULT 0,
    react_love        INTEGER NOT NULL DEFAULT 0,
    react_insightful  INTEGER NOT NULL DEFAULT 0,
    react_curious     INTEGER NOT NULL DEFAULT 0,
    reactions_total   INTEGER NOT NULL DEFAULT 0,    -- sum of the six
    comment_count     INTEGER NOT NULL DEFAULT 0,
    share_count       INTEGER,                       -- if available (:156)
    engagement_rate   REAL,                          -- (reactions+comments)/follower_count (:157)
    -- trigger classification (optional; enables urgency window) -> trigger_catalog / trigger_urgency_window
    trigger_id        INTEGER REFERENCES trigger_catalog(id),
    trigger_type      TEXT REFERENCES trigger_urgency_window(trigger_type),
    -- auto-classification + drafted engage actions (MERGED from db-schema feed_posts; feature-map.json:212-220)
    classification    TEXT,                          -- competitor_mention | pain | milestone | ... (6-category)
    drafted_comment   TEXT,                          -- AI comment in chosen style (feature-map.json:174)
    drafted_dm        TEXT,                          -- AI DM from template bank (feature-map.json:212), 300-char cap
    engaged           INTEGER NOT NULL DEFAULT 0,    -- did the rep act on it?
    engaged_at        TEXT,
    -- FRESHNESS / URGENCY weighting (spec §1.4) — stored for sort, recomputed on scrape + hourly decay job
    feed_weight       REAL NOT NULL DEFAULT 0,       -- 0..1 composite (golden-hour + urgency-window + engagement)
    golden_hour_flag  INTEGER NOT NULL DEFAULT 0,    -- 1 if within first 60 min of published_at at last compute
    weight_computed_at TEXT,
    -- scrape bookkeeping
    scraped_at        TEXT NOT NULL DEFAULT (datetime('now')),
    refreshed_count   INTEGER NOT NULL DEFAULT 0,    -- bumped on each ON CONFLICT(org_id,url) upsert
    UNIQUE (org_id, url)                             -- post-level dedup scoped to org (was global UNIQUE(url))
);
CREATE INDEX IF NOT EXISTS ix_feed_posts_profile   ON feed_posts(profile_id);
-- member feed default sort (spec §1.4): ORDER BY feed_weight DESC, published_at DESC
CREATE INDEX IF NOT EXISTS ix_feed_posts_member_feed ON feed_posts(member_id, feed_weight DESC, published_at DESC);
CREATE INDEX IF NOT EXISTS ix_feed_posts_org_fresh ON feed_posts(org_id, published_at);
CREATE INDEX IF NOT EXISTS ix_feed_posts_published  ON feed_posts(published_at);
CREATE INDEX IF NOT EXISTS ix_feed_posts_trigger    ON feed_posts(trigger_id);

-- Dedup upsert contract (spec §1.2): append new, update existing on (org_id, url) conflict
--   INSERT INTO feed_posts (id,org_id,profile_id,member_id,url,content,post_type,published_at,...)
--   VALUES (...)
--   ON CONFLICT(org_id, url) DO UPDATE SET    -- conflict target == UNIQUE(org_id,url) (decision 2)
--       react_like=excluded.react_like, ... , reactions_total=excluded.reactions_total,
--       comment_count=excluded.comment_count, share_count=excluded.share_count,
--       engagement_rate=excluded.engagement_rate,
--       scraped_at=datetime('now'), refreshed_count=feed_posts.refreshed_count+1;

-- =============================================================================
-- LAYER: org — SIGNAL CARDS (news->angle output)  shared; any member can claim
-- The angle card: situation + angle + persona + decay. Format modeled on the
-- HR-tech worked rows (hr-tech-segment-signals-2026-05.md:46-124) and the
-- news capture fields (signal-company-news.md:104-114).
-- =============================================================================
CREATE TABLE IF NOT EXISTS signal_cards (
    id              TEXT PRIMARY KEY,
    org_id          TEXT NOT NULL REFERENCES orgs(org_id) ON DELETE CASCADE,
    account_id      TEXT REFERENCES tracked_accounts(id) ON DELETE SET NULL,
    -- captured news fields (signal-company-news.md:108-114)
    headline        TEXT NOT NULL,
    source_name     TEXT,                       -- publication source
    source_url      TEXT NOT NULL,              -- article / primary-source URL (HR-tech rows: status pages, PR, blog)
    summary         TEXT,
    published_at    TEXT NOT NULL,              -- publication date (decay anchor)
    -- triage (spec §3.2)
    triage          TEXT NOT NULL CHECK (triage IN ('NOVEL','ACTION','KNOWN')),
    forced_clock    TEXT,                       -- if ACTION: the forced-decision clock (e.g. "funding deploy 90d")
    dedupe_theme    TEXT,                       -- theme key for KNOWN-suppression (already-carded check)
    relevance_score REAL,                       -- Claygent relevance score vs deep-context (:137; spec §3.5)
    -- the angle (spec §3.4 worked-row format)
    trigger_id      INTEGER REFERENCES trigger_catalog(id),
    news_type       TEXT REFERENCES news_type_decay(news_type),
    angle           TEXT NOT NULL,              -- generated angle / opener cue (the "so-what")
    best_persona    TEXT,                       -- inherited from trigger_urgency_window / news_type_decay
    weaponizability TEXT,                       -- 'highest'|'high'|'med-high'|'med'|'low-med'|'low' (HR-tech ranking)
    -- priority (spec §4.3)
    quadrant        TEXT CHECK (quadrant IN ('highest','act_fast','nurture','monitor')),
    compound_count  INTEGER NOT NULL DEFAULT 1, -- # distinct triggers on this account within 30d (:310 bump rule)
    -- decay / expiry (spec §3.3)
    actionable_from TEXT,                       -- earliest recommended send (window lower bound)
    expires_at      TEXT NOT NULL,              -- published_at + window upper bound; past this = stale/lazy
    last_validated  TEXT,                       -- source re-verification timestamp (HR-tech :104)
    needs_revalidation INTEGER NOT NULL DEFAULT 0, -- 1 when >60d (or faster for AI-feature categories) (:105-106)
    -- lifecycle
    status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','claimed','expired','suppressed')),
    claimed_by      TEXT REFERENCES members(member_id) ON DELETE SET NULL,  -- "any member can pick up the angle"
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS ix_signal_cards_org      ON signal_cards(org_id, status);
CREATE INDEX IF NOT EXISTS ix_signal_cards_account  ON signal_cards(account_id);
CREATE INDEX IF NOT EXISTS ix_signal_cards_expiry   ON signal_cards(expires_at);
CREATE INDEX IF NOT EXISTS ix_signal_cards_triage   ON signal_cards(triage);
CREATE INDEX IF NOT EXISTS ix_signal_cards_theme    ON signal_cards(org_id, dedupe_theme); -- KNOWN-suppression lookup

-- Decay job (spec §3.3): UPDATE signal_cards SET status='expired'
--   WHERE status IN ('active','claimed') AND datetime('now') > expires_at;
-- Revalidation flag (HR-tech :105-106): UPDATE signal_cards SET needs_revalidation=1
--   WHERE julianday('now') - julianday(last_validated) > 60;  -- tighter threshold for AI-feature categories

-- =============================================================================
-- SEED SAMPLE — top trigger #74 + a few high-value rows (spec §4.2)
-- Full 81-row seed maps 1:1 from master-trigger-catalog.md:112-346 (no transform).
-- =============================================================================
INSERT OR REPLACE INTO trigger_catalog
  (id, catalog_label, name, category_id, details, data_sources, intent_type, verticals, is_near_duplicate, dedupe_group, account_attributable, stack_rank, is_top25) VALUES
  -- THE flagged highest-value trigger: account-level multi-thread intent
  (74,'74','Multi-Thread Engagement',8,
   'Multiple contacts at the same account engage with your content, attend your events, or visit your website within a 14-day window',
   'Marketing automation (HubSpot, Marketo), website visitor ID (RB2B, Instantly), event platforms',
   'Account-level intent',NULL,0,NULL,1,3,1),
  (70,'70','Champion Job Change',8,
   'A past champion, power user, or closed-won contact moves to a new company that fits your ICP',
   'LinkedIn Sales Navigator alerts, CRM contact monitoring, UserGems, Champify',
   'Relationship',NULL,0,NULL,1,NULL,1),
  (73,'73','Competitor Dissatisfaction Signal',8,
   'Prospect or customer of a competitor posts a negative review, complaint, or "looking for alternatives" signal. NOT G2/Capterra/TrustRadius (reviewer company anonymous).',
   'Reddit/community posts, LinkedIn comments, Trustpilot business reviews, social listening tools',
   'Competitive',NULL,0,NULL,0,NULL,1),  -- account_attributable=0 (anonymized-source constraint :498-510)
  (13,'13','Investment Round',2,
   'Securing of new funding or capital influx',
   'Crunchbase Pro, PitchBook, CB Insights, Dealroom.co',
   'Growth',NULL,0,NULL,1,5,1),
  (1,'1','Recruitment Patterns',1,
   'Creation of new job titles or positions',
   'Indeed API, LinkedIn Talent Insights, Glassdoor Job Trends',
   'Structural',NULL,0,NULL,1,2,1),
  (43,'43','Competitor Activities',5,
   'Launch of new products by market rivals',
   'Crayon, Kompyte, Klue, Contify',
   'Competitive',NULL,1,'competitor_launch',1,1,1),
  (44,'44','Competitor Product Launch',5,
   'Introduction of new offerings by market rivals',
   'Crayon, Kompyte, Klue, ProductHunt',
   'Competitive',NULL,1,'competitor_launch',1,1,1),
  (31,'31','Cybersecurity Incidents',3,
   'Occurrences of data breaches or security issues',
   'HaveIBeenPwned API, SecurityScorecard, BitSight, RiskIQ',
   'Risk',NULL,0,NULL,1,NULL,1),
  (78,'78','FDA 510(k) Submissions & Clearances',9,
   'Medical device companies submitting 510(k) premarket notifications or receiving clearances. Indicates active product development and upcoming manufacturing scale-up.',
   'FDA 510(k) database (accessdata.fda.gov), FDA MAUDE, OpenFDA API, FDA Device Approvals, SEC filings',
   'Compliance / Growth','Medical Devices, Life Sciences',0,NULL,1,NULL,1),
  (80,'80','Product Recalls & Safety Events',9,
   'Companies appearing in FDA MAUDE adverse event reports, CPSC recall databases, or NHTSA recalls. Acute pain triggers forcing immediate process changes.',
   'FDA MAUDE, FDA Recalls (Enforcement Reports), CPSC Recalls API, NHTSA Recalls API, EU RAPEX Safety Gate',
   'Risk / Pain','Medical Devices, Consumer Products, Manufacturing, Automotive',0,NULL,1,NULL,1);
-- (engineers: seed the remaining ~71 rows verbatim from the catalog tables — same column order)

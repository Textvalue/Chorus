# State Store + Approval-Queue Spine — Service Spec

**What this is.** The Choir state store is a near-verbatim clone of the already-built, production-running autonomous-outbound state layer. Two files do all the work: `scripts/outbound/lib/db.mjs` (SQLite connection + schema + circuit-breaker logic, read this session in full) and `scripts/outbound/build-review-page.mjs` (the approval inbox — filesystem-as-queue renderer). Choir reshapes the tables (`sends`→`posts`, `replies`→`engagement`, `template_state`→`member_cadence_state`) and the `client` isolation key becomes `org_id`, but the interface, the persistence model, and the circuit-breaker math are lifted as-is.

Companion DDL: `../schemas/db-schema.sql`. Source feature-map blocks: `brainstorms/content-os-app/feature-map.json:310, :319, :328`.

---

## 1. Interface — better-sqlite3, WAL, single file, hand-written CREATE-IF-NOT-EXISTS

The store is one SQLite file opened through `better-sqlite3`, with a lazily-initialized singleton handle. There is **no migration tool** — the entire schema is a single `SCHEMA_SQL` string of `CREATE TABLE IF NOT EXISTS` statements executed once at boot. This is the exact pattern at `db.mjs:13-15, :29-110`.

### 1.1 Connection lifecycle (cloned from `db.mjs:82-117`)

```js
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";
import { join, resolve, dirname } from "path";

const ROOT = resolve(import.meta.dirname, "..", "..", "..");
const DB_PATH = join(ROOT, "data", "choir.db");   // outbound uses trigger-state/outbound.db (db.mjs:25)
const SCHEMA_VERSION = 1;                          // db.mjs:27

const SCHEMA_SQL = `...`;                          // the full CREATE-IF-NOT-EXISTS block (db-schema.sql Part 2)

let _db = null;

export function openDb({ readonly = false } = {}) { // db.mjs:93-110, cloned verbatim
  if (_db) return _db;                              // idempotent singleton
  ensureDirs();                                     // mkdir -p DB dir (db.mjs:84-87)
  _db = new Database(DB_PATH, { readonly });
  if (!readonly) {
    _db.pragma("journal_mode = WAL");               // db.mjs:98 — WAL = concurrent reads + crash-safe
    _db.exec(SCHEMA_SQL);                           // db.mjs:99 — idempotent; safe every boot
    const row = _db.prepare("SELECT value FROM schema_meta WHERE key = ?").get("version");
    if (!row) _db.prepare("INSERT INTO schema_meta (key, value) VALUES (?, ?)")
                 .run("version", String(SCHEMA_VERSION));   // db.mjs:100-107
  }
  return _db;
}

export function closeDb() { if (_db) { _db.close(); _db = null; } }   // db.mjs:112-117
```

**Why these choices (all from the proven original):**

| Decision | Rationale | Source |
|---|---|---|
| `better-sqlite3` | Synchronous API — no callback/promise plumbing; prepared statements; fastest embedded option for this scale | `db.mjs:20` |
| WAL mode | Concurrent reads during writes; crash-safe; zero-DevOps persistence | `db.mjs:98`; feature-map.json:319 ("SQLite WAL = zero-DevOps persistence") |
| Single file | One `choir.db`; back up by copying the file; no server | `db.mjs:17`, :25 |
| Hand-written `CREATE IF NOT EXISTS` | No migration framework; schema is code; re-exec on every boot is a no-op | `db.mjs:13-15`, :99 |
| `schema_meta` single-row version | New columns added inline via `ALTER` on bumped `SCHEMA_VERSION`; the row is the only "what version is this DB" signal | `db.mjs:14-15`, :30-33, :100-107 |
| Lazy singleton `_db` | One handle per process; repeat `openDb()` returns same handle | `db.mjs:82, 94` |
| `readonly: true` skips schema init | Read-only consumers (the review-page renderer, status dashboards) never touch DDL | `db.mjs:93, 97` |

**Schema evolution rule (no migrations):** to add a column, append `ALTER TABLE x ADD COLUMN ...` to `SCHEMA_SQL` (guard with a `schema_meta.version` check or a `try/catch` on the duplicate-column error), bump `SCHEMA_VERSION`. SQLite `ADD COLUMN` is non-destructive and instant. This is the documented evolution path at `db.mjs:13-15`.

### 1.2 Mutation helpers (the db.mjs export surface, reshaped)

The original exports typed helper functions that wrap prepared statements (`recordSend`, `countSendsToday`, `recordReply`, `upsertTemplateState`, `pauseTemplate`, `checkCircuitBreakers`, `getMetricsSummary` — `db.mjs:121-399`). Choir keeps the same surface shape, reshaped to posts/engagement/cadence. Every helper opens via `openDb()` and uses `INSERT OR IGNORE` for idempotency where the original does.

| Outbound helper (`db.mjs`) | Choir helper | Notes |
|---|---|---|
| `recordSend()` :121-157 | `recordPublish()` | `INSERT OR IGNORE` into `posts` on publish; on success bumps `member_cadence_state.last_publish_at` (mirrors :151-154) |
| `countSendsToday()` :175-183 | `countPublishesToday()` | start-of-day ISO floor (:176-177) over `posts.published_at` |
| `countSendsForTemplate()` :159-173 | `countPublishesForMember()` | optional `sinceIso` lookback window |
| `recordReply()` :187-214 | `recordEngagement()` | `INSERT OR IGNORE` into `engagement` (dedup on a message/interaction id) |
| `countRepliesForTemplate()` :216-240 | `countEngagementForMember()` | JOIN engagement→posts on post_id (mirrors the reply↔send JOIN :224-228) |
| `getTemplateState()` :244-253 | `getCadenceState()` | by `(org_id, member_id)` |
| `upsertTemplateState()` :255-299 | `upsertCadenceState()` | `COALESCE`-based partial update (:266-282) |
| `pauseTemplate()` :301-309 | `pauseMember()` | sets `auto_publish_enabled=0` + reason + timestamp |
| `listTemplateStates()` :311-316 | `listCadenceStates()` | all members in an org |
| `checkCircuitBreakers()` :330-373 | `checkPostingCadence()` | see §3 — the load-bearing port |
| `getMetricsSummary()` :377-399 | `getOrgMetrics()` | 7-day publish/engagement rollup per member |

**Idempotency invariant (cloned):** every write that could double-fire uses `INSERT OR IGNORE` against a `UNIQUE` constraint, and returns `{ recorded: res.changes > 0 }` (`db.mjs:138-157, :202-213`). In Choir, `posts` has no natural send-uniqueness (each draft is distinct), so idempotency moves to the **publish step**: `recordPublish()` guards on `linkedin_post_urn` / a publish-idempotency key so a retried publish does not double-post. The feed tables enforce dedup via `UNIQUE(org_id, linkedin_url)` (profiles) and `UNIQUE(org_id, post_url)` (posts) — the "dedup on URL" rule (feature-map.json:196).

---

## 2. The draft → approval-queue → publish spine

This is the already-built spine (feature-map.json:310): a generation service writes drafts, an approval inbox renders them for human review, a human flips status, a pusher publishes approved items. Choir clones all three.

### 2.1 The filesystem-IS-the-queue pattern (MVP) — from `build-review-page.mjs`

For the MVP, the approval queue is **a folder of markdown files**, not a DB table. Each draft is one `.md` file with YAML frontmatter carrying `status`; the human edits `status:` in the file; a static HTML page renders the queue. This is exactly what `build-review-page.mjs` does over `workspace/outbound-approval-queue/*.md` (`build-review-page.mjs:22, :103-135`).

**How the renderer works (verbatim mechanics, `build-review-page.mjs`):**

1. **Scan the queue dir** — `readdirSync(queueDir)`, keep `*.md` (`:103-108`).
2. **Parse frontmatter** — regex `^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$`, split `key: value` lines, strip surrounding quotes (`:36-54`). CRLF-tolerant (`\r?\n`) — Windows-safe.
3. **Status filter** — default visible set is `pending, approved, rejected, broken-reference` (`:32`); overridable via `--status pending,approved` (`:27-34`). A draft whose `meta.status` is not in the set is skipped (`:112`).
4. **Extract sections** — `extractSection(body, "Subject"|"Body"|"Reasoning")` pulls the markdown `## Subject` / `## Body` / `## Reasoning` blocks (`:56-60, :116-120`). For Choir the sections are `## Hook`, `## Body`, `## CTA`, `## Reasoning` (the generation service output shape).
5. **Sort** — pending first, then by `signal_type`, then by `company` (`:126-134`). Choir sorts pending-first, then by `pillar`/`member`.
6. **Render cards** — one `<article>` per draft, header with lead/company + two badges (signal type, status), a subject block, a paragraphized body, a collapsible `<details>` reasoning block, footer with filename + source signal (`:166-205`). Vanilla HTML + scoped CSS, **no server, no framework — `file://` works** (`:8`).
7. **Write + auto-open** — `writeFileSync(outFile)` then `start "" <file>` on Windows (`:494-501`).

**Status enum from the renderer (the colors are the source of truth for the set):** `pending` (amber), `approved` (emerald), `rejected` (red), `sent` (blue), `broken-reference` (red-600, "quarantined, never push") — `build-review-page.mjs:91-101`. Signal-type badge palette: `job_change, hiring_spike, boomerang, competitor_ats, funded_scaleup` (`:79-89`) — Choir replaces these with pillar colors (`synthesis/access/contrarian/simplifying`).

**The approval handshake (verbatim, `build-review-page.mjs:455-463`):**

> 1. Read the drafts. Check voice, angle, that the soft CTA fits.
> 2. Run `/approve-template <signal_type>`.
> 3. Walk through 5 samples one by one. Approve / reject / edit each.
> 4. If ≥3 of 5 approve, the template flips to `enabled: true` and the system auto-fires it on every future qualifying signal.

Choir keeps this exact gate, retargeted: `/approve-template <pillar>` walks 5 sample drafts; **≥3 of 5 approved flips `member_cadence_state.auto_publish_enabled = 1`** (== `template_state.enabled = 1`), authorizing auto-publish for that member/pillar. This is the `db.mjs` `enabled` flag semantics (`db.mjs:73, :336-340`).

### 2.2 Status lifecycle (DB-backed, post-MVP)

The MVP filesystem queue graduates to the `posts.status` column once multi-user/multi-org concurrency matters. The lifecycle (db-schema.sql `posts.status` CHECK):

```
draft ──► pending ──► approved ──► scheduled ──► published
  │           │            │
  │           └──► rejected (rejected_reason set)
  └──► (author with authority='final-say' skips pending; feature-map.json:295)
```

- **draft** — generation service wrote it; not yet submitted.
- **pending** — submitted for approval; visible in the approver's inbox. (Authors whose `members.authority = 'final-say'` skip straight to approved; `needs-approval` authors must transit pending — `feature-map.json:295`.)
- **approved** — an `approver` greenlit it; `approver_member_id` + `approved_at` set.
- **scheduled** — slotted into a cadence-legal time (`scheduled_at`; Tue-Thu 7:30-8:30AM — feature-map.json:140); awaiting the publish cron.
- **published** — pushed to LinkedIn; `published_at` + `linkedin_post_urn` set. This is the row that `checkPostingCadence` counts.
- **rejected** — declined; `rejected_reason` set. Terminal.

The transition that fires the safety check is **scheduled → published**: the publish worker calls `checkPostingCadence()` immediately before pushing, and refuses (leaving status `scheduled`, re-queued) if a breaker trips.

### 2.3 Generation → queue wiring

The generation service (`scripts/outbound/lib/claude-draft.mjs`, cloned per feature-map.json:319) returns structured `{ hook, body, cta, reasoning }`. The spine writes that as a `status: draft` post (MVP: an `.md` file in the queue dir with that frontmatter; DB: a `posts` row). The renderer then surfaces it. Nothing auto-publishes until both (a) a human flips status to approved/the `/approve-template` gate passes, and (b) `checkPostingCadence()` returns `{ ok: true }`.

---

## 3. checkCircuitBreakers → Choir posting-cadence + safety guards

This is the load-bearing port. `checkCircuitBreakers()` (`db.mjs:330-373`) returns `{ ok: true }` if a template may fire, or `{ ok: false, reason }` if a breaker tripped. It applies three breakers in order; Choir maps each to a LinkedIn posting-safety guard with KB-verified numbers.

### 3.1 The original logic (verbatim, `db.mjs:330-373`)

```js
export function checkCircuitBreakers({ client, signal_type, cfg }) {
  // BREAKER 1 — enabled / paused gate (db.mjs:331-342)
  const state = getTemplateState({ client, signal_type });
  if (state) {
    if (state.enabled === 0 && state.paused_reason)
      return { ok: false, reason: `paused: ${state.paused_reason}` };
    if (state.enabled === 0)
      return { ok: false, reason: "template not enabled (requires /approve-template)" };
  }

  // BREAKER 2 — daily cap (db.mjs:344-351)
  const dailyCap = cfg.circuit_breakers?.daily_cap_per_template ?? 50;
  const sentToday = countSendsToday({ client, signal_type });
  if (sentToday >= dailyCap)
    return { ok: false, reason: `daily cap ${dailyCap} hit (${sentToday} sent today)` };

  // BREAKER 3 — reply-rate floor, enforced only after min sends (db.mjs:353-370)
  const minSendsForReplyFloor = cfg.circuit_breakers?.reply_rate_min_sends_before_enforce ?? 150;
  const totalSends = countSendsForTemplate({ client, signal_type });
  if (totalSends >= minSendsForReplyFloor) {
    const positiveReplies = countRepliesForTemplate({ client, signal_type, intent: "positive" });
    const floor = cfg.circuit_breakers?.reply_rate_floor ?? 0.02;   // 2%
    const rate = positiveReplies / totalSends;
    if (rate < floor) {
      const reason = `reply rate ${(rate*100).toFixed(1)}% < floor ${(floor*100).toFixed(1)}% (${positiveReplies}/${totalSends})`;
      pauseTemplate({ client, signal_type, reason: `auto: ${reason}` });  // AUTO-PAUSE side effect (db.mjs:367)
      return { ok: false, reason };
    }
  }
  return { ok: true, sentToday, totalSends };
}
```

**Three structural properties to preserve in Choir:**
1. **Order matters** — cheap gate (enabled) first, then a count query, then the join+ratio. Short-circuit on the first failure (mirrors the sequential gate model).
2. **Hysteresis on the rate floor** — the reply-rate breaker only enforces after `min_sends_before_enforce` events, so a new template isn't killed on a tiny denominator (`db.mjs:353-356`). Choir keeps this: don't pause a member's pillar on 2 posts.
3. **Auto-pause is a side effect** — tripping the rate floor calls `pauseTemplate()` so it stays off until a human re-approves (`db.mjs:366-367`). Choir keeps the auto-pause.

### 3.2 The Choir mapping — `checkPostingCadence({ org_id, member_id, cfg })`

Choir reshapes the three outbound breakers into LinkedIn posting-safety guards. The grouping key changes from `(client, signal_type)` to `(org_id, member_id)` — **cadence is per human**, because the constraint is a person's posting velocity, not a template's. Numbers below are KB-verified.

| # | Outbound breaker | Choir guard | Logic | Verified number / source |
|---|---|---|---|---|
| **1** | `enabled`/`paused` gate (`db.mjs:331-342`) | **Auto-publish gate** | `member_cadence_state.auto_publish_enabled === 0` → block. If `paused_reason` set → `paused: <reason>`; else → "requires /approve-template" | The `enabled` flag flips on ≥3/5 approval (`build-review-page.mjs:461`) |
| **2** | daily cap per template (`db.mjs:344-351`) | **Weekly + spacing cap** | (a) `countPublishesThisWeek(member) >= weekly_cap` → block; (b) `hoursSince(last_publish_at) < min_spacing_hours` → block | **3-4x/week cap** (default 4); **24hr min spacing** — `linkedin-algorithm-2025-2026.md:183-184` ("24+ hours between posts; twice within 24h cannibalizes reach up to 50%; 24hr spacing = +120% visibility"), :246 ("3/week optimal, 24hr spacing") |
| **3** | reply-rate floor, hysteresis + auto-pause (`db.mjs:353-370`) | **Engagement-rate floor** | After `min_posts_before_enforce` published posts, if `avg_engagement_rate < floor` → auto-pause the member's auto-publish + return reason | Hysteresis + auto-pause cloned verbatim; floor is a config knob (no KB-mandated number — flag as net-new calibration). First-60-90-min weighting is the metric window (`linkedin-algorithm-2025-2026.md:96`) |

**Choir `checkPostingCadence` (the port):**

```js
export function checkPostingCadence({ org_id, member_id, cfg }) {
  // GUARD 1 — auto-publish gate (== BREAKER 1)
  const state = getCadenceState({ org_id, member_id });
  if (state) {
    if (state.auto_publish_enabled === 0 && state.paused_reason)
      return { ok: false, reason: `paused: ${state.paused_reason}` };
    if (state.auto_publish_enabled === 0)
      return { ok: false, reason: "auto-publish not enabled (requires /approve-template)" };
  }

  // GUARD 2a — weekly cap (== BREAKER 2, count form)
  const weeklyCap = state?.weekly_cap ?? cfg.cadence?.weekly_cap ?? 4;   // 3-4x/week
  const weekStart = startOfWeekIso();
  const publishedThisWeek = countPublishesForMember({ org_id, member_id, sinceIso: weekStart });
  if (publishedThisWeek >= weeklyCap)
    return { ok: false, reason: `weekly cap ${weeklyCap} hit (${publishedThisWeek} this week)` };

  // GUARD 2b — minimum spacing (the LinkedIn-specific add: 24hr hard block)
  const minSpacingH = state?.min_spacing_hours ?? cfg.cadence?.min_spacing_hours ?? 24;
  if (state?.last_publish_at) {
    const hoursSince = (Date.now() - Date.parse(state.last_publish_at)) / 3_600_000;
    if (hoursSince < minSpacingH)
      return { ok: false, reason: `spacing ${hoursSince.toFixed(1)}h < ${minSpacingH}h (cannibalizes reach up to 50%)` };
  }

  // GUARD 3 — engagement-rate floor, hysteresis + auto-pause (== BREAKER 3)
  const minPosts = cfg.cadence?.engagement_min_posts_before_enforce ?? 20;
  const totalPosts = countPublishesForMember({ org_id, member_id });
  if (totalPosts >= minPosts) {
    const avgRate = getAvgEngagementRate({ org_id, member_id });   // from engagement table
    const floor = cfg.cadence?.engagement_rate_floor ?? null;       // NET-NEW calibration — no KB number
    if (floor != null && avgRate < floor) {
      const reason = `engagement rate ${(avgRate*100).toFixed(1)}% < floor ${(floor*100).toFixed(1)}% (${totalPosts} posts)`;
      pauseMember({ org_id, member_id, reason: `auto: ${reason}` });  // AUTO-PAUSE side effect
      return { ok: false, reason };
    }
  }
  return { ok: true, publishedThisWeek, totalPosts };
}
```

### 3.3 Additional deterministic safety guards (pre-publish linter)

Beyond the three circuit breakers, Choir runs a **deterministic pre-publish linter** before scheduled→published (feature-map.json:146), each warning citing its source line. These are not in `db.mjs` (the outbound pusher's safety is the three breakers) — they are the LinkedIn-publishing equivalent and the spec calls them out as net-new linter rules:

| Linter check | Threshold | Source |
|---|---|---|
| Links in body | -60% reach → move to first comment | feature-map.json:146 |
| Hashtag count | 6+ hashtags flagged | feature-map.json:146 |
| Hook past fold | hook > 210 chars (the "see more" fold) | feature-map.json:146; linkedin-hooks-playbook.md:325 |
| Missing CTA | flag | feature-map.json:146 |
| Em-dash density | > 1 / paragraph → hard-fail via `sanitizeCopy` | feature-map.json:91; sanitize-copy gate |
| Posting time | outside Tue-Thu 7:30-8:30AM slot → warn | feature-map.json:140 |

The em-dash / kill-word / banned-phrase subset is enforced by the ported `sanitizeCopy(text, {register})` gate (feature-map.json:100, :330), whose `{ pass, violations }` result lands in `posts.sanitize_pass` / `posts.sanitize_violations`. A `sanitize_pass = 0` post cannot reach `approved`.

---

## 4. Config shape (the `cfg` object)

`checkCircuitBreakers` reads thresholds from a passed `cfg.circuit_breakers` block with defaults inline (`db.mjs:344, :353-354, :362`). Choir mirrors this with a `cfg.cadence` block — per-org overridable, stored alongside brand DNA or in a config file:

```jsonc
{
  "cadence": {
    "weekly_cap": 4,                         // 3-4x/week (default 4); algorithm:246
    "min_spacing_hours": 24,                 // hard block <24h; algorithm:183-184
    "engagement_min_posts_before_enforce": 20,  // hysteresis (== reply_rate_min_sends_before_enforce 150)
    "engagement_rate_floor": null,           // NET-NEW: no KB-mandated number — calibrate per org
    "posting_window": { "days": ["Tue","Wed","Thu"], "start": "07:30", "end": "08:30" }  // feature-map.json:140
  }
}
```

`member_cadence_state.weekly_cap` and `.min_spacing_hours` are per-member column overrides of the org `cfg` defaults (a member can be throttled tighter than the org default without a config change).

---

## 5. Net-new vs cloned — what an engineer builds fresh

**Cloned almost verbatim (hours, not days — feature-map.json:319):**
- `openDb`/`closeDb`/`ensureDirs`, WAL, schema_meta, the singleton handle — `db.mjs:82-117`.
- The mutation-helper surface + `INSERT OR IGNORE` idempotency — `db.mjs:121-316`.
- `checkCircuitBreakers` three-breaker structure incl. hysteresis + auto-pause — `db.mjs:330-373`.
- The approval-inbox renderer (frontmatter parse, section extract, status filter, card render, file://, auto-open) — `build-review-page.mjs` entire.
- The ≥3/5 approval gate flipping `enabled` — `build-review-page.mjs:455-463`.

**Net-new (flagged; not in the outbound layer):**
- **Engagement-rate floor number** — `db.mjs` has a 2% reply-rate floor for cold email; LinkedIn engagement-rate has no KB-mandated floor. `engagement_rate_floor` defaults `null` (disabled) until calibrated.
- **24hr spacing guard (GUARD 2b)** — the outbound breaker is a daily *count* cap; LinkedIn needs an additional *time-since-last* guard. Numbers are KB-verified (`algorithm:183-184`); the guard itself is the LinkedIn-specific add.
- **DB-backed status lifecycle** — the outbound queue is filesystem-only; Choir's `posts.status` column + transitions are the multi-user graduation (the MVP can ship filesystem-only exactly like outbound).
- **LinkedIn publishing + analytics ingestion** — the publish step and the metric pull feeding `engagement` are net-new integrations (no first-party LinkedIn export — feature-map.json:333). The state store is ready for them; the connectors are not in the KB.

---

## 6. Files central to this spec (absolute paths)

- `C:\Users\Lovro Culina\Desktop\projects\gtm-context-os-quickstart-main\scripts\outbound\lib\db.mjs` — schema, connection, all helpers, `checkCircuitBreakers`
- `C:\Users\Lovro Culina\Desktop\projects\gtm-context-os-quickstart-main\scripts\outbound\build-review-page.mjs` — approval-inbox renderer, filesystem-as-queue, status enum, approval handshake
- `C:\Users\Lovro Culina\Desktop\projects\gtm-context-os-quickstart-main\my-context-os\02-outbound-systems\autonomous-outbound-pattern.md` (:74-122) — architecture diagram, STATE block (`tables: signals, contacts, drafts, sends, replies, circuit_breakers`; breakers: per-fetcher daily cap, per-sender daily cap, cost ceiling)
- `C:\Users\Lovro Culina\Desktop\projects\gtm-context-os-quickstart-main\my-context-os\04-linkedin-content\growth\linkedin-algorithm-2025-2026.md` (:96, :183-184, :246) — first-60-90-min window, 24hr spacing +120%/-50%, 3x/week optimal
- `C:\Users\Lovro Culina\Desktop\projects\gtm-context-os-quickstart-main\brainstorms\content-os-app\backend-build-spec\schemas\db-schema.sql` — companion DDL

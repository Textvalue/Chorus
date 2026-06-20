# Choir — Multi-Tenancy, Isolation, Generation-Gate & RBAC Spec

> ENGINEER-READY backend spec. Each section ports a real KB enforcement mechanism (hook code, workspace standard, loading protocol) into app logic. Bash → app-logic translations are explicit. Cite-traced per block.
>
> **Source files:**
> - `.claude/hooks/pre-tool-guard.sh` — the live enforcement hook (Check 1 isolation, Check 2 write gate, Check 2.6 voice/generation gate)
> - `my-context-os/09-agency/client-workspace-standards.md` — org/member layering, shared-vs-isolated, decision authority fields, nested tenancy
> - `my-context-os/_synthesis/context-os-architecture-synthesis.md` — tenancy economics, governance, the OPEN single→multi-player gap
> - `.claude/voice-dna/LOADING-PROTOCOL.md` — 4-layer load order + the "voice NEVER mixes" isolation rule
>
> **Data-model layering (carry through every table):** `global_library` (app-wide read-only seed DBs) ABOVE → `orgs` (shared brand DNA, ICP, personas) ABOVE → `members` (per-member voice + prose_samples + beliefs, `org_id` FK).

---

## 0. Source-Reality Note (read before implementing)

The KB enforces tenancy at the granularity of a **whole client folder** = one tenant. There is **no** per-member isolation primitive in the KB today — voice-DNA isolation in the KB is owner-vs-client (two tenants), never member-vs-member inside one tenant. Sections 1–4 port what EXISTS. Section 5 is the NET-NEW design surface the KB explicitly flags as unsolved (`context-os-architecture-synthesis.md:785`, `:816`). Do not treat Section 5 as ported — it is invention required by Choir's multiplayer model.

---

## 1. THE ISOLATION INVARIANT (port of Check 1)

### 1.1 Source: the actual bash

`.claude/hooks/pre-tool-guard.sh:173-217` (Check 1: Client Isolation):

```bash
# :176  if echo "$FILE_PATH" | grep -qi "09-agency/clients/"; then
# :178    CLIENT=$(... extract folder after clients/ ...)
# :181    STATE_FILE=".client-session"
# :183    if [ -f "$STATE_FILE" ]; then
# :184      PREV_CLIENT=$(cat "$STATE_FILE")
# :185      if [ -n "$PREV_CLIENT" ] && [ "$PREV_CLIENT" != "$CLIENT" ]; then
# :187        echo "CLIENT ISOLATION VIOLATION ... One client per conversation." >&2
# :188        exit 2          # <-- HARD BLOCK
#         fi
#       fi
# :193    echo "$CLIENT" > "$STATE_FILE"   # bind session to this client
#       # :195-216 MCP-CLIENT BINDING: verify .active-client-mcp == CLIENT, else exit 2
#   fi
```

What it does: the **first** client folder touched in a session writes `.client-session`. Every subsequent file op whose path resolves to a *different* client `exit 2` (hard block). A second guard (`:195-210`) verifies the active MCP credential set (`.active-client-mcp`) matches the bound client — wrong API keys = different tenant = block.

### 1.2 Bash → App-Logic Translation

| Bash primitive | App equivalent |
|---|---|
| `FILE_PATH` contains `09-agency/clients/<X>` | every DB row / API request carries `org_id` |
| `.client-session` state file | `session.org_id` (set at auth, immutable for session lifetime) |
| `PREV_CLIENT != CLIENT → exit 2` | `request.org_id != session.org_id → 403 reject` |
| MCP credential binding (`.active-client-mcp`) | per-org integration credentials (LinkedIn token, etc.) keyed by `org_id`; never resolved from any other org |
| Hook runs PRE-tool, client-side advisory | **server-side at the query layer** — NOT client-supplied, NOT advisory |

### 1.3 The Invariant (implementable statement)

**INV-1 (Session binding):** A session is bound to exactly one `org_id` at authentication. `session.org_id` is set once from the authenticated member's `members.org_id` and is immutable for the session lifetime. There is no "switch org mid-session" — like the KB's "one client per conversation" (`client-workspace-standards.md:369` "❌ Mix content from different clients"), switching orgs requires a new session.

**INV-2 (Every read/write carries org_id):** Every query against an org-scoped or member-scoped table MUST include `WHERE org_id = :session_org_id`. Member-scoped queries additionally constrain `WHERE org_id = :session_org_id AND member_id = :target_member_id` where `target_member_id.org_id` is verified equal to `session_org_id`.

**INV-3 (Cross-org rejection is SERVER-SIDE at the query layer):** Reject — never trust a client-supplied `org_id`. The check is the port of `exit 2`:

```
ENFORCE at the data-access layer (not the controller, not the client):
  resolved_org_id := lookup(resource.id).org_id          // from the row itself
  IF resolved_org_id != session.org_id:
      AUDIT_LOG("isolation_violation", {session_org_id, attempted_org_id: resolved_org_id, resource})
      RAISE 403 CrossOrgAccessDenied                       // == bash exit 2
```

**Implementation requirement — Postgres Row-Level Security (RLS) as the floor.** Application `WHERE` clauses are the equivalent of the *advisory* hook; RLS is the equivalent of the *hard* `exit 2` that cannot be bypassed by a forgotten clause:

```sql
-- runs once per connection / transaction
SET app.current_org_id = '<session.org_id>';

-- Table names are the CANONICAL db-schema.sql names (R-G5 / decision 7): voice_profiles (not
-- member_voice_profiles), posts (not drafts), brand_dna (not org_brand_dna), personas (not
-- org_personas). The org "ICP" is not a single table — it is the personas/pains/buying_signals set.
ALTER TABLE members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE prose_samples   ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_profiles  ENABLE ROW LEVEL SECURITY;   -- was member_voice_profiles
ALTER TABLE beliefs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_pov      ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts           ENABLE ROW LEVEL SECURITY;   -- was drafts
ALTER TABLE engagement      ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_dna       ENABLE ROW LEVEL SECURITY;   -- was org_brand_dna
ALTER TABLE personas        ENABLE ROW LEVEL SECURITY;   -- was org_personas
ALTER TABLE pains           ENABLE ROW LEVEL SECURITY;   -- org "ICP" set (was org_icp)
ALTER TABLE buying_signals  ENABLE ROW LEVEL SECURITY;   -- org "ICP" set (was org_icp)

CREATE POLICY org_isolation ON posts
  USING (org_id = current_setting('app.current_org_id')::uuid)
  WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);
-- repeat per org-scoped table. USING gates reads; WITH CHECK gates writes (the bash exit 2 on write).
```

`global_library` tables are RLS-EXEMPT (read-only, no `org_id` column — see §3).

**INV-4 (Background jobs are not exempt — but neither are they session-bound).** Direct port of `file-operations.md` § "Isolation Scope Clarification": the KB hook guards *Claude's own tool calls*, NOT background scripts (`fix-bidirectional.mjs` once injected cross-client backlinks). Lesson for Choir: background workers (scheduled LinkedIn publish, nightly enrichment, embedding jobs) run WITHOUT a session and therefore WITHOUT `SET app.current_org_id`. They MUST set `app.current_org_id` from the *job's* `org_id` (carried on the job payload) before any query, OR run as a role with RLS still active and an explicit org filter. A worker that runs as a superuser/RLS-bypass role is the Choir equivalent of the `fix-bidirectional` cross-client injection bug. Forbidden.

### 1.4 Test obligations (port of the incident chain)

- Reject a request where `body.org_id` ≠ `session.org_id` (no trust of client input). → 403.
- Reject a read of a `posts.id` (draft row) belonging to another org even with a valid session. → 403, audit-logged.
- A background job carrying `org_id=A` cannot read/write `org_id=B` rows (set-org-before-query test).
- Integration credentials for org A are never selectable by a session bound to org B (MCP-binding port).

---

## 2. THE CONTEXT-COMPLETENESS GENERATION GATE (port of Check 2.6)

### 2.1 Source: the actual bash

`.claude/hooks/pre-tool-guard.sh:280-348` (Check 2.6: Voice DNA Gate). The load-completeness rule it enforces (`:312-325`):

```bash
# :313  if [ "$VOICE_OK" = "false" ]; then
# :315    VDR_FILE=".voice-dna-reads"
# :317      HAS_VOICE=false ; HAS_ANTISLOP=false
# :318      grep -q "core-voice.md"        $VDR_FILE && HAS_VOICE=true     # a VOICE source
# :319      grep -q "voice-style-guide.md" $VDR_FILE && HAS_VOICE=true     #   (owner OR client)
# :320      grep -q "anti-slop-universal.md" $VDR_FILE && HAS_ANTISLOP=true
# :321      if [ "$HAS_VOICE" = true ] && [ "$HAS_ANTISLOP" = true ]; then VOICE_OK=true; fi
# :327  if [ "$VOICE_OK" = "false" ]; then
# :329    echo "VOICE DNA GATE: Cannot write content without voice DNA loading." >&2
# :334    echo "  OR spawn content-pipeline-agent (which loads voice automatically)." >&2
# :334    exit 2          # <-- REFUSE TO GENERATE
#       fi
```

Hard rule it implements (`LOADING-PROTOCOL.md:24, :50-52`): for brand/site copy the protocol HARD-STOPS if **no project voice model exists** — "surface to the user; do NOT proceed on anti-slop + positioning alone." `LOADING-PROTOCOL.md:153`: "**Client voice NEVER mixes with owner voice.**"

### 2.2 Choir's completeness requirement (mapped to the 3-layer model)

The KB gate requires **a voice source + universal anti-slop** loaded before any content write. Choir's richer requirement (from the task): refuse to generate unless **(a) member voice profile + (b) ≥2 prose samples + (c) org brand DNA** are all present. Mapping:

| KB gate condition (`:318-320`) | Choir generation precondition | Data-model layer |
|---|---|---|
| a VOICE source (`core-voice.md` / `voice-style-guide.md`) | member voice profile row populated | `members` |
| (Adpharm samples rule, `LOADING-PROTOCOL.md:44-45`) | ≥2 prose samples for the member | `members` (`prose_samples`) |
| `anti-slop-universal.md` loaded (`:320`) | org brand DNA loaded (= the brand-level constraint floor) | `orgs` (`brand_dna`) |
| `content-pipeline-agent` spawned (`:308`) | pipeline path bypass (agent handles its own loading) | n/a — server enforces directly |

### 2.3 The Gate (implementable logic)

```
FUNCTION assert_generation_ready(member_id, org_id) -> GateResult:
    profile  = SELECT * FROM voice_profiles WHERE member_id AND org_id  // canonical table; completeness, not existence
    samples  = SELECT count(*) FROM prose_samples WHERE member_id AND org_id AND status='active'
    brand    = SELECT * FROM brand_dna      WHERE org_id                // canonical table (was org_brand_dna)

    missing = []
    IF profile IS NULL OR profile.completeness < REQUIRED:  missing += "voice_profile"
    IF samples < 2:                                          missing += "prose_samples (need 2, have " + samples + ")"
    IF brand IS NULL OR brand.status != 'approved':          missing += "brand_dna"

    IF missing is non-empty:
        // == bash exit 2, but with a constructive surface instead of a raw error
        RETURN GateResult(
            allow = false,
            code  = "GENERATION_GATE_INCOMPLETE",
            user_action = "Complete your voice interview",   // the product-facing port of the bash error text
            cta_route   = "/voice-interview",
            missing     = missing
        )
    RETURN GateResult(allow = true)
```

### 2.4 Rules ported verbatim

- **GATE-1 (Refuse, don't degrade).** `LOADING-PROTOCOL.md:24` / `:50-52` — NO description-only fallback for brand copy; HARD STOP. Choir: never generate from anti-slop + brand DNA alone when the member voice/samples are missing. The product shows "complete your voice interview," not a low-fidelity draft.
- **GATE-2 (Voice never mixes — the isolation cross-check).** `LOADING-PROTOCOL.md:153, :156`. The generation context for member M may load ONLY: M's voice profile + M's prose samples (Layer 2/3) + M's org brand DNA (org layer) + global anti-slop (global_library). Loading another member's voice into M's generation context is a §5 isolation violation (see Unsolved Gap) and is forbidden even within the same org.
- **GATE-3 (Voice DNA is read-only during generation).** `LOADING-PROTOCOL.md:156`: "Skills read from these files but never write to them." Choir: the generation path has read-only access to voice profiles/prose samples; updates flow only through the explicit voice-interview / learning-promotion write path, never as a side-effect of generation.
- **GATE-4 (Server-enforced, pre-generation).** Like Check 2.6 firing PRE-Write, `assert_generation_ready` runs server-side before the LLM call is dispatched — not in the client, not as a post-hoc validation.

### 2.5 Test obligations

- Member with profile + 1 sample + approved brand DNA → gate returns `incomplete` (`prose_samples`), surfaces voice-interview CTA. (boundary: exactly 2 required)
- Member with profile + 2 samples + brand DNA `status='draft'` → `incomplete` (`brand_dna`).
- Fully-loaded member → `allow=true`, generation proceeds.
- A generation request never loads a sibling member's prose samples (GATE-2 cross-check).

---

## 3. ORG → MEMBER LAYERING (global_library above org above member)

### 3.1 Source

`client-workspace-standards.md:40-55` (workspace structure = the org tenant), `:153, :169` (shared messaging/voice lives at the org level), `LOADING-PROTOCOL.md:415-426` synthesis 4-Layer Voice Architecture (`context-os-architecture-synthesis.md:421-426`): Layer 1 Global → Layer 2 per-source voice → Layer 3 per-source samples. The KB's "owner vs client" maps to "global vs org"; the KB has no intra-org member layer (that is the §5 net-new).

### 3.2 The three layers (authoritative load order)

```
LAYER 0  global_library   (app-wide, read-only SEED)   -- highest, shared by ALL orgs
   ↓ overridden/extended by
LAYER 1  orgs             (shared brand DNA, ICP, personas)  -- org_id PK
   ↓ overridden/extended by
LAYER 2  members          (per-member voice, prose_samples, beliefs)  -- member_id PK, org_id FK
```

Load/merge order at generation time (port of `LOADING-PROTOCOL.md` Resolution Order §Step 1 → Step 2):

| Order | Layer | What loads | KB analog |
|---|---|---|---|
| 1 | `global_library` | universal anti-slop kill-list, hooks DB, frameworks DB, dimension enums | `_shared/anti-slop-universal.md` (Layer 1 Global, `synthesis:423`) |
| 2 | `orgs` | brand_dna (tone, do/don't), personas + pains + buying_signals (the "ICP" set) | client `messaging/voice-style-guide.md` + `positioning/` + `PERSONAS.md` (`workspace-standards:48, :82-102`) |
| 3 | `members` | voice_profiles, prose_samples (≥2), beliefs/expert_pov | owner `_owner/core-voice.md` + `_owner/prose-samples.md` (Layer 2/3, `synthesis:424-425`) |

### 3.3 Layer rules (implementable)

- **LAYER-1 (global_library is read-only seed, RLS-exempt, no org_id).** Every org reads the same global_library. No org can write it. Seeded by app migration. (Port: `anti-slop-universal.md` is one shared file all content paths read — `Check 2.6:320`.)
- **LAYER-2 (org = the tenant boundary).** `org_id` is the unit of isolation (§1). Shared brand DNA, ICP, personas are visible to all members of the org (read), writable only by org admins (§4). (Port: client folder = one tenant; `messaging/` + `positioning/` are org-shared source files.)
- **LAYER-3 (member context is isolated-by-default WITHIN the org).** A member's voice + samples + beliefs are the per-member layer. **KB has no enforcement for member-vs-member read isolation inside one tenant — see §5.** Choir MUST add it: a member's prose samples/voice profile are private to that member by default (`members.org_id` FK scopes the tenant; an additional `member_id` predicate scopes the person).
- **LAYER-4 (override semantics — extend, don't collide).** Lower layers extend/specialize higher ones; they never silently overwrite. Org brand DNA constrains; member voice personalizes within the constraint. Global anti-slop is non-overridable (a member cannot opt out of the kill-list). Port of `synthesis:435`: "Loading personality voice DNA for a B2B website turns conversion copy into LinkedIn rhythm" — wrong layer for the job; the merge must respect layer intent.

### 3.4 Nested tenancy (org-within-org) — port of MartyHR-under-TalentLyft

Source: `file-operations.md:99` (cross-client wikilink boundary, "to `agency-shared`, or to `core-kb`. Never to another concrete client") and `file-operations.md:208-212` (Nested Sub-Client: hook extracts client from the FIRST folder after `clients/`; `clients/GTM-Strategist-Maja-Voje/clients/Praxium/` resolves to the OUTER folder). MartyHR ↔ TalentLyft is the documented legitimate cross-tenant bypass ("MartyHR was built by the TalentLyft team", `file-operations.md:99`).

Choir port:

- **NEST-1 (Outermost org owns the isolation boundary).** When org B is nested under org A (agency A manages sub-brand B), the *outer* org_id (A) is the credential/MCP binding boundary. App: `orgs.parent_org_id` (nullable FK). Session binds to the *resolved* tenant root, mirroring "first folder after clients/."
- **NEST-2 (Cross-tenant references are deny-by-default + explicit allowlist).** Default: a wikilink/reference from org B may resolve only inside B, to `agency-shared` (a shared-but-not-global scope), or to `core-kb` (= global_library). Never to a sibling concrete org. Exception requires an explicit, logged allowlist entry — port of `CROSS_CLIENT_WIKILINK_BYPASS=1` (`file-operations.md:99`). App: `org_cross_links (from_org_id, to_org_id, reason, approved_by, created_at)`; absence of a row = 403.
- **NEST-3 (agency-shared scope).** Between global_library (all orgs) and a single org sits an optional `agency-shared` scope readable by all child orgs of one parent. Map: `org_id IN (SELECT org_id FROM orgs WHERE parent_org_id = :root) OR scope = 'agency_shared_of(:root)'`.

---

## 4. APPROVAL-WORKFLOW RBAC

### 4.1 Source: the authority fields

`client-workspace-standards.md:114-117` (CONTACTS.md "Decision authority (final say / needs approval / advisory)") and `:127` ("Stjepan decides fast on strategy but needs board approval for budget >EUR 5K"). The three KB authority values map directly to Choir approval roles.

### 4.2 Roles (RBAC)

| Role | KB authority field | Capabilities |
|---|---|---|
| `admin` | **final say** | set/edit `brand_dna`, `personas` + `pains` + `buying_signals` (the "ICP" set); manage members; configure integrations; approve+publish posts; everything `approver` + `member` can do |
| `approver` | **needs approval** (= the approver others route through) | review pending posts → approve / reject / request-changes; publish approved posts; draft own content; cannot edit `brand_dna` |
| `member` | **advisory** | draft content (own); edit own posts in status `draft`/`changes_requested`; submit for approval; cannot approve, cannot publish, cannot edit `brand_dna` |

(Enum: `app_role ∈ {admin, approver, member}`, stored on the canonical **`members.app_role`** column (NOT `members.role` — `role` is the free-text job title in db-schema). The `final-say / needs-approval / advisory` human-readable mirror lives in **`members.authority`** per `workspace-standards:114`. All draft rows are `posts` rows with the matching `status` — there is no separate `drafts` table; "draft" = `posts.status='draft'`.)

### 4.3 Draft lifecycle state machine

State enum: `posts.status ∈ {draft, pending, approved, scheduled, published, rejected, changes_requested, archived}` — this IS the canonical `posts.status` CHECK in db-schema.sql (R-G5/decision 8 added `changes_requested` + `archived`; `scheduled` is the publish-queue state). The dimension-enums.json `post_status` vocabulary is kept in sync. (Formerly referred to as `draft_status`; there is no separate `drafts` table.)

```
draft ──submit_for_approval──▶ pending
pending ──approve──▶ approved
pending ──request_changes──▶ changes_requested
pending ──reject──▶ rejected
changes_requested ──(member edits)──▶ draft ──submit_for_approval──▶ pending
approved ──publish──▶ published
approved ──unapprove (admin)──▶ draft
published ──archive──▶ archived
(any) ──archive (admin)──▶ archived
```

Core path (task-specified): `draft → pending → approved → published`.

### 4.4 Transition authority matrix (implementable)

| Transition | `member` | `approver` | `admin` | Pre-condition |
|---|---|---|---|---|
| create `draft` | ✅ (own) | ✅ (own) | ✅ | generation gate passed (§2) |
| `draft → pending` (submit) | ✅ own draft | ✅ own | ✅ | draft non-empty |
| `pending → approved` | ❌ | ✅ | ✅ | reviewer ≠ author? (see APV-2) |
| `pending → changes_requested` | ❌ | ✅ | ✅ | comment required |
| `pending → rejected` | ❌ | ✅ | ✅ | reason required |
| `changes_requested → draft` | ✅ author | ✅ | ✅ | — |
| `approved → published` | ❌ | ✅ | ✅ | integration creds present for org (§1 MCP-binding port) |
| `approved → draft` (unapprove) | ❌ | ❌ | ✅ | — |
| edit `brand_dna / personas / pains / buying_signals` | ❌ | ❌ | ✅ | (port: shared brand DNA is admin-owned) |
| set member `app_role` | ❌ | ❌ | ✅ | — |
| any `→ archived` | author (own draft) | ✅ | ✅ | — |

### 4.5 RBAC rules

- **APV-1 (Admin sets brand DNA, members draft, approver greenlights).** Direct port of task + `workspace-standards:48,:153` (shared messaging = org-level, admin-owned) and the three authority fields (`:114`). Org-shared layer (§3 Layer 2) is admin-write; member layer (§3 Layer 3) is member-write-own.
- **APV-2 (Author-cannot-self-approve — default ON, configurable).** A `pending → approved` transition by the post's author (`posts.author_member_id`) is rejected unless `org_settings.allow_self_approve = true`. (Admin is exempt — "final say." Solo orgs flip the flag.)
- **APV-3 (Every transition is org-scoped AND audit-logged).** `posts.org_id = session.org_id` enforced at the query layer (§1 INV-3) before any transition. Append `post_audit (post_id, from_status, to_status, actor_member_id, comment, at)` — a net-new audit table keyed to `posts.id` (NOT a `draft_audit`/`drafts` table).
- **APV-4 (Publish requires org integration creds).** `approved → published` checks org-bound publish credentials exist (port of MCP-client binding `pre-tool-guard.sh:195-210` — wrong/absent creds block the action).

### 4.6 Test obligations

- `member` attempting `pending → approved` → 403.
- author (non-admin) self-approve with `allow_self_approve=false` → 403.
- `approver` editing `brand_dna` → 403 (admin-only).
- publish with no org publish creds → blocked with actionable error.
- transition on a `posts` row (draft) from another org → 403 (isolation precedes RBAC).

---

## 5. THE UNSOLVED GAP (NET-NEW — deepest moat AND riskiest assumption)

> **Explicitly flagged as net-new design work.** The KB does NOT solve this. Sources: `context-os-architecture-synthesis.md:785` (the Schoenfeld single→multi-player gap) and `:816` (the open gap in "Gaps Identified"). `LOADING-PROTOCOL.md` only ever isolates owner-vs-client (two whole tenants). `client-workspace-standards.md:369` forbids mixing *clients*, never addresses mixing *members of one client*.

### 5.1 GAP-A — Per-member voice isolation WITHIN one tenant

**What the KB has:** isolation at the whole-tenant grain only. `LOADING-PROTOCOL.md:153`: "Client voice NEVER mixes with owner voice" — but that is two tenants. There is **no** primitive for "member Anže's voice never mixes with member Lovro's voice inside org TalentLyft."

**Why it is the moat:** Choir's entire value is N members each with a *distinct, faithful* voice under one shared brand. If member voices bleed, Choir is just one more brand-voice tool. Per-member fidelity at team scale is the differentiator no KB-derived peer has (`synthesis:785`: every documented peer is "a **single-player** implementation").

**Why it is the riskiest assumption:** the KB has zero validated pattern here (`synthesis:816` lists it UNCHECKED). We are inventing, not porting.

**Net-new design requirements (to be designed, not ported):**
- Member layer (§3 Layer 3) needs a *member-vs-member* read boundary inside the org, ABOVE the org-vs-org boundary that §1 already provides. RLS predicate becomes `org_id = :session_org_id AND (member_id = :session_member_id OR voice_visibility = 'org_shared')`.
- A generation request for member M loads ONLY M's voice+samples (GATE-2). Need a guarantee the retrieval/embedding layer cannot surface another member's prose samples into M's context window (vector-store namespace per `member_id`, not per `org_id`).
- Decide default visibility: member voice private-by-default vs org-shared-by-default. (Recommend private-by-default — the safe failure mode; explicit opt-in to share.)
- Resolve: can an `admin` read a member's prose samples? (Tenancy says org-admin sees all org data; voice-privacy says no. UNRESOLVED — flag to product.)

### 5.2 GAP-B — Single→multi-player conflict resolution

**What the KB has:** nothing operational. `synthesis:785` poses the exact open questions verbatim: "context ownership when 5+ marketers share the thread; whether client isolation (Rule 2) is sufficient as a model for intra-team isolation or whether team use needs a different boundary; how a new marketer onboards into a Context OS built around the CMO's taste without collapsing it into a generic assistant; divergence vs convergence of accumulated state across multiple daily users; and **whose corrections win when the CMO and an IC disagree on a routing rule**." Flagged "OPEN — no validated pattern yet."

**Net-new design questions Choir MUST answer (do NOT invent answers here — flag to product/design):**
1. **Whose corrections win.** When admin and member give conflicting voice/brand corrections: does `brand_dna` (admin) always override member voice, or does member voice win in the member layer? (Layer precedence §3.4 says lower extends higher within its scope — but a *conflict* on the same attribute has no rule yet.)
2. **2nd-teammate onboarding.** How does member #2 join an org whose brand DNA was shaped entirely by member #1 / admin, without (a) inheriting member #1's voice or (b) collapsing into a generic assistant. (`synthesis:785` "without collapsing it into a generic assistant.") Net-new: a per-member voice-interview that forks from org brand DNA but is independently owned.
3. **Divergence vs convergence of accumulated state.** Each member's voice profile drifts as they correct generations. Do members' learned corrections stay member-local (divergence, fidelity) or roll up to org brand DNA (convergence, consistency)? Tension is unresolved (`synthesis:785`).
4. **Context ownership at 5+ members.** Who owns/edits shared brand DNA when 5 marketers + 1 admin all use it daily.

**Status:** GAP-A and GAP-B are the two largest open design risks. They are NOT covered by any ported mechanism above. Treat Sections 1–4 as a solid floor (whole-org isolation + RBAC + generation gate are fully portable from real, running hook code); treat Section 5 as greenfield that determines whether Choir is a moat or a commodity.

---

## Appendix: Citation Index

| Block | Source path:line |
|---|---|
| Isolation invariant (Check 1 bash) | `.claude/hooks/pre-tool-guard.sh:173-217` |
| MCP-client binding | `.claude/hooks/pre-tool-guard.sh:195-210` |
| Isolation guards Claude not background scripts | `.claude/rules/file-operations.md` § Isolation Scope Clarification |
| Generation/voice gate (Check 2.6 bash) | `.claude/hooks/pre-tool-guard.sh:280-348` (load-completeness `:312-325`) |
| Hard-stop no-fallback rule | `.claude/voice-dna/LOADING-PROTOCOL.md:24, :50-52` |
| Voice never mixes / read-only | `.claude/voice-dna/LOADING-PROTOCOL.md:153, :156` |
| 4-layer voice / global→org→member | `_synthesis/context-os-architecture-synthesis.md:415-453` (esp. :421-426, :435) |
| Org tenant structure + shared messaging | `09-agency/client-workspace-standards.md:40-55, :153, :169` |
| Decision authority (final say/needs approval/advisory) | `09-agency/client-workspace-standards.md:114-117, :127` |
| Nested sub-client (first folder rule) | `.claude/rules/file-operations.md:208-212` |
| Cross-tenant bypass (MartyHR↔TalentLyft) | `.claude/rules/file-operations.md:99` |
| Single→multi-player OPEN gap | `_synthesis/context-os-architecture-synthesis.md:785, :816` |
| Team adoption economics | `_synthesis/context-os-architecture-synthesis.md:778-783` |

*Generated for Choir backend build. Sections 1-4 = ported from running enforcement code. Section 5 = explicitly net-new (KB-flagged unsolved).*

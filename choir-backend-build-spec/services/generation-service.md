# Generation Service — Engineer Interface Doc (Choir)

> **What this is.** The code spine that turns layered context (anti-slop floor → org brand DNA → member voice → prose samples → task) into a structured draft `{hook, body, cta, reasoning}`. It is a near-verbatim clone of the **already-built, live-validated** outbound draft generator at `scripts/outbound/lib/claude-draft.mjs`, with the prompt template swapped and the `ctx` shape reshaped for content (LinkedIn-first) instead of cold email.
>
> **Build posture.** This is NOT greenfield. The generation function, the 12KB voice-DNA cap, the robust JSON extractor, the model-call wrapper, the telemetry/rate-limit defense, and the model-routing override mechanism all exist in the repo today. Engineers clone + reshape, they do not invent. Every section below cites `path:line` so you can read the real implementation.
>
> **Layer tagging (Choir 3-layer data model):**
> - `global_library` — app-wide read-only seed (anti-slop floor file, kill-list, sanitizer parse target). One copy, shared by all orgs.
> - `orgs` — shared brand DNA, ICP, personas, positioning, TRUE-facts. One per org.
> - `members` — per-member voice model + prose samples + beliefs (`org_id` FK). One per person.

---

## 0. Reference implementation map

| Choir concern | Reference file | Lines |
|---|---|---|
| Generation function (`generateDraft`) | `scripts/outbound/lib/claude-draft.mjs` | 88-148 |
| `interpolate()` placeholder fill | `scripts/outbound/lib/claude-draft.mjs` | 36-48 |
| `loadVoiceDna()` 12KB cap | `scripts/outbound/lib/claude-draft.mjs` | 54-75 |
| Robust JSON extractor | `scripts/outbound/lib/claude-draft.mjs` | 124-147 |
| Model call wrapper (`runClaudeBatchCaptured`) | `scripts/lib/claude-cli.mjs` | 471-473 |
| Per-call model override (`runClaudeCapturedFlags`) | `scripts/lib/claude-cli.mjs` | 485-489 |
| Model validation (`buildExtraFlags`) | `scripts/lib/claude-cli.mjs` | 96-114 |
| Shared CLI flags / fallback-model | `scripts/lib/claude-cli.mjs` | 72-75 |
| Telemetry + threshold + RateLimitError | `scripts/lib/claude-cli.mjs` | 116-253, 322-331, 491-577 |
| Verbatim-anchoring rule (the slop fix) | `my-context-os/02-outbound-systems/autonomous-outbound-pattern.md` | 142-153, 178-183 |
| Real prompt template (output schema + ban-list shape) | `scripts/outbound/prompts/draft-competitor-ats.md` | 1-74 |
| Prompt-caching mechanics + model pricing | `my-context-os/06-ai-tooling/claude-api-prompt-caching.md` | 57-300 |
| Model routing benchmarks (Haiku+advisor) | `my-context-os/06-ai-tooling/advisor-tool-pattern.md` | 37-66 |
| Clone guidance for Choir | `brainstorms/content-os-app/feature-map.json` | 83-84, 319, 329-330 |

---

## 1. Function-by-function interface

The reference module exports one function (`generateDraft`) and re-exports `RateLimitError`. Three internal helpers do the real work. Engineers should reproduce all four with the signatures below.

### 1.1 `interpolate(template, ctx) -> string`

**Source:** `scripts/outbound/lib/claude-draft.mjs:36-48`

Fills `{{key}}` and `{{a.b.c}}` dot-path placeholders in a markdown template from a context object. **Missing keys are made VISIBLE, not silently dropped** — they render as `[MISSING:key]` so a broken prompt is obvious in the temp file and the output, not a silent quality regression.

Behavior that the clone MUST preserve:
- Regex `/\{\{(\w[\w.-]*)\}\}/g` — supports dotted paths and hyphens in keys.
- Walks `ctx` by path segment; `null`/`undefined` at any segment → `[MISSING:key]`.
- Objects are `JSON.stringify`'d (so `{{signal.raw}}` injects a JSON blob); everything else `String()`-coerced.

```js
function interpolate(template, ctx) {
  return template.replace(/\{\{(\w[\w.-]*)\}\}/g, (_match, key) => {
    const path = key.split(".");
    let v = ctx;
    for (const seg of path) {
      if (v == null) return `[MISSING:${key}]`;
      v = v[seg];
    }
    if (v === undefined || v === null) return `[MISSING:${key}]`;
    if (typeof v === "object") return JSON.stringify(v);
    return String(v);
  });
}
```

### 1.2 `loadVoiceDna(voiceDnaPaths) -> string`

**Source:** `scripts/outbound/lib/claude-draft.mjs:54-75`

Reads each voice-DNA file path, **caps each file at 12,000 chars**, concatenates with `\n\n---\n\n` separators, and labels each section `## Voice DNA — <relPath>`. Missing files become `<!-- MISSING: path -->` comments (visible, non-fatal); read errors become `<!-- ERROR reading path: msg -->`.

The 12KB cap is load-bearing — it is the prompt-size governor that keeps the cacheable per-member prefix bounded (see §4). The cap is per-file, not aggregate.

```js
const capped =
  content.length > 12000
    ? content.slice(0, 12000) + "\n[...truncated]"
    : content;
sections.push(`## Voice DNA — ${relPath}\n\n${capped}`);
```

**Choir reshape:** in the outbound version `voiceDnaPaths` is an array of repo-relative file paths. In Choir, member voice + prose samples live in the DB (`members` layer), not on disk. The clone replaces filesystem reads with a DB fetch but keeps the **same per-source 12KB cap and the same labeled-section concatenation contract** so the prompt-assembly order (§3) and the cache prefix (§4) stay stable.

### 1.3 `generateDraft(opts) -> Promise<{ raw, json, parseError? }>`

**Source:** `scripts/outbound/lib/claude-draft.mjs:88-148`

The single public entry point. Signature (verbatim from the JSDoc at `:80-94`):

```
generateDraft({
  templatePath,      // string  — path to .md prompt template
  ctx,               // object  — all {{placeholder}} values
  voiceDnaPaths,     // string[]? — voice DNA files to inline (capped 12KB each)
  callerScript,      // string  — telemetry caller tag
  timeout = 240000,  // number  — per-call timeout in ms
}) -> Promise<{ raw: string, json: object|null, parseError?: string }>
```

Control flow (exact, `:95-147`):
1. Throw if `templatePath` missing (`:95-97`).
2. `ensureTempDir()` — create `workspace/.outbound-tmp` if absent (`:99`, `:28-30`).
3. Read template; `loadVoiceDna(voiceDnaPaths)` (`:101-102`).
4. **Build `fullCtx = { ...ctx, VOICE_DNA: voiceDna }`** — voice DNA is injected as the reserved `{{VOICE_DNA}}` placeholder, NOT a normal ctx key (`:104`). This is how the assembled voice block lands inside the template (see the template's `{{VOICE_DNA}}` slot at `draft-competitor-ats.md:70`).
5. `interpolate(template, fullCtx)` → final prompt string (`:105`).
6. Write prompt to a unique temp file `draft-<ts>-<rand>.tmp` (`:107-111`).
7. Call `runClaudeBatchCaptured(tempPath, callerScript, { timeout })` inside try/finally; **always `unlinkSync` the temp file** (`:113-122`).
8. Robust JSON extraction (see §1.4).
9. Return `{ raw, json, parseError }`.

**Key contract for callers:** the function never throws on bad JSON — it returns `json: null` + a `parseError` string. The caller decides whether to retry/regenerate. It DOES throw on a missing template (programmer error) and propagates `RateLimitError` from the wrapper (credit exhaustion — see §1.5).

### 1.4 Robust JSON extractor (inline in `generateDraft`)

**Source:** `scripts/outbound/lib/claude-draft.mjs:124-147`

Models wrap JSON in ```` ```json ```` fences or add preamble. The extractor is a two-tier fallback. The clone MUST reproduce both tiers — this is what makes the structured-output contract reliable:

```js
let json = null;
let parseError;
try {
  // Tier 1: prefer fenced ```json ... ``` (or bare ``` ... ```), else whole trimmed body
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : raw.trim();
  json = JSON.parse(candidate);
} catch (err) {
  // Tier 2: first '{' to last '}' balanced-ish slice
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      json = JSON.parse(raw.slice(start, end + 1));
    } catch (err2) {
      parseError = `JSON parse failed: ${err.message}; fallback: ${err2.message}`;
    }
  } else {
    parseError = `No JSON in response: ${err.message}`;
  }
}
```

### 1.5 The model call: `runClaudeBatchCaptured` (wrapper)

**Source:** `scripts/lib/claude-cli.mjs:471-577`

`generateDraft` does not call the model directly — it delegates to `runClaudeBatchCaptured(stdinPath, callerScript, execOpts)`, which is a thin wrapper over `_runCaptured` (`:491-577`). What the wrapper gives you for free (do NOT reimplement these in Choir — reuse the wrapper):

- **Invocation:** `claude -p --strict-mcp-config --mcp-config "workspace/empty-mcp-config.json" --no-session-persistence --fallback-model sonnet --output-format json < tempfile` (`:74-75`, `:84-88`). The empty MCP config + `--strict-mcp-config` prevents background-process hangs; `--fallback-model sonnet` is free insurance against Opus capacity overload (`:72-73`).
- **Envelope parse:** reads the `type:"result"` JSON envelope; pulls `result` text, `usage` (input/output/cache_read/cache_creation tokens), `total_cost_usd`, and the actual model used (`:511-516`, `:335-364`).
- **Telemetry:** appends a per-call record to `_evidence/claude-cli-telemetry.jsonl` (`:118-126`, `:525-545`).
- **Threshold alerts:** fires Windows-toast at 50/75/90% of the credit ceiling (`:222-253`, `THRESHOLDS = [50,75,90]` at `:56`).
- **Rate-limit / credit-exhaustion:** matches 9 patterns (`:257-267`), throws `RateLimitError` (`:322-331`, `:548-565`) so the caller can pause the queue rather than spamming failed calls.

> **Choir note — direct API vs `claude -p`.** The reference wrapper shells out to the `claude -p` CLI (Agent SDK credit pool, no API key). For a production multi-tenant web app, Choir should target the **direct Claude API** (Anthropic SDK) so it can use prompt caching (§4) and per-request model selection cleanly. The wrapper's *responsibilities* (telemetry, threshold alerts, rate-limit handling, structured-envelope parse) port 1:1 to an SDK-based wrapper; the *transport* (execSync of a CLI) is what changes. Keep the same return shape `{ resultText, envelope, record }` (`:485-489`, `:576`).

### 1.6 Per-call model override: `runClaudeCapturedFlags`

**Source:** `scripts/lib/claude-cli.mjs:485-489`, validation at `:96-114`

This is the mechanism that makes the model-routing table (§5) implementable. It accepts a validated `{ model, disallowedTools }` and returns `{ resultText, envelope, record }`. Model values are **allowlist-validated** against `/^[A-Za-z0-9.\-\[\]]+$/` (`:99`) and tool names against `/^[A-Za-z]+$/` (`:105`) — NO free-form flag splicing (injection surface stays closed, `:90-95`). `--output-format json` is never overridable (`:93-95`) because telemetry + the credit guard depend on the structured envelope.

```js
runClaudeCapturedFlags(stdinPath, caller, {
  model: "haiku",            // validated; routes bulk/variant calls cheap
  disallowedTools: ["Edit","Write","Bash"],  // validated
}) -> { resultText, envelope, record }
```

---

## 2. The `ctx` shape (Choir)

**Source for shape:** `brainstorms/content-os-app/feature-map.json:329` ("swap prompt template + ctx shape"); ctx fields per task spec.

The outbound ctx is `{ lead, company, signal }`. Choir's content ctx is:

```jsonc
{
  "company_context": {          // orgs layer — shared across the team
    "name": "string",
    "icp": "string",            // who they sell to
    "personas": ["string"],     // buyer personas
    "pains": ["string"],        // top pains the ICP feels
    "positioning": "string",    // category / wedge
    "true_facts": ["string"],   // capability boundary — see §3 L4 / ban fabrication
    "brand_voice_rules": "string" // org-level brand DNA (tone, register)
  },
  "individual_context": {       // members layer — one per person (org_id FK)
    "voice_dna": "string",      // HOW they sound (injected via {{VOICE_DNA}})
    "prose_samples": ["string"],// 3-5 real 200-600w posts (REQUIRED, not optional)
    "beliefs": ["string"],      // WHAT they believe (Expert POV / hot takes)
    "name": "string",
    "role": "string"
  },
  "topic": "string",            // what this post is about
  "format": "string"            // linkedin-post | carousel | thread | substack-essay ...
}
```

**Return shape (Choir):**

```jsonc
{
  "hook":      "string",   // the first line / scroll-stopper
  "body":      "string",   // post body, \n\n paragraph breaks
  "cta":       "string",   // the ask (save/comment/follow/DM)
  "reasoning": "string"    // 2-4 sentences: why this angle for this topic+belief+format
}
```

This maps onto the reference output schema (`draft-competitor-ats.md:5-15`), which already returns `{subject, body, ..., reasoning}` — the `reasoning` field is a proven part of the contract and should be kept (it makes drafts reviewable in the approval queue).

---

## 3. Prompt-assembly order (the layered context stack)

The prompt is assembled in a **strict stable→volatile order** so the stable prefix is cacheable (§4). This order is the on-the-wire materialization of Choir's 4-layer voice architecture. Mechanically it is produced by the template (which fixes L1/L4 structure) + `loadVoiceDna`/ctx injection (which fills L2-org, L2-member, L3).

| Order | Layer | Content | Choir data layer | Volatility | Source |
|---|---|---|---|---|---|
| 1 | **L1 — anti-slop floor** | Kill-list + banned phrases + register rules. App-wide, identical for everyone. | `global_library` | Stable (changes ~never) | Template body, e.g. `draft-competitor-ats.md:46-57` |
| 2 | **L2-org — brand DNA** | ICP, personas, pains, positioning, brand voice rules, TRUE-facts. | `orgs` | Semi-stable (per org, changes rarely) | `ctx.company_context` |
| 3 | **L2-member — voice DNA** | HOW this person sounds (tone, vocabulary, sentence patterns). | `members` | Semi-stable (per member) | `ctx.individual_context.voice_dna` → `{{VOICE_DNA}}` (`claude-draft.mjs:104`) |
| 4 | **L3 — prose samples** | 3-5 real 200-600 word posts by this person (few-shot anchors). | `members` | Semi-stable (per member) | `ctx.individual_context.prose_samples` |
| 5 | **L4 — task** | hook/framework/template + topic + belief + format + output schema. | request-time | **Volatile** (every call) | `ctx.topic`, `ctx.format`, belief, schema |

**Why this exact order is non-negotiable:** the cacheable prefix is everything that does NOT change between two generations for the same member (orders 1-4). The volatile task (order 5) goes LAST so the cache breakpoint can sit right before it. Putting any per-call value (topic, format) earlier would invalidate the whole cached prefix on every request (see cache-invalidation cascade, `claude-api-prompt-caching.md:206-219`).

**Assembly mechanism (clone of `claude-draft.mjs:101-105`):**
1. Template file holds the L1 floor + L4 schema/structure as fixed text with `{{...}}` slots.
2. `loadVoiceDna([...])` (or the DB equivalent) builds the L2-member + L3 block, capped 12KB/source.
3. `fullCtx = { ...ctx, VOICE_DNA: voiceBlock }`.
4. `interpolate(template, fullCtx)` fills L2-org from `ctx.company_context.*`, drops the voice block at `{{VOICE_DNA}}`, and fills L4 from `ctx.topic`/`ctx.format`/belief.

For prompt-caching, the cleaner production form is to send orders 1-4 as a single cached `system` block and order 5 as the uncached `messages` user turn (see §4).

---

## 4. Verbatim-anchoring rule (the slop fix — DO THIS, it is live-validated)

**Source:** `my-context-os/02-outbound-systems/autonomous-outbound-pattern.md:142-153` + the live-validation note `:178-183`; concrete shape in `scripts/outbound/prompts/draft-competitor-ats.md`.

> **The fix, verbatim from the live validation (`:182`):** *"Draft voice anchors on client templates. Abstract voice DNA produced consultancy-register slop. Inlining approved templates verbatim into prompts fixed it across all 5 signal types."*

This is the single most important generation-quality rule and it is **empirically proven, not theoretical** — it was the fix that resolved consultancy-slop across all 5 signal types in the TalentLyft live run (25 signals → 13-14 verified drafts, `:174`).

**The rule:** generate against **proven concrete examples + a fixed TRUE-facts list + a ban-list + an output schema** — NOT against abstract voice descriptions. Every per-task prompt file MUST contain four things (`autonomous-outbound-pattern.md:146-151`):

1. **3-5 verbatim approved examples** copied from the source of truth (`:148`). In outbound these are approved cold-email templates; **in Choir these are the member's 3-5 real prose samples** (`ctx.individual_context.prose_samples`) PLUS, per format, the seeded few-shot post templates (feature-map `:83` — "Seed the 5 full post templates A-E + 86-post CSV as few-shot").
2. **A fixed TRUE-facts list** = the product/capability boundary (`:149`). In Choir: `ctx.company_context.true_facts`. Generation may only assert facts on this list.
3. **An explicit ban** on product-explainer prose + "built for you" fabrications (`:150`), implemented as the anti-slop kill-list. The reference ban-list (`draft-competitor-ats.md:46-57`) is the template — Choir loads the **same** `anti-slop-universal.md` kill-list both as a generation constraint AND as the file the deterministic gate parses, so editing it once keeps both in sync (feature-map `:330`).
4. **An output schema** — one JSON object, exact shape, "no preamble, no explanation outside the JSON" (`:151`; reference at `draft-competitor-ats.md:3-15, 74`).

**Anti-fabrication enforcement (from the real template):**
- TRUE-facts list bounds claims; "promises that aren't specific" are banned (`draft-competitor-ats.md:57`).
- The kill-list bans the consultancy register that abstract voice DNA produced: `Unlock, Discover, Boost, Streamline, Empower, Leverage(verb), Elevate, Transform, Revolutionize, game-changer, best-in-class, world-class, cutting-edge, next-generation` (`:47, :54`).
- "If ANY of these appear in your draft, regenerate" (`:46`) — the prompt instructs self-regeneration, and the deterministic sanitizer (`sanitize-copy.mjs`, separate gate) is the hard floor underneath.

**Choir implementation summary:** per-format prompt file = inline the member's real prose samples (few-shot) + org TRUE-facts + the universal kill-list + the `{hook,body,cta,reasoning}` schema. Do NOT pass a paragraph describing "the founder sounds confident and direct" — pass what they actually wrote.

---

## 5. Prompt-caching strategy

**Source:** `my-context-os/06-ai-tooling/claude-api-prompt-caching.md` (full).

**The win:** cache reads cost **0.1× base input (90% discount)** and **do NOT count against rate limits** (`:59`, `:140`, `:175`). For Choir, where the same member's L1-L4 prefix is reused across every generation in a session/day, this is a ~10× cost reduction on the prefix plus effective throughput headroom (feature-map `:319, :330`).

### 5.1 What to cache

Cache the **stable per-member prefix** = prompt-assembly orders 1-4 (L1 anti-slop + L2-org brand DNA + L2-member voice + L3 prose samples). The volatile L4 task (topic/format/schema) stays uncached.

### 5.2 Order stable → volatile (already enforced by §3)

Caching only works if stable content precedes volatile content, because any change invalidates that level **and all subsequent levels** (`:206-219`). The hierarchy is `tools → system → messages` (`:91`). Put L1-L4 in the `system` block, L4-task in the `messages` user turn.

### 5.3 Automatic vs explicit (4 breakpoints)

- **Automatic** (`:73-87`): single top-level `cache_control: {type:"ephemeral"}`; system auto-places one breakpoint on the last cacheable block and advances it. Best for the simple case — one stable system prefix per member.
- **Explicit** (`:89-105`): place `cache_control` on up to **4** individual content blocks (`:91`). Use this when the four sub-layers change at different frequencies: e.g. breakpoint after L1 (app-global, never changes), after L2-org (per-org), after L2-member voice, after L3 prose samples. That way an org-level brand edit only invalidates from L2-org forward, not the L1 floor.

**Recommended Choir start:** automatic caching on the assembled per-member system prefix (feature-map `:319` — "Cache the per-user context block (ICP + voice + hook library) via automatic prompt caching"). Graduate to explicit 4-breakpoint only if org-level vs member-level edit frequencies diverge enough to matter.

### 5.4 Caching constraints engineers must respect

| Constraint | Value | Source |
|---|---|---|
| Cache read discount | 0.1× base input (90% off) | `:59, :140` |
| Cache write premium (5 min TTL) | 1.25× base input | `:138` |
| Cache write premium (1 hr TTL) | 2× base input | `:139, :154-156` |
| Default TTL | 5 min, free-refreshed on each hit | `:149-152` |
| Rate-limit exemption | cache hits don't count | `:175` |
| Min cacheable tokens — Opus | 4,096 | `:186` |
| Min cacheable tokens — Sonnet 4.6 | 2,048 | `:187` |
| Min cacheable tokens — Haiku 4.5 | 4,096 | `:189` |
| Max explicit breakpoints | 4 | `:91` |
| Lookback window | 20 blocks before a breakpoint | `:223-227` |
| Cache isolation | workspace-level (since 2026-02-05) | `:231-233` |
| Parallel requests | wait for first response before firing rest, to guarantee hits | `:151-152` |

> **Implication of the min-token floor:** the per-member prefix must exceed the model's minimum (4,096 tokens for Opus/Haiku, 2,048 for Sonnet) to cache at all (`:186-191`). The L1+L2+L3 stack (anti-slop floor + brand DNA + 3-5 prose samples capped at 12KB each) comfortably clears this; a thin prefix would not — another reason prose samples are required, not optional.

### 5.5 Tracking cache performance

Read `usage.cache_read_input_tokens` vs `cache_creation_input_tokens` from the envelope (`:241-257`). The wrapper already captures these into telemetry (`claude-cli.mjs:532-533`). Target: high read-to-creation ratio.

---

## 6. Model routing table

**Sources:** `claude-api-prompt-caching.md:124-135` (pricing), `advisor-tool-pattern.md:37-66` (Haiku+Opus-advisor benchmarks), feature-map `:84` (Haiku for variants, Opus for final), `claude-cli.mjs:485-489` (the override mechanism).

Route per call via `runClaudeCapturedFlags(..., { model })` (§1.6) — or the direct-API `model` param. Validated values pass `/^[A-Za-z0-9.\-\[\]]+$/`.

| Task | Model | Why | Relative cost (base input / output, per Mtok) |
|---|---|---|---|
| **Bulk draft generation** | Haiku | Cheap, fast, good enough when anchored to verbatim prose samples + schema | $1 / $5 |
| **A/B variant generation** (3 variants × N posts) | Haiku | High call volume; variants are explorations, not the final | $1 / $5 |
| **Triage / classification** (signal/intent/idea routing) | Haiku | Mechanical labeling — exactly the streaming Phase-1 triage role | $1 / $5 |
| **Engagement-prediction scoring** (v2) | Haiku | Bulk scoring across a labeled corpus; cache the scoring prompt | $1 / $5 |
| **Final synthesis** (the post the user actually publishes) | Opus | Reasoning density > cost; this is the deliverable | $5 / $25 |
| **Voice extraction** (deriving the voice model from interview + prose samples at onboarding) | Opus | One-time, high-leverage, quality-critical — sets the member's voice DNA forever | $5 / $25 |
| **Critique / hostile-editor pass** | Opus | Quality gate; do not run reasoning-critical gates on a cheap model | $5 / $25 |

**Defaults baked into the wrapper:** the shared flags include `--fallback-model sonnet` (`claude-cli.mjs:75`) — if Opus is capacity-overloaded the call degrades to Sonnet rather than failing. The streaming wrapper currently tags `claude-opus-4-7[1m]` as its estimate model (`:439`); Choir should pin explicit models per call rather than relying on session defaults.

**Advisor pattern (v2 cost optimization):** `advisor-tool-pattern.md:37-66` shows Haiku-4.5 + Opus-advisor reaching 41.2% on BrowseComp vs 19.7% Haiku-alone at ~85% lower cost than Sonnet-alone (`:45-47`). For Choir's bulk-variant path, a Haiku executor that consults Opus only on hard calls is the candidate v2 routing — but run a 50-sample domain audit before switching, benchmark transfer is not guaranteed (`:66`).

---

## 7. How to clone for Choir

**Source:** `brainstorms/content-os-app/feature-map.json:83-84, 319, 329-330`.

> Verbatim clone guidance (`:329`): *"clone `scripts/outbound/lib/claude-draft.mjs` (prompt-template interpolation + voice-DNA injection capped at 12KB/file + robust JSON extraction). Anchor every prompt to verbatim proven examples + a TRUE-facts list + anti-slop ban-list + output schema (NOT abstract voice descriptions — live-validated fix for slop)."*

### Step 1 — Copy the module almost verbatim
Copy `interpolate`, `loadVoiceDna` (keep the 12KB cap), the robust JSON extractor, and `generateDraft`. Keep the temp-file write + unlink pattern and the `{{VOICE_DNA}}` injection convention (`claude-draft.mjs:104`).

### Step 2 — Swap the prompt template
Replace `draft-<signal>.md` with per-**format** templates: `post-linkedin.md`, `post-carousel.md`, `post-thread.md`, `essay-substack.md`. Each follows the reference structure (`draft-competitor-ats.md`):
- Output schema first: `{hook, body, cta, reasoning}` (§2), "one JSON object, no preamble" (`:3-15, 74`).
- `{{VOICE_DNA}}` slot (`:70`).
- The L1 anti-slop kill-list block (`:46-57`) — loaded from `anti-slop-universal.md` so it stays in sync with the deterministic gate (feature-map `:330`).
- Inline the member's 3-5 prose samples + the seeded A-E post templates as few-shot (verbatim anchoring, §4).
- The org TRUE-facts list (capability boundary).

### Step 3 — Reshape `ctx`
From `{ lead, company, signal }` to `{ company_context, individual_context, topic, format }` (§2). `company_context` ← `orgs` row; `individual_context` ← `members` row (`org_id` FK); `topic` + `format` ← the generation request.

### Step 4 — Reshape `loadVoiceDna` source
Outbound reads voice DNA from disk paths; Choir reads `individual_context.voice_dna` + `prose_samples` from the `members` table. Keep the per-source 12KB cap and labeled-section concatenation so prompt-assembly order (§3) and the cache prefix (§4) are unchanged.

### Step 5 — Wire caching + model routing
- Assemble orders 1-4 (§3) into a cached `system` block; L4-task into the uncached `messages` user turn. Start with automatic caching (§5.3).
- Route bulk/variant/triage → Haiku; final synthesis + voice extraction + critique → Opus (§6) via `runClaudeCapturedFlags({ model })` (or direct-API `model`).

### Step 6 — Reuse the wrapper's defenses
Keep telemetry, 50/75/90% threshold alerts, and `RateLimitError` (`claude-cli.mjs`). On `RateLimitError`, pause the generation queue (the outbound system's circuit-breaker analogue), do not retry-spam.

### Step 7 — Wire the deterministic gate AFTER generation
Out of scope for this file but load-bearing for the contract: `generateDraft` returns `{hook,body,cta,reasoning}`; the next pipeline stage runs `sanitizeCopy(text, {register})` (port of `sanitize-copy.mjs`). On hard-fail, **auto-regenerate with the violations injected into the next prompt** (feature-map `:100, :330`). Pipeline order is sequential and must NOT intermix: `generate → (sweeps) → critique → humanizer → sanitize hard-fail`.

---

## 8. Net-new for engineers (NOT in the reference code)

These exist in the design but have no reference implementation in the cloned files — flag for net-new build:

1. **DB-backed `loadVoiceDna`** — reference reads files; Choir reads `members`/`orgs` rows. Same contract, new data source.
2. **Direct Claude API transport** — reference shells `claude -p`; production web app should use the Anthropic SDK to get clean prompt-caching + per-request model selection. Port the wrapper's responsibilities, replace the transport.
3. **Explicit 4-breakpoint cache placement** — reference does no caching at all (CLI path). Caching is a Choir-only addition.
4. **Auto-regenerate-on-violation loop** — reference prompt *instructs* self-regeneration but there is no programmatic regenerate-with-violations loop wired around `generateDraft`. Choir must build it.
5. **Per-format template set** (`post-linkedin.md` etc.) — only signal-type templates exist today; content-format templates are net-new.

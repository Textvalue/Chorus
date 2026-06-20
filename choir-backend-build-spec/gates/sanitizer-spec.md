# Anti-Slop Sanitizer — Engineer Build Spec (Choir Moat Gate)

> **Status:** implementable spec. Engineers build the backend directly from this.
> **Source code (verbatim reference):** `scripts/lib/sanitize-copy.mjs` (588 lines, read in full).
> **Canonical data file:** `.claude/voice-dna/_shared/anti-slop-universal.md` (parsed at runtime).
> **Seed data:** `../seed-data/anti-slop-killlist.json` (snapshot of the runtime parse).
> **Pipeline position:** Step 3.5 — the deterministic HARD-FAIL floor beneath the LLM humanizer.

---

## 0. What This Is and Why It's the Moat

The humanizer (an LLM pass) enforces anti-slop *by prompt*. Prompt-only enforcement leaks **~5-15%** on code-detectable tells (per `humanizer/SKILL.md:116` — "that's an architecture problem, not a prompt-quality problem"). The sanitizer is the **deterministic choke-point** that converts that leak to **~0%**: a pure-code pass that hard-fails on every machine-detectable AI tell.

For Choir, this is the differentiator. Every competitor that wraps an LLM ships LLM slop ~10% of the time. Choir's content **cannot** ship an em-dash-stuffed, "leverage"-laden, "In today's fast-paced world" post because a deterministic gate blocks emit. This gate is the product's quality promise made mechanical.

It does NOT replace the humanizer (judgment-level rewriting). It is the mechanical floor beneath it. `[source: scripts/lib/sanitize-copy.mjs:1-27]`

**Data layer:** the kill-list / banned-phrase / register-gated / structural-pattern data is **`global_library`** (app-wide, read-only seed). Org and member layers MAY append additional banned vocabulary (competitor names, off-brand words) but the universal floor is shared across all orgs.

---

## 1. The Importable Contract

```ts
sanitizeCopy(text: string, opts?: SanitizeOpts): SanitizeResult
```

```ts
interface SanitizeOpts {
  emDashMaxPerParagraph?: number;   // default 1
  register?: string;                // "" | "editorial" | "ads" | "sales" | ...
                                    //   only "editorial" (substring-tested) changes behavior
  antiSlop?: ParsedAntiSlop;        // pre-parsed { words, phrases, gatedPhrases, source }
  antiSlopPath?: string;            // override path to anti-slop-universal.md
  skipStructural?: boolean;         // skip S1-S5 detection entirely
}

interface SanitizeResult {
  pass: boolean;                    // === (violations.length === 0)
  violations: Violation[];          // HARD-FAIL — must be cleared before emit
  warnings: Warning[];              // advisory — review, not blocking
  stats: {
    em_dashes_total: number;
    paragraphs: number;
    kill_list_loaded: number;       // 70 with current canonical file
    phrases_loaded: number;         // 28
    gated_phrases_loaded: number;   // 11
    register_gated_active: boolean;  // true iff register==="editorial"
    anti_slop_source: string|null;  // path parsed, or null if file missing
    register: string;               // register || "(default)"
    structural_findings: number;
    structural_by_code: Record<string, number>;  // { S1: n, S2: n, ... }
  };
}

interface Violation { type: string; detail?: string; match?: string; sample?: string; code?: string; }
interface Warning   { type: string; detail: string;  sample?: string; code?: string; }
```

`pass === true` ⟺ `violations.length === 0`. Warnings do NOT affect `pass`. `[source: sanitize-copy.mjs:389-529]`

**Exported functions:** `sanitizeCopy`, `parseAntiSlop`, `detectStructuralSlop`. `[source: sanitize-copy.mjs:140,270,389]`

**CLI:** `node scripts/lib/sanitize-copy.mjs <file|-> [--json] [--em-dash-max N] [--register editorial|ads|sales]`
- exit `0` = clean; exit `1` = hard-fail violations found.
- stdin via `-`. `[source: sanitize-copy.mjs:531-587]`

---

## 2. Runtime-Parse Design (edit-once, never drifts)

The sanitizer does **not** hardcode the kill-list. It **parses `anti-slop-universal.md` at runtime** so the data and the gate never diverge — edit the canonical markdown once, the gate updates automatically. `[source: sanitize-copy.mjs:18-20, 140-231]`

`parseAntiSlop(path)` walks the markdown line by line, tracking the current `## ` section (lowercased), and extracts three sets:

| Output set | Source section(s) | Extraction rule | `[source]` |
|---|---|---|---|
| `words` (kill-on-sight vocab) | sections containing **"kill-on-sight"** + **"filler words"** | (a) table rows `\| term \| ... \|` → first cell, strip `(parens)`, lowercase, keep only ≤3 tokens and no `[`; (b) `NEVER use: a, b, c` comma lists; (c) filler section: comma-split lines, keep `^[a-z]+$` single tokens | `:159-194` |
| `phrases` (banned exact) | section containing **"never generate"** | bullets `- "..."` → strip trailing `...` and `[placeholders]`, lowercase, keep if ≥4 chars | `:197-208` |
| `gatedPhrases` (editorial-only urgency) | section containing **"register-gated"** | same bullet format as phrases | `:212-222` |

**Choir build decision — two valid implementations:**

1. **Parse-at-runtime (mirror the reference):** ship `anti-slop-universal.md` as an asset, parse on service boot, cache `ParsedAntiSlop`. Editing the markdown updates the gate. Closest to the reference; zero drift.
2. **Seed-from-JSON (DB-native):** seed `anti-slop-killlist.json` arrays into the `global_library` tables and read from DB. Faster, queryable, but **you own the sync** — any edit to the canonical markdown must re-run the extractor and re-seed. The JSON file documents this obligation in `_meta.extraction_note`.

Recommended for Choir: **seed-from-JSON** for the kill-list/phrase data (it's DB-native and the global_library layer wants it queryable), but keep the markdown as the human-edited source of truth and regenerate the seed via the extractor in CI. Either way the contract is identical.

**Parser edge cases engineers must preserve (these are ground-truth, verified by running the parser 2026-06-20):**
- `notwithstanding` and `that being said` land in BOTH `words` (transitions table) and — for `that being said` — `phrases` (transitional phrases). Duplicate enforcement across sets is fine; both fire.
- Transition-table entries with placeholders or >3 tokens are **dropped** from `words`: `it is worth noting that`, `in the realm of`, `in the landscape of`, `in today's [anything]`. They are NOT enforced. (Documented in the JSON under `transitions_in_source_NOT_captured_by_parser`.)
- The "REPLACE" prescriptions (`in order to`→`to`, etc.) are NOT enforced — they're guidance, the parser only grabs single filler tokens.

---

## 3. The Checks (in execution order)

Run in this order inside `sanitizeCopy`. `[source: sanitize-copy.mjs:389-529]`

### Check 1 — Em-dash density (HARD-FAIL)
- **Threshold:** `> emDashMaxPerParagraph` (default **1**) per paragraph.
- **Paragraph split:** `text.split(/\n\s*\n/)` filtered for non-empty.
- **Counted char:** `—` (U+2014 EM DASH) only. En-dash and hyphen-minus are NOT counted.
- **Behavior:** per offending paragraph push `{ type:"em-dash-density", detail:"paragraph N has X em-dashes (max M)", sample: first 80 chars }`. `stats.em_dashes_total` sums all. `[source: :406-419]`

### Check 2 — Curly quotes / smart punctuation (HARD-FAIL)
- **Banned chars + replacement:** `‘`→`'`, `’`→`'`, `“`→`"`, `”`→`"`.
- **Behavior:** for each banned char present anywhere, push `{ type:"curly-quote", detail:'Nx "<char>" (use <repl>)' }` (one violation per distinct char). `[source: :42-47, 421-430]`

### Check 3 — Kill-on-sight vocabulary (HARD-FAIL)
- **Match:** whole-word, case-insensitive: `new RegExp('\\b' + escape(word) + '\\b', 'i')`.
- **Data:** the 70-word `words` set (regex-escaped per word).
- **Behavior:** on first match per word, push `{ type:"kill-list-word", match: matchedText, detail:'banned vocabulary: "<word>"' }`. `[source: :432-446]`

### Check 4 — Banned exact phrases (HARD-FAIL)
- **Match:** case-insensitive **substring** — `text.toLowerCase().includes(phrase)`. No word boundary.
- **Data:** the 28-phrase `phrases` set.
- **Behavior:** push `{ type:"banned-phrase", match: phrase }`. `[source: :448-453]`

### Check 4b — Register-gated phrases (HARD-FAIL **only** under editorial register)
- **Active only when** `register === "editorial"` (`/editorial/.test(register)`).
- **Match:** whole-word, case-insensitive (`\b...\b`) — deliberate so `"act now"` never fires inside `"react now"`/`"impact now"`.
- **Data:** the 11-phrase `gatedPhrases` set.
- **Behavior:** push `{ type:"register-gated-phrase", match: phrase, detail:'register-gated urgency/hype (editorial-only): "<phrase>"' }`.
- **Silent** for ads/sales/default — those registers WANT DR urgency CTAs. `[source: :455-473]`

### Check 5 — Parallel-fragment stack (WARNING, never blocks)
- **Trigger:** 3+ **consecutive** sentences each with word-count in `[1, 5]`.
- **Sentence split:** `text.replace(/\n+/g,' ').split(/(?<=[.!?])\s+/)`.
- **Behavior:** on the 3rd consecutive short sentence push a `warnings` entry `{ type:"parallel-fragment-stack", detail:"3+ consecutive short sentences (Pattern 10) — likely AI tell", sample: the 3 sentences }`. Does NOT affect `pass`. `[source: :475-493]`

### Check 6 — Structural slop S1-S5 (HARD-FAIL under editorial; WARNING otherwise)
- Calls `detectStructuralSlop(text)` unless `opts.skipStructural`.
- Each finding `{ code, type, detail, sample }` becomes `{ type, code, detail:"[S#] ...", sample }`.
- **Routing:** `register==="editorial"` → push to `violations`; else → push to `warnings`. `[source: :495-507]`

See § 4 for S1-S5 detection logic.

---

## 4. Structural-Slop Detectors (S1-S5)

`detectStructuralSlop(text)` returns findings; the CALLER decides hard-fail vs warn per register. `[source: sanitize-copy.mjs:270-382]`

**Pre-processing inside the detector:**
- `sents` = sentence split (as Check 5).
- `headlines` = candidate headlines: take raw lines, **exclude** markdown headings (`/^\s*#{1,6}\s/`) and `---` rules, run `stripMd()`, keep lines where `2 ≤ wordcount ≤ 9`, not ending in `,`, no `:`, and starting with `[A-Za-z"'(]`. `[source: :277-288]`
- `stripMd()` removes blockquote `>`, headings, bullets, numbered-list markers, bold/italic, code ticks, and trailing `(6w)` word-count annotations. `[source: :249-260]`

| ID | Detects | Detection logic | Scope | `[source]` |
|---|---|---|---|---|
| **S1** | `THE X is THE Y` aphorism | sentence with `wc ≤ 12` AND `/\bthe\s+[\w'’-]+\s+is\s+the\s+[\w'’-]+/i` | sentence (≤12w) | `:291-300` |
| **S2** | contrast-reframe family (4 sub-patterns, first match wins, one per sentence): `, not Y` → `/,\s+not\s+(?:just\s+\|a\s+\|an\s+\|the\s+)?[\w'’-]/i`; `not just X` → `/\bnot\s+just\b/i`; `is never the/a Y` → `/\b(?:is\s+)?never\s+(?:the\|a\|an\|just)\b/i`; `X rather than Y` → `/\brather\s+than\b/i` | sentence | `:302-327` |
| **S3** | `[Noun] that/who [verb]s` vendor headline | headline matching `/^[\w'’-]+(?:\s+[\w'’-]+){0,3}\s+(?:that\|who)\s+[\w'’-]+/i` | headline | `:329-339` |
| **S4** | imperative punchy-pair CTA | adjacent sentence pair (i, i+1) where first word of BOTH ∈ `IMPERATIVE_VERBS` (54-word set) AND `min(wc(a), wc(b)) ≤ 6`; advance i by 2 on match | adjacent sentence pair | `:341-361` |
| **S5** | rule-of-N fragment headline | headline with `wc ≤ 7` containing `≥ 2` matches of `/\b(one\|two\|...\|ten)\b/gi` (spelled cardinals only; digits excluded on purpose) | headline (≤7w) | `:363-379` |

- **`IMPERATIVE_VERBS`** (S4): 54-word Set — `bring, leave, stop, start, book, get, make, see, skip, try, ask, take, build, ship, run, send, give, keep, find, learn, write, talk, show, drop, grab, join, claim, discover, unlock, transform, meet, watch, read, explore, imagine, picture, forget, own, tell, let, go, use, pick, choose, turn, save, win, scale, grow, fix, cut, add, map, wire`. `[source: :63-118]`
- **`NUM_WORDS`** (S5): `one..ten`. `[source: :119-130]`

**S6, S7 (taste-level, NOT mechanized):** colon-aphorism `[setup]: [payoff]` and balanced billboard declarative. Regex cannot separate slop from legitimate label colons / plain lines. Enforced by the **hostile-editor critic** + **slop grader**, NOT this gate. `[source: :62, anti-slop-universal.md:159-162]`

**S8 (candidate, NOT detectable):** essay-scaffolding eyebrow labels ("The problem"/"The stakes"/"The fix") arrive as **component structure**, not copy strings — every string gate is blind to them. Must be caught at app-building structural review. `[source: anti-slop-universal.md:166-168]`

---

## 5. Register-Gating Logic (editorial vs ads/sales)

```
register = (opts.register || "").toLowerCase()
editorialHardFail = /editorial/.test(register)
```
`[source: sanitize-copy.mjs:403-404]`

| Check | default / ads / sales | `register: editorial` |
|---|---|---|
| Em-dash, curly, kill-words, banned phrases (Checks 1-4) | **HARD-FAIL** | **HARD-FAIL** |
| Register-gated urgency phrases (4b) | **silent** (legitimate DR CTAs) | **HARD-FAIL** (word-boundary) |
| Structural S1-S5 (Check 6) | **WARNING** | **HARD-FAIL** |
| Parallel-fragment stack (Check 5) | **WARNING** | **WARNING** (unchanged) |

**Why register-gating exists:** manufactured urgency ("limited time", "act now") and structural punch ("X, not Y") are *legitimate direct-response tools* in ads/sales registers — the **DR Register Map** (`05-marketing-demand/copywriting/_index.md`). Editorial-restraint brands (VOICE.md `register: third-person-editorial` or `density: editorial-restraint`) have zero tolerance. The word-boundary matching on 4b is critical: `"act now"` must not fire inside `"react now"`. `[source: sanitize-copy.mjs:455-473, anti-slop-universal.md:214-218]`

**Choir mapping:** a member/org content request carries a `register` (or `content_type` → register). Pass it through to `sanitizeCopy`. Editorial-brand orgs (set on the org layer) flip the gate to maximum strictness. Personal-brand LinkedIn content typically runs **default** register (S1-S5 = advisory).

---

## 6. Pipeline Position (where it sits)

```
generate (content skill, draft)
  → seven sweeps (copy-editing)
  → critique (hostile-editor, taste-level S6/S7/S8)
  → humanizer (LLM, prompt-enforced anti-slop — leaks ~5-15%)
  → SANITIZE (this gate — Step 3.5, deterministic HARD-FAIL)   ← YOU ARE HERE
  → emit polished_content   (ONLY if pass === true)
```

The gate runs on **post-humanizer output** before emit. If `pass === false`, fix EVERY flagged violation and re-run until exit 0 — do NOT emit while it fails. `[source: content-pipeline-agent.md:305]`

**Validate-then-port discipline (2026-06-08):** never trust an upstream agent's self-reported "gate: pass" — agents reliably report clean while output still fails the deterministic gate. Run the sanitizer on EVERY candidate string before committing it. `[source: content-pipeline-agent.md:307]`

**Choir backend wiring:** the content generation service calls `sanitizeCopy(humanizedText, { register })` as the final synchronous step before persisting/returning a draft. On failure, either (a) loop back to a bounded humanizer re-pass with the violation list injected, or (b) surface the violations to the member with inline highlights. Cap regenerate loops (e.g. 3) to avoid runaway LLM spend, then fail to manual review.

---

## 7. Reference Implementation Notes (build fidelity)

- **Em-dash regex** is `new RegExp("—", "g")` — literal U+2014. Do not broaden to en-dash/hyphen. `[source: :48, 410]`
- **Kill-word regex** escapes regex metacharacters per word before wrapping in `\b...\b`. `[source: :434-437]`
- **Banned-phrase** match is substring (no boundary); **register-gated** match is word-boundary. This asymmetry is intentional — preserve it. `[source: :448-453 vs :455-473]`
- **Sentence split** uses a lookbehind `(?<=[.!?])` — ensure your runtime supports lookbehind (Node ≥10 / modern JS does).
- **`stats.structural_by_code`** is a `{ S1: n, ... }` reduce over findings — useful telemetry for tuning false-positive rates per pattern. `[source: :522-526]`
- Validated 2026-06-07 against all five rejected RevContext pages: caught every mechanizable offender, zero false-positives on plain dinner-talk lines. `[source: anti-slop-universal.md:164]`

---

## 8. Test Vectors (build these as unit tests)

| Input | register | Expected |
|---|---|---|
| `"We leverage a robust paradigm."` | default | `pass:false`, 3 kill-list-word violations (leverage, robust, paradigm) |
| `"text — with — two em dashes"` (one para) | default | `pass:false`, 1 em-dash-density violation (2 > 1) |
| `"He said “hi”."` | default | `pass:false`, 2 curly-quote violations (“ and ”) |
| `"In conclusion, this works."` | default | `pass:false`, 1 banned-phrase ("in conclusion") |
| `"Act now before it's too late."` | default | `pass:true` (gated silent), but structural warnings possible |
| `"Act now before it's too late."` | editorial | `pass:false`, ≥2 register-gated-phrase ("act now", "before it's too late") |
| `"Posts in your voice, not a ghostwriter's."` | default | `pass:true`, 1 S2 **warning** |
| `"Posts in your voice, not a ghostwriter's."` | editorial | `pass:false`, 1 S2 **violation** |
| `"Stop guessing. Start shipping."` | editorial | `pass:false`, S4 imperative-pair violation |
| `"Three services. One operator."` (as headlines) | editorial | `pass:false`, S5 rule-of-N violation |
| `"react now is fine"` | editorial | no register-gated hit (boundary protects "act now") |

---

*Spec compiled 2026-06-20 from `scripts/lib/sanitize-copy.mjs` (full file) + `.claude/voice-dna/_shared/anti-slop-universal.md` (full file). Counts (70/28/11) are ground-truth from running `parseAntiSlop()`.*

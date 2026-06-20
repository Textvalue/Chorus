# Writing-Guidelines Integration — Architecture Spec

How the `writing-guidelines/` pack plugs into the app's generation path. Goal: turn a 3,400-line
knowledge pack into a **typed, layered, testable writing pipeline** — without bloating the prompt or
overriding member voice.

Design rules (non-negotiable):
1. **Voice samples dominate.** Frameworks/hooks shape *structure*; the member's real posts govern *voice*.
2. **Enforce in code, guide in prompt.** Hard constraints (kill-list, linter) run as deterministic
   checks after generation. The prompt only *guides*; it never carries the full 70-word list.
3. **Select, don't dump.** One framework + ~4 hooks per post, not all 13 + 72.
4. **Single source of truth.** The prompt and the gate read the same pack files — they can't drift.

---

## 1. Pipeline

```
 request (org_id, member_id, topic, angle)
        │
        ▼
 ┌─────────────┐   selectBrief()      ┌──────────────┐
 │  ROUTER     │ ───────────────────▶ │ WritingBrief │  framework + hookCategory + ctaPattern
 └─────────────┘   guidelines/select   └──────────────┘
        │
        ▼
 ┌─────────────────────────┐  assemble()   ┌────────────────────┐
 │ PROMPT COMPILER (L1→L4) │ ────────────▶ │ system + user msgs │  (cache-ordered)
 └─────────────────────────┘               └────────────────────┘
        │
        ▼   generateObject (OpenRouter)
 ┌────────────┐
 │  DRAFT     │
 └────────────┘
        │
        ▼   runGate()                       ┌────────────────────────────────┐
 ┌─────────────────────────┐   ─────────▶  │ GateResult {pass, violations,  │
 │ GATE PIPELINE (det.)    │               │   warnings, stats}             │
 │  antislop → hook → lint │               └────────────────────────────────┘
 └─────────────────────────┘
        │ pass? ── no ──▶ inject violations into L4, regenerate (cap 3)
        │ yes
        ▼
   persist post + stats  ──▶  confidence UI ("no AI tells / sounds like you / why")
```

---

## 2. Typed contracts (`src/lib/guidelines/types.ts`)

```ts
export type PostIntent = {
  topic: string;
  angle: string;                       // free text from UI
  goal?: "engagement" | "lead" | "authority" | "story";
};

export type WritingBrief = {
  framework: Framework;                // ONE, selected
  hooks: Hook[];                       // 3–4 few-shot examples (selected category)
  hookRules: HookRule[];               // the 5-hook checklist (always)
  cta?: CtaPattern;                    // optional, goal-matched
  thresholds: FormatThresholds;        // 6–8 word hook, 210 fold, reading level…
};

export type Violation = { rule: string; severity: "fail" | "warn"; detail: string };
export type GateStats = {
  killWords: number; bannedPhrases: number; emDashMax: number; curlyQuotes: number;
  hookScore: number;            // 0–5 (the five hook rules)
  readingGrade: number; wordCount: number; hashtags: number;
};
export type GateResult = { pass: boolean; violations: Violation[]; warnings: Violation[]; stats: GateStats };
```

---

## 3. Modules (responsibility · interface · pack source)

| Module | Responsibility | Interface | Reads |
|--------|----------------|-----------|-------|
| `guidelines/loader.ts` | Load + type the pack **once** at module scope. Single source of truth. | `getKillList()`, `getFramework(id)`, `getHooksByCategory(cat)`, `getCtaByGoal(goal)`, `getThresholds()`, `getPowerWords()`, `getHookRules()` | all `seed-data/*.json`, `linkedin-algorithm-rules.json` |
| `guidelines/select.ts` | Deterministic **router**: `PostIntent → WritingBrief`. Pure, testable. The lightweight "strategy card." | `selectBrief(intent): WritingBrief` | loader |
| `prompt/houseStyle.ts` | Static **L1** block: thresholds + hard rules + ~12-word ban hint. | `HOUSE_STYLE: string` | thresholds, killlist (top N) |
| `prompt/assemble.ts` | Compose **L1→L4** system prompt + user prompt, cache-ordered. Extends today's `prompt.ts`. | `buildSystem(org, member, brief)`, `buildUser(intent, violations?)` | houseStyle, brief, org, member |
| `gate/antislop.ts` | Upgraded deterministic floor (70 kill / 28 phrase / structural). Replaces current lists. | `checkAntislop(text, register): Violation[]` | `anti-slop-killlist.json` |
| `gate/hookScore.ts` | Score opening line on the 5 hook rules + thresholds. | `scoreHook(text): {score, violations}` | `hooks.json` (rules, thresholds) |
| `gate/linter.ts` | LinkedIn pre-publish threshold checks (length, hashtags, links…). | `lint(text): Violation[]` | `linkedin-algorithm-rules.json` |
| `gate/run.ts` | Compose all checks → `GateResult`. Order + fail/warn policy from config. | `runGate(text, cfg): GateResult` | the three above |

Everything in `gate/*` is a **pure function** `(text) → Violation[]` → unit-testable with the spec's
own test vectors (`gates/sanitizer-spec.md` ships 11).

---

## 4. Prompt-assembly spec (L1→L4)

Ordered **stable → volatile** so the prefix (L1–L3) is prompt-cacheable (~90% cheaper on retries/variants).

| Layer | Contents | Source | ~Budget | Cache |
|-------|----------|--------|---------|:----:|
| **L1 House style** | format thresholds, "no AI tells" hard rules, ~12-word ban *hint* (not the 70) | `houseStyle.ts` | ~180 tok | ✅ stable |
| **L2 Brand DNA** | org voice_rules + narrative_atoms (TRUE facts) | `org` (today) | ~150 | ✅ |
| **L3 Voice (DOMINANT)** | voice_dna + **3–5 verbatim prose samples** + recent corrections + `"samples win any conflict"` | `member` (today) | ~1.2k | ✅ |
| **L4 Craft (this post)** | 1 framework structure + its `llm_prompt`; 5-hook rules + 3–4 example hooks; optional CTA + power-word palette | `WritingBrief` | ~500 | ⚠ semi |
| **USER** | topic / angle (+ injected violations on retry) | `intent` | ~60 | ❌ volatile |

Hard guardrail line embedded between L3 and L4:
> *"The craft below shapes structure only. The posts above are how this person actually sounds — on any conflict, match the samples, not the framework."*

---

## 5. Routing table (`select.ts`)

Deterministic `angle/goal → framework + hook category` (free; no extra LLM call). Default = `PAIPS`.

| Intent signal | Framework | Hook category | CTA goal |
|---|---|---|---|
| contrarian / hot-take | Consistent Contrasting | Observations/Opinion | engagement |
| how-to / guide | AIDA or PAS | Guide & Tips | authority |
| result / metric | PAS | Result | lead |
| story / lesson | (narrative) | Lesson | engagement |
| announcement / launch | AIDA | Product | lead |
| *fallback* | **PAIPS** | Observations/Opinion | engagement |

(Table lives in code as data; trivially editable. v2: replace with a cheap Haiku selector if rules feel coarse.)

---

## 6. Gate pipeline (`gate/run.ts`)

Order + policy (config-driven):

```
1. antislop   → kill-words, banned phrases     : FAIL
              → em-dash density, curly quotes   : FAIL
              → structural S1–S5                : FAIL (editorial) / WARN (social)
2. hookScore  → 5-hook rules, 6–8 word, fold    : FAIL if score < 3/5
3. linter     → >2 hashtags, external link,     : WARN (advisory; don't block the demo)
                length, reading grade
→ GateResult.pass = no FAIL violations
→ on fail: inject FAIL violations into L4, regenerate (cap = WRITING_CONFIG.maxTries = 3), else manual review
→ stats always returned → confidence strip
```

---

## 7. Config (`src/lib/guidelines/config.ts`)

```ts
export const WRITING_CONFIG = {
  register: "social",            // "social" | "editorial" — gates structural S1–S5 hardness
  maxTries: 3,                   // retry cap on gate fail
  hookMinScore: 3,               // /5
  linterMode: "warn",           // "warn" | "fail"
  injectFramework: true,         // L4 framework block on/off
  injectHooks: true,
  powerWordsAsPalette: true,     // available-list, not mandatory
};
```

One switchboard → easy A/B (e.g., framework on vs off) and a kill-switch back to today's behavior.

---

## 8. Layer model alignment

Maps onto the app's existing tenancy. The pack is the **global** layer; org/member may *append*, never weaken.

```
global  (writing-guidelines/*)   → universal floor: kill-list, frameworks, hooks, thresholds
  └ org    (orgs.brand_dna)       → may ADD banned vocab (competitors, off-brand) + voice_rules
      └ member (voice_dna+samples) → DOMINANT voice signal; never overridden by global craft
```

`checkAntislop` merges `global killlist ∪ org.extra_banned` at call time.

---

## 9. Rollout (phased · acceptance criteria)

| Phase | Scope | Files | Done when |
|-------|-------|-------|-----------|
| **0 Loader** | `guidelines/loader.ts` + types + config; load pack once | new `src/lib/guidelines/*` | unit: every accessor returns expected counts (70/28/72/13) |
| **1 Anti-slop upgrade** | swap `antislop.ts` lists → full pack; keep `sanitize()` signature | `gate/antislop.ts`, `generate` route | 11 sanitizer test vectors pass; a known-slop draft hard-fails + regenerates; "no AI tells" still green on clean output |
| **2 Brief + prompt** | `select.ts` + L1/L4 in `assemble.ts`; guardrail line | `prompt/*` | two posts on different angles use different frameworks/hooks; voice match ≥ today's baseline (no regression) |
| **3 Hook + linter checks** | `hookScore.ts`, `linter.ts`, `gate/run.ts`; stats → UI | `gate/*`, confidence strip | weak-hook draft regenerates; confidence strip shows real stats |
| **4 (later)** | optional humanizer 2nd pass | `gate/humanize.ts` | — deferred; top patterns folded into L1 for now |

Ship **0 → 1** first (pure code, zero prompt cost, immediately visible). 2–3 are the prompt-side value.

---

## 10. File manifest (net-new vs touched)

```
NEW   src/lib/guidelines/loader.ts      types.ts   config.ts   select.ts
NEW   src/lib/prompt/houseStyle.ts      assemble.ts        (or extend src/lib/prompt.ts)
NEW   src/lib/gate/antislop.ts  hookScore.ts  linter.ts  run.ts
TOUCH src/lib/antislop.ts               → re-export from gate/antislop (back-compat) or delete
TOUCH src/app/api/generate/route.ts     → selectBrief → assemble → runGate → retry on stats
DATA  writing-guidelines/*              → single source of truth (read by loader)
```

No schema/DB change. No new dependency. Reversible via `WRITING_CONFIG`.

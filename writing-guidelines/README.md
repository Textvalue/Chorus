# Writing Guidelines — universal copywriting knowledge pack

Brand-agnostic, member-agnostic copywriting craft, extracted from `choir-backend-build-spec/`
(the `global_library` layer + the writing gates). These are the **shared writing rules every post is
built against** — identical for every org and every member. They carry no `org_id`/`member_id` and
contain no product plumbing (schemas, services, lead-scoring, prospecting, integrations were left
behind in the original spec).

Think of this as the agent's "writing brain": what to write against, and what to reject.

## Contents

### `seed-data/` — the libraries to build *from*
| File | What it is |
|------|-----------|
| `hooks.json` | 72 verbatim hooks + 34 headline formulas + the **5-hook-rule** validation gate (Valuable / Actionable / Efficient / Enticing / Engaging) + formatting thresholds (6–8 words, 210-char fold, 5th-grade reading level). |
| `frameworks.json` | 13 copywriting frameworks (AIDA, PAIPS, …), **most with a ready-to-use LLM prompt**, + 100 power words + a DR register map (which persuasion moves are allowed in editorial vs sales). |
| `body-templates.json` | 77 single-line body structural patterns + 5 full post templates (A–E). |
| `cta-bank.json` | 18 goal-mapped CTA patterns + comment-gating + P.S. closers + continuation teases. |
| `dm-templates.json` | 48 DM / connection-request templates (11 scenarios) + a 6-step warm-up sequence + account-safety rules. |
| `comment-types.json` | 11 comment types + 9 deterministic linter rules for comments. |
| `anti-slop-killlist.json` | The **deterministic floor**: 70 kill-words, 28 banned phrases, em-dash density, curly-quote ban, and S1–S7 structural-slop patterns. The "don't write like AI" gate. |

### `gates/` — the rules that *enforce* the above
| File | What it is |
|------|-----------|
| `sanitizer-spec.md` | The deterministic pass: `sanitizeCopy(text,{register}) → {pass, violations, warnings, stats}`. 6 checks, register-gating, regexes, test vectors. |
| `humanizer-spec.md` | The taste layer: 28 humanizer patterns + a 13-category hostile-editor critique + a 5-characteristic forcing function. |

### `linkedin-algorithm-rules.json`
Platform writing/formatting/posting best-practices (dwell time, 24h spacing, cadence caps, hashtag
penalties, golden-hour) — the rules a post should respect to actually get seen.

## How it maps onto this app today

The app already runs a hand-rolled miniature of this:
- `src/lib/antislop.ts` ≈ a ~20-rule version of `seed-data/anti-slop-killlist.json` (this pack has **70 + 28 + structural**).
- `src/lib/prompt.ts` already inlines voice samples + a ban-list — the "verbatim-anchored" approach these gates preach.

To promote this pack into the generator: load the `seed-data/*` libraries as the shared knowledge
injected into `/api/generate`, and replace `antislop.ts`'s lists with the full kill-list. Per-org /
per-member layers can *append* (competitor names, off-brand words) but never weaken this universal floor.

## Provenance

Extracted verbatim on 2026-06-20 from `choir-backend-build-spec/` (itself distilled from a LinkedIn
content / copywriting knowledge base, with `path:line` citations preserved inside each file's `_meta`).
Counts are ground-truth from the source files; nothing here was invented. Where a source was
incomplete it says so (e.g. PAIPS has no LLM prompt; hooks are 72 of a documented 141).

# Choir — Humanizer + Critique-Pass + 5-Characteristic Forcing-Function Spec

> **What this is.** The *taste-requiring* half of Choir's content-quality pipeline — the LLM-judgment passes that run BEFORE the deterministic sanitizer. This is the spec engineers build the gate service from. It is the layer between draft generation and the deterministic `sanitize-copy` floor (the next-document handoff).
>
> **Why it matters.** Per the source KB (Joe Rhew two-category framework, `humanizer/SKILL.md:99-118`): some AI tells are *code-detectable* (em-dashes, curly quotes, kill-list vocab, banned exact phrases) and belong in a deterministic post-processor. The rest (~20 of the 28 patterns) are *taste-requiring* — they need a model to read the sentence and judge. This document is that taste layer. The deterministic layer is `gates/sanitizer-spec.md` (separate artifact).
>
> **Pipeline position:** `[draft generated]` → **5-char forcing function (Step 0.5)** → `[strategic gate + seven sweeps]` → **hostile-editor critique pass (Step 2.5)** → **humanizer rewrite (Step 3)** → **deterministic sanitizer (Step 3.5)** → `polished_content`.
>
> **Layer tags (Choir 3-layer data model):**
> - The 28 patterns, the LinkedIn carve-out, the critique checklist, and the 5-characteristic forcing function are **`global_library`** (app-wide, read-only seed — every org/member runs the same gate logic).
> - The 5-characteristic *extraction* operates on **`members.prose_samples`** (per-member) for personal-brand content, or **`orgs.brand_voice` + org-level prose samples** for org/brand content.
> - The kill-list vocabulary + banned phrases the critique greps against, and the register flag (`editorial` vs `ads`/`sales`/`default`), are **`global_library`** seed referenced by the deterministic sanitizer.

---

## Sources

| What | Source path:line |
|---|---|
| 28 AI-pattern detect→fix rules + LinkedIn rule-of-three carve-out | `.claude/skills/humanizer/SKILL.md:33-238` |
| Joe Rhew code-detectable vs taste-requiring partition | `.claude/skills/humanizer/SKILL.md:95-118` |
| Extended banned-phrase appendix | `.claude/skills/humanizer/SKILL.md:196-238` |
| Hostile-editor critique pass (workflow, 13 checklist categories A–M, output format, gates) | `.claude/voice-dna/_shared/critique-pass-protocol.md:1-217` |
| 5-characteristic pre-draft extraction (forcing function, per-bullet rules, failure modes, closed loop) | `.claude/voice-dna/_shared/voice-characteristics-extraction-protocol.md:1-110` |
| 5-char forcing-function invocation point (Step 3.6 / Step 0.5) | `.claude/voice-dna/LOADING-PROTOCOL.md:109-130` |
| slop / flat / ALIVE register + "load the positive half or output goes flat" | `.claude/skills/copywriting/references/alive-without-slop.md:1-189` |
| Kill-list vocab + banned phrases + register-gated phrases (greppable by critique cat E/F, enforced by sanitizer) | `.claude/voice-dna/_shared/anti-slop-universal.md:19-231` |
| Deterministic sanitizer contract (handoff target) | `scripts/lib/sanitize-copy.mjs:22-26, 385-521` |
| Content-type → which passes fire | `.claude/voice-dna/_shared/critique-pass-protocol.md:26-33`, `voice-characteristics-extraction-protocol.md:26-33` |

---

## 1. The 28 Humanizer Patterns (detect → fix rules)

> Source: `.claude/skills/humanizer/SKILL.md:33-238`. **Layer: `global_library`** (seed table `humanizer_patterns`).
> Each rule has: `pattern` (the tell), `why_ai` (why it reads as AI), `fix` (the deterministic-where-possible correction). The `enforcement` column is the Joe Rhew partition (`SKILL.md:99-118`): `code-detectable` patterns are *also* hard-failed by the deterministic sanitizer downstream; `taste-requiring` patterns are the humanizer's exclusive job (the sanitizer cannot catch them).
>
> Note on numbering: SKILL.md titles the section "24 AI Writing Patterns" (`SKILL.md:33`) but enumerates **28** (1–28; patterns 25–28 are the "Advanced Patterns" block at `SKILL.md:170-186`, and the Rhew enforcement table at `SKILL.md:99-118` explicitly references "patterns 1-28"). Engineers seed all 28.

### Group: Content Patterns (1–6)

| # | pattern (watch-for) | why it reads as AI | fix | enforcement |
|---|---|---|---|---|
| 1 | **Undue emphasis on significance** — "stands/serves as", "is a testament", "vital/pivotal/key role", "marking a shift", "evolving landscape" | AI inflates importance because it can't judge what actually matters; it hedges by declaring everything significant | State facts plainly. Let importance emerge from specifics. | taste-requiring |
| 2 | **Undue emphasis on notability** — "independent coverage", "media outlets", "active social media presence" | Vague authority-signalling stands in for real evidence | Cite specific sources, not vague authority claims. | taste-requiring |
| 3 | **Superficial -ing phrases** — "highlighting", "underscoring", "reflecting", "contributing to", "showcasing" | Participle tails pad sentences with motion that carries no information | Delete the participle phrase. If the sentence still works, it was filler. | taste-requiring |
| 4 | **Promotional language** — "boasts", "vibrant", "nestled", "breathtaking", "stunning", "renowned" | Brochure adjectives substitute for concrete description | Replace with concrete descriptors. "Stunning views" → "overlooks the harbor". | taste-requiring (vocab subset code-detectable) |
| 5 | **Vague attribution** — "Industry reports", "Experts argue", "Some critics", "several sources" | Manufactures authority without a checkable source | Name the specific source or remove the claim entirely. | taste-requiring |
| 6 | **Formulaic sections** — "Despite its… faces challenges", "Future Outlook" headers | Template scaffolding the model reaches for to fill structure | Integrate challenges naturally instead of template sections. | taste-requiring |

### Group: Language Patterns (7–12)

| # | pattern (watch-for) | why it reads as AI | fix | enforcement |
|---|---|---|---|---|
| 7 | **Overused AI vocabulary (THE BIG LIST)** — kill on sight: Additionally, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight, interplay, intricate, landscape, pivotal, showcase, tapestry, testament, underscore, valuable, vibrant, multifaceted, nuanced, comprehensive, leverage, robust, seamless, streamline, utilize, facilitate, paradigm, synergy, holistic | These are the highest-frequency markers of AI text; RLHF reward functions over-select them | Replace each with the plain alternative (see kill-list mapping in §6). | **code-detectable** (word-level grep, ~80-word list — sanitizer hard-fails) |
| 8 | **Copula avoidance** — "serves as", "stands as", "boasts", "features", "offers" | AI avoids plain "is/are/has" because variety scores higher | Use simple "is/are/has". "The building serves as a landmark" → "The building is a landmark". | taste-requiring |
| 9 | **Negative parallelisms** — "Not only…but", "It's not just…it's" | Manufactures the appearance of nuance/contrast where none exists | State the positive directly instead. | taste-requiring |
| 10 | **Rule of three** — forced groups of three items/examples everywhere | AI defaults to tricolons because they're rhythmically "complete" and compressively efficient | Use the natural number of items. Sometimes two is enough. Sometimes four. **SEE LINKEDIN CARVE-OUT §2.** | taste-requiring |
| 11 | **Elegant variation** — synonym cycling ("the company", "the firm", "the organization", "the enterprise") | AI penalty functions over-weight repetition; the model cycles synonyms to avoid it | Repeat the same word. Readers don't mind repetition as much as AI penalty functions think. | taste-requiring |
| 12 | **False ranges** — "from X to Y" where items aren't on a meaningful scale | Forces a spectrum onto an unordered list to sound systematic | List items directly without forcing a spectrum. | taste-requiring |

### Group: Style Patterns (13–18)

| # | pattern (watch-for) | why it reads as AI | fix | enforcement |
|---|---|---|---|---|
| 13 | **Em dash overuse** | THE single most reliable AI tell; AI over-uses em-dashes for asides | Replace most em dashes with periods, commas, or parentheses. **One per paragraph max.** | **code-detectable** (char match U+2014 — sanitizer hard-fails on density >1/paragraph) |
| 14 | **Excessive boldface** | Mechanical emphasis on too many terms | Remove mechanical bold emphasis. Bold only genuinely critical terms. | taste-requiring |
| 15 | **Inline-header lists** — `**Bold header:** explanation`, repeated in bullets | Template list format the model defaults to | Use regular prose or simple bullets without the bold-colon pattern. | taste-requiring |
| 16 | **Title case overuse** | AI defaults headings to Title Case | Use sentence case for headings unless style guide requires otherwise. | taste-requiring |
| 17 | **Decorative emojis** | Emoji in headings/professional content is a chatbot tell | Remove emojis from headings and professional content entirely. | **code-detectable** (Unicode `\p{Emoji}` range minus ASCII) |
| 18 | **Curly quotation marks** | Smart quotes (U+201C/201D/2018/2019) are an autoformat/AI artifact | Use straight quotes consistently unless house style demands otherwise. | **code-detectable** (char match U+201C/201D/2018/2019 — sanitizer hard-fails) |

### Group: Communication Patterns (19–21)

| # | pattern (watch-for) | why it reads as AI | fix | enforcement |
|---|---|---|---|---|
| 19 | **Chatbot artifacts** — kill on sight: "I hope this helps", "Of course!", "let me know", "here is a…", "Great question!" | Direct conversational residue from the assistant turn | Delete entirely. Content should stand alone. | **code-detectable** (exact-phrase grep — sanitizer hard-fails) |
| 20 | **Knowledge-cutoff disclaimers** — kill on sight: "as of [date]", "Up to my last training", "based on available information" | Model hedging about its own training boundary | State facts as facts or note specific source dates. | **code-detectable** (phrase grep) |
| 21 | **Sycophantic tone** | Performative enthusiasm from RLHF politeness training | Remove performative enthusiasm. Be direct and honest. | taste-requiring |

### Group: Filler and Hedging (22–24)

| # | pattern (watch-for) | why it reads as AI | fix | enforcement |
|---|---|---|---|---|
| 22 | **Filler phrases** | Wordy connective tissue the model adds reflexively | Mappings: "In order to"→"To"; "Due to the fact that"→"Because"; "At this point in time"→"Now"; "It is important to note that"→Delete; "In today's [anything]"→Delete; "Here's the thing:"→Delete (just make the point); "Here's why:"→Delete (show the reason directly); "Here's what's interesting:"→Delete (state the interesting thing). | partly code-detectable (exact phrases), partly taste-requiring |
| 23 | **Excessive hedging** | Model stacks qualifiers to avoid committing | Take a position. "This could potentially be argued to possibly indicate" → "This suggests". | taste-requiring |
| 24 | **Generic positive conclusions (incl. wrapped-bow endings)** — kill on sight: "The future looks bright", "Exciting times ahead", "stands as a testament to", "That's the real competitive advantage", "That's the whole game", "That's what makes it work" | AI narrates the conclusion instead of letting the reader draw it; wraps the point in a bow | End on a concrete observation, an unresolved question, or simply stop. Let the reader draw the conclusion; don't narrate it. Cut the wrapped-bow closing. | partly code-detectable (exact phrases), partly taste-requiring |

### Group: Advanced Patterns (25–28)

| # | pattern (watch-for) | why it reads as AI | fix | enforcement |
|---|---|---|---|---|
| 25 | **Pseudo-profound flourishes** — kill on sight: "This changes everything", "The implications are staggering", "We're witnessing the emergence of…", "This is just the beginning", "The future of X is Y" | Grandiose framing to manufacture importance | State what something does. Skip the grandiose framing. | taste-requiring (some exact phrases code-detectable) |
| 26 | **Contrastive negation for fake profundity** — "It's not X, it's Y" / "The real question isn't X, it's Y" used to sound deep | The most reliable structural AI tell; manufactures the appearance of insight | Only use when making an actual contrast. If you're just reframing, state your point directly. | taste-requiring |
| 27 | **Extrapolation to universal principles** — "Once you do X, Y feels wrong" / "After X, you'll never go back to Y" | Projects one experience onto the reader as universal law | Just state what you do. Don't project your experience onto the reader as universal law. | taste-requiring |
| 28 | **Staccato pattern + uniform paragraph rhythm** — (a) 4+ short declarative sentences in a row; (b) every paragraph roughly the same length (2–3 sentences) monotonously across the piece | AI defaults to uniform compressive rhythm; the brain registers the rhythm before parsing content | Vary sentence length AND paragraph length. Connect ideas with "because", "so", "which means" instead of choppy declarations. One-word paragraphs allowed. Long ones too. Mix wildly. | taste-requiring (partial-fragment-stack variant WARN-detectable) |

> **Engineer note — the leakage ceiling (`SKILL.md:99-118`):** code-detectable patterns leak ~5–15% per pass even with "seven explicit prohibitions in one prompt, ALL CAPS banlist, character-by-character scan instruction" (Rhew's seven-prompt-repetition test). Prompt repetition lowers but does not eliminate the leak. **The only path to ~0% on code-detectable patterns is the deterministic post-processor** (`sanitize-copy.mjs`, the handoff target in §5). Do NOT try to make the humanizer prompt 100%-reliable on patterns 7/13/17/18/19/20 — that's an architecture problem, not a prompt-quality problem. The humanizer catches a chunk; the sanitizer guarantees the floor.

### Extended banned-phrase list (humanizer appendix, `SKILL.md:196-238`)

> **Layer: `global_library`** (seed table `humanizer_banned_phrases`, category-tagged). Cut all of these on every humanizer pass. Some overlap pattern #7; listed separately for findability.

**Pseudo-profundity / fake insight:** "real power" (cut entirely; state what it does) · "wake-up call" · "fundamentally changes" · "key insight" · "cut through the noise" · "compounding intelligence" / "compounding [anything]" · "everything changes when…"

**Marketing hype openers:** "transform your [X]" · "unlock your [X]" · "elevate your [X]" · "supercharge [X]" · "drive [X]% [Y]" without a real source · "in today's fast-paced world" / "in today's [anything]"

**Filler closures / discourse markers (extends #22):** "at the end of the day" · "moreover" · "it's worth noting that" · "dive deep into" (cut "dive deep") · "unpack [X]"

**Vague nouns to scrutinize:** "landscape" (metaphorical) · "tapestry" · "robust" · "seamless" · "leverage" (verb→"use") · "delve" (→"examine"/"look at")

**Website-copy specific (RevContext audit):** literal `[Acme]`/`[Company]`/`[Customer]` placeholder text in production (ship blocker) · "Most [B2B teams/companies/agencies] treat [X] like [Y], but [Z] has flipped" (schoolbook contrarian opener — the contrast must be specific and proved) · "No two [emails/decks/sequences] look alike, and none of them sound like a template" (claim-as-proof — replace with the actual proof) · service-tier bullets describing what's INCLUDED instead of what HAPPENS (cut process language, replace with measured outcomes)

**The governing test for the whole appendix:** *state what something does, in concrete terms, with named subjects and named outcomes. Cut every word that doesn't survive that test.*

### Humanizer "adding soul" requirement (`SKILL.md:21-29`)

> Removing AI markers is only half the job. Merely removing markers creates sterile, voiceless writing (this is the FLAT failure mode — see §0 alive-without-slop). Good humanization ALSO requires:
- Opinion and reaction to facts, not neutral reporting
- Sentence rhythm variation (alternate short punchy with longer flowing)
- Acknowledging complexity and mixed feelings rather than forced positivity
- First-person perspective when appropriate
- Specific emotional language rather than generic terms

---

## 2. The LinkedIn Rule-of-Three Carve-Out

> Source: `.claude/skills/humanizer/SKILL.md:78`. **Layer: `global_library`** (a content-type-conditional exception on humanizer pattern #10 and on critique category C).

**The rule:** Humanizer pattern #10 (Rule of Three / forced tricolons) and critique category C (three short consecutive sentences) are normally flagged as AI tells. **They are NOT flagged when `content_type = linkedin-post` (social content).**

**Why:** Rule of Three is an *intentional* LinkedIn copywriting storytelling technique — Nathan Baugh's "Jenga, Rule of 3, But/Therefore" framework. In LinkedIn social copy it is craft, not slop.

**Deterministic implementation logic:**

```
IF content_type == "linkedin-post" (or social):
    SUPPRESS humanizer pattern #10 (Rule of Three)
    SUPPRESS critique-pass category C (three short consecutive sentences)
    # Note: the staccato/parallel-fragment warning in the sanitizer (Pattern 10
    #   "three short consecutive sentences") ALSO does not apply — anti-slop-universal.md
    #   Pattern 10 lists "LinkedIn posts" under Apply-to, but the carve-out here is the
    #   humanizer-skill-level exception specific to the deliberate storytelling tricolon.
ELSE (website-copy, landing, sales, substack-essay, long-form-personal, email, blog):
    ENFORCE pattern #10 and category C normally.
```

**Reference docs (seed as `when_to_use` metadata, do not flag these as KB-internal in output):** `04-linkedin-content/copywriting/linkedin-copywriting-rules`, `04-linkedin-content/copywriting/linkedin-hooks-playbook`.

> **Important scope boundary:** the carve-out is a SUPPRESSION of two specific checks for ONE content type. Every other humanizer pattern (1–9, 11–28) still fires for LinkedIn posts. The "three short fucking sentences are a giveaway of AI" user-verbatim rule (`anti-slop-universal.md:139`) still applies to *non-deliberate* parallel-fragment stacks even in LinkedIn copy — the carve-out covers the *intentional storytelling tricolon*, not accidental machine rhythm. This is a taste call; Choir surfaces it but does not auto-strip in LinkedIn context.

---

## 3. The Critique-Pass Workflow (Hostile-Editor, Visible 3-Turn Teaching Surface)

> Source: `.claude/voice-dna/_shared/critique-pass-protocol.md:1-217`. **Layer: `global_library`** (checklist + output template seeded; the critique RUNS against per-member/org voice characteristics from §4).
> **Pipeline position:** content-pipeline-agent **Step 2.5** — after Seven Sweeps (copy-editing), before Humanizer (`critique-pass-protocol.md:20`).
> **Purpose:** Force the model to audit its own draft against a fixed checklist BEFORE rewriting. "Most teams skip this pass. It does the most work." (`critique-pass-protocol.md:16`)

### When it fires (`critique-pass-protocol.md:26-33`)

```
FIRE critique pass IF content_type ∈ {website-copy, landing, sales, substack-essay, long-form-personal}
SKIP for {social, internal, email}  → humanizer alone is sufficient for short-form / low-stakes
```

### The 5 rules of the pass (`critique-pass-protocol.md:38-44`)

1. **Visible to user.** The critique block displays in the agent's response. The user reviews before rewrite proceeds. **This is a 3-turn workflow: (turn 1) draft → (turn 2) critique shown → user approves or edits critique → (turn 3) rewrite.** ← This is the teaching surface: the user SEES every flagged offender and learns the tells.
2. **Quote every offender verbatim.** No paraphrase. No "this section has issues." Quote the actual problem sentence.
3. **No rewriting in this pass.** The critique pass ONLY identifies. The rewrite happens in the humanizer step that follows, using the critique as a constraint set.
4. **Read as a hostile editor, not a collaborator.** Find everything wrong, not preserve the author's feelings.
5. **The 5 voice characteristics from Step 0.5 are part of the checklist.** Any line that violates one gets flagged (this is the closed loop — see §4).

### The 13 checklist categories A–M (run in order; quote every instance; "0 offenders" if none)

> **Layer: `global_library`** (seed table `critique_categories`). Source: `critique-pass-protocol.md:47-124`.

| Cat | Name | Detection rule (deterministic where stated) |
|---|---|---|
| **A** | **Em-dash density** | Count `—` and `--`. Quote every paragraph with >1. Target ZERO for website-copy. Hard max: 1 per 1000 words. |
| **B** | **Parallel tricolons / three-adjective stacks** | Quote every instance of 3 items with identical grammatical shape. E.g. "Fast, easy, and reliable.", "Built for founders, built for teams, built for scale.", "Operator. Builder. Closer." |
| **C** | **Three short consecutive sentences (Pattern 10)** | Quote every sequence of 3+ sentences each under 8 words with parallel grammatical structure. **Highest-fidelity AI tell per user verbatim rule.** (Suppressed for LinkedIn — see §2.) |
| **D** | **False contrast reframe ("Not X. Y." constructions)** | Quote every "It's not just X, it's Y" or "X isn't Y. It's Z." **The single most reliable structural tell** (Pattern 7 in anti-slop-universal). |
| **E** | **Banned vocabulary** | Grep against kill-on-sight list in `anti-slop-universal.md`. Quote every line containing: delve, leverage, utilize, facilitate, foster, robust, comprehensive, pivotal, crucial, seamless, intricate, nuanced, multifaceted, holistic, landscape, tapestry, testament, paradigm, synergy, realm, operator, playbook, north star, unlock. (Full list §6.) |
| **F** | **Opener tells** | Quote every sentence opening with: "In today's [anything]", "In an era of", "Let's delve into", "Imagine a world where", "Whether you're", "It's important to note that", "Here's the thing", "Here's why". |
| **G** | **Copula avoidance** | Quote every "serves as", "stands as", "boasts", "represents", "embodies" where plain "is" would work. |
| **H** | **Abstractions a number could replace** | Quote every vague quantifier: "many companies", "lots of teams", "several customers", "various challenges", "a wide range of", "numerous", "multiple". Tag each `[REPLACE WITH SPECIFIC NUMBER OR NAMED ENTITY]`. |
| **I** | **Bold-term-colon bullets** | Quote every `**Term:** explanation` list item. Acceptable once per section. **Flag if 3+ in a row.** |
| **J** | **Wrap-up codas** | Quote every section-ending sentence that restates the section's point: "That's the real game", "That's what makes it work", "That's the whole point." (Pattern 8 in anti-slop-universal.) |
| **K** | **Sentences that could be cut entirely** | Quote every sentence whose removal would not change meaning. Offenders: setup sentences before the point, transitions ("With that established…"), generic reader-praise ("As a smart marketer, you know that…"). |
| **L** | **Voice characteristic violations** | Cross-reference against the 5 characteristics from Step 0.5 (§4). Quote every violating line. Tag `[VIOLATES CHARACTERISTIC #N]`. ← **the closed loop.** |
| **M** | **Copywriter-formula / structural slop (S1–S7) — THE DINNER TEST** | **Highest-priority for editorial brands.** For EVERY headline and short line: *would the author SAY this out loud to a peer at a dinner, or is it written-for-a-website?* Quote each offender + S-code (S1–S7 below). |

#### Category M detail — the S1–S7 structural-slop codes (`critique-pass-protocol.md:99-124`)

| S-code | Pattern | Killed example | Enforcement |
|---|---|---|---|
| **S1** | "THE X is THE Y" aphorism (noun = noun for portentous effect) | "The list is the message." | sanitizer `--register editorial` hard-fail |
| **S2** | Contrast-reframe family: `X, not Y` / `not just Z` / `is never Y` / `rather than` (soft cousins of Pattern 7 / category D — ban the whole family) | "Posts in your voice, not a ghostwriter's." | sanitizer `--register editorial` hard-fail |
| **S3** | "[Noun] that/who [verb]s" vendor headline (product-as-subject + relative clause) | "Outbound that survives the AI flood." | sanitizer `--register editorial` hard-fail |
| **S4** | Imperative punchy-pair CTA (two terse commands = ad cadence) | "Bring your setup. Leave with a plan." | sanitizer `--register editorial` hard-fail |
| **S5** | Rule-of-N aphoristic fragment (spelled cardinals in a short headline) | "Four parts, one memory." | sanitizer `--register editorial` hard-fail |
| **S6** | Colon-aphorism `[setup]: [payoff]` | "Ask any engineer: read access only." | **TASTE-LEVEL — critic's job, no regex** |
| **S7** | Balanced "clever" declarative (billboard, not a person) | "Relationship over volume." | **TASTE-LEVEL — critic's job, no regex** |

**Plus these recurring families (all taste-level, all the critic's job — `critique-pass-protocol.md:111-118`):**
- **Trailing zinger after body** — a clipped sentence parked alone after a paragraph to "land" the point. THE most repeated tell; words can be plain, the editorial STAGING is the defect.
- **Verbless-noun-phrase headline** — "The X that/worth Y" ("The signals worth your time.").
- **Absolute-claim-as-insight** — "the only thing", "every buyer", "never", "everything ever". A real operator hedges.
- **Comma-so/and payoff clause** — fact, comma, welded "so [outcome]"/"and [reflection]" button.
- **Balanced antithesis / then-now arc** — "you on your sharpest day, not a hired pen on an average one."
- **Dismissive-foil tail** — ending on a sneer at the lazy alternative ("not a hired pen").
- **Unglamorous-part virtue move** — humble-flex ("The unglamorous part is the proof.").

**⚠️ Anti-over-correction guard (`critique-pass-protocol.md:120`):** the defect is the rhetorical WRAPPER, never the underlying fact. Real specific mechanics (a Clay run-condition, a real metric, a real bio fact) must SURVIVE verbatim — only the button/colon/arc framing gets cut. **Do not vaporize concrete truth into vagueness.** (For Choir: when the critique flags an S-code line, the rewrite must preserve any factual payload — the gate must not let the humanizer flatten a real number/name into "results" / "tools".)

**Grading instruction (`critique-pass-protocol.md:124`):** Do NOT grade structural slop the way a copywriter would. A line being "punchy" or "sharp" is the DEFECT, not the merit. The bar is plain-and-specific, not clever-and-punchy.

### Output format (verbatim template, seed as the critique render contract — `critique-pass-protocol.md:130-197`)

```
## Hostile-Editor Critique (Pre-Humanizer)

Draft scanned: [W words across N sections]
Voice characteristics referenced: Step 0.5 extraction

### A. Em-Dash Density: [N offenders]
[For each: section reference + verbatim quote]
### B. Parallel Tricolons: [N offenders]
[For each: section reference + verbatim quote]
### C. Three Short Consecutive Sentences (Pattern 10): [N offenders]
### D. False Contrast Reframe (Pattern 7): [N offenders]
### E. Banned Vocabulary: [N offenders]   ← offending word in CAPS
### F. Opener Tells: [N offenders]
### G. Copula Avoidance: [N offenders]   ← + replacement suggestion
### H. Abstractions a Number Could Replace: [N offenders]   ← + [SPECIFIC REPLACEMENT NEEDED]
### I. Bold-Term-Colon Bullets: [N offenders]
### J. Wrap-Up Codas: [N offenders]
### K. Sentences That Could Be Cut Entirely: [N offenders]
### L. Voice Characteristic Violations: [N offenders]   ← + which characteristic violated
### M. Copywriter-Formula / Structural Slop (S1–S7): [N offenders]
    ← + S-code + one line on why it fails the dinner test.
       Paste sanitize-copy.mjs --register editorial output for S1–S5; add own S6/S7.

---
## Total Offenders: N

## Rewrite Constraints (Auto-Applied to Humanizer Step)
The humanizer step receives this critique as a constraint set. It MUST:
1. Eliminate every offender quoted above (or document why it can't)
2. Replace at least 3 abstractions with specific nouns or numbers
3. Include at least one sentence under 6 words AND one over 25 words
4. Cut the opening if it's setup, cut the closing if it's a summary
5. Preserve the meaning. Don't soften the claims.
6. Return ONLY the rewritten copy (no commentary, no version markers, no "here's the rewrite").

## User Approval Gate
Reply with one of:
- APPROVE — proceed to humanizer with this critique as constraints
- EDIT [section]: [your edits] — adjust the critique before rewrite
- SKIP [category] — drop a specific category from rewrite constraints (e.g. "SKIP G")
- ABORT — stop pipeline, return raw draft
```

### Choir implementation: the 3-turn state machine

> The "visible 3-turn teaching surface" is the product feature. Engineers build it as a gated state machine on the draft record.

```
critique_state ENUM: DRAFTED → CRITIQUED → (APPROVED | EDITED | ABORTED) → REWRITTEN

Turn 1  DRAFTED:   generate draft (against the 5 characteristics from §4)
Turn 2  CRITIQUED: run the 13-category checklist → render the verbatim output template
                   above into the UI. PERSIST the critique block (it is the teaching
                   surface + the audit trail + the humanizer constraint set).
        USER GATE: APPROVE | EDIT [cat]:[text] | SKIP [cat] | ABORT
                   - APPROVE → constraint set = full critique
                   - EDIT    → constraint set = user-modified critique
                   - SKIP X  → drop category X from constraint set (removes false positives,
                               prevents over-correction)
                   - ABORT   → return raw draft, no rewrite
Turn 3  REWRITTEN: humanizer (§1 patterns) runs with the (possibly edited) critique as a
                   hard constraint set + the 6 rewrite constraints above. Output → sanitizer (§5).
```

**Why the gate matters (`critique-pass-protocol.md:201-205`):** the model can't simultaneously generate creative content AND audit it. Splitting into scan-and-quote then rewrite-against-quotes produces measurably better output. The visible-to-user requirement adds a second layer: human review catches edge cases the checklist misses, and `SKIP X` removes false positives so the rewrite doesn't over-correct.

**Cost note (`critique-pass-protocol.md:209-213`):** this pass ~triples Chain A token cost for qualifying content types. Intentional — cleanup later costs more than scrutiny now. Per-category `SKIP X` lets the user trim cost (e.g. on strong-voice/suspect-specificity drafts, SKIP A–G, focus on H).

---

## 4. The 5-Characteristic Pre-Draft Extraction (Forcing Function → Critique Audit Checklist)

> Sources: `.claude/voice-dna/_shared/voice-characteristics-extraction-protocol.md:1-110`, `.claude/voice-dna/LOADING-PROTOCOL.md:109-130`. **Layer:** the PROTOCOL is `global_library`; the EXTRACTION operates on `members.prose_samples` (personal brand) or `orgs` brand-voice + org prose samples (brand/website copy).
> **Pipeline position:** content-pipeline-agent **Step 0.5** (after voice DNA loaded, before Strategic Gate — `voice-characteristics-extraction-protocol.md:20`; LOADING-PROTOCOL calls the same forcing function "Step 3.6" at `:109`).
> **Purpose:** Force the agent to commit to specific voice characteristics BEFORE drafting. "Style transfer works from samples, not from names or descriptions." (`voice-characteristics-extraction-protocol.md:16`)

### When it fires (`voice-characteristics-extraction-protocol.md:26-33`)

```
FIRE IF content_type ∈ {website-copy, landing, sales, substack-essay, long-form-personal}
SKIP for {social, internal, email, linkedin-post}  → prose samples carry less leverage short-form
```

### Required inputs before running (`voice-characteristics-extraction-protocol.md:38-44`)

1. Universal anti-slop (`_shared/anti-slop-universal.md`) — `global_library`
2. Voice source (owner/member or org/client per LOADING-PROTOCOL Step 1)
3. **Prose samples** — `members.prose_samples` (personal) OR org/project `voice-prose-samples.md`

**Hard-stop / graceful rule:**
- For `website-copy`/`landing`/`sales`: **absence of prose samples is a HARD STOP** (no description-only fallback — proceeding reproduces the documented R1 voiceless-copy failure). `LOADING-PROTOCOL.md:48-53`, `:114-126`.
- For `substack-essay`/`long-form-personal` (personal brand): if no samples, surface gap + offer description-only fallback (lower fidelity) with user consent.

### The 5 characteristics (audit checklist — seed as `voice_characteristics` schema)

> Source: `voice-characteristics-extraction-protocol.md:50-79`, `LOADING-PROTOCOL.md:117-122`. Each is BOTH (a) a pre-draft forcing-function bullet AND (b) the Step 2.5 critique category L audit item. This is the closed loop.

| # | Characteristic | What to extract (per-bullet rule) | Passing example | Failing (reject + re-extract) |
|---|---|---|---|---|
| **1** | **Sentence-length variance** | Observed RANGE + FREQUENCY. | "3-word fragments mixed with 28-word sentences; roughly one fragment per 100 words." | "varied sentences" |
| **2** | **What this writer refuses to say** | NAME specific absent tokens (negative voice signal). | "Never uses 'leverage', 'unlock', 'pivotal'. Avoids three-adjective stacks. No exclamation marks." | "no jargon" |
| **3** | **Default verb tense + stance** | (a) present/past default, (b) pronoun person, (c) confidence register. | "Active present tense, first-person plural ('we'), high-confidence (no 'might', 'could', 'perhaps')." | "authoritative voice" |
| **4** | **Where rhythm breaks** | ACTUAL structural moves the writer uses. | "Frequent dashes for asides; single-sentence paragraphs after a long one; question mid-paragraph; parenthetical interruption." | "good rhythm" |
| **5** | **Where specifics replace abstractions** | NAME the KIND of specifics. | "Names specific company names, specific revenue numbers, specific dates. Never says 'recently' — says 'in Q4 2025'." | "engaging and approachable" |

### Output format (verbatim — `voice-characteristics-extraction-protocol.md:52-65`)

```
## Voice Characteristics Extraction (Pre-Draft)

Source: [members.prose_samples | org voice-prose-samples.md | project-root voice-prose-samples.md
         (website-copy/landing/sales) | description-only-fallback (NOT available for
         website-copy/landing/sales — HARD STOP on missing samples)]
Samples observed: [N samples, ~W words total]

1. **Sentence-length variance.** [Observed pattern. Range. Examples.]
2. **What this writer refuses to say.** [Specific words/phrases/constructions absent. Negative signal.]
3. **Default verb tense and stance.** [Present/past/future. 1st/2nd/3rd person. Confident/hedging.]
4. **Where rhythm breaks.** [Paragraph ends, fragments, asides, parentheticals, where a long sentence lands.]
5. **Where specifics replace abstractions.** [Concrete numbers, named entities, sensory detail.]

I will draft against these five characteristics. If the draft contradicts any of them,
treat it as a defect and fix.
```

### Failure modes — reject these extractions (`voice-characteristics-extraction-protocol.md:83-92`)

Re-extract if any bullet reads like: "Conversational and professional tone" (vague) · "Direct and clear writing" (generic) · "Authoritative voice" (description-not-pattern) · "Engaging and approachable" (sentiment-not-mechanic) · **any bullet that could describe 90% of B2B SaaS writing.** Bar: the extraction must be specific enough that a different writer could mimic the voice from the bullets alone.

### How it closes the loop (`voice-characteristics-extraction-protocol.md:104-106`, `LOADING-PROTOCOL.md:122`)

```
Step 0.5  EXTRACT 5 characteristics  ──┐  (commit, before drafting)
                                       │
Step 1    DRAFT against the 5         ◄┘
                                       │
Step 2.5  CRITIQUE category L:  quote every line that VIOLATES one of the 5,
          tag [VIOLATES CHARACTERISTIC #N]   ◄── the closed-loop test:
                                                 "did the draft match the
                                                  characteristics it committed to?"
Step 3    HUMANIZER rewrites to eliminate the violations
```

**Choir implementation:** persist the 5-characteristic extraction on the draft record at Step 0.5. At Step 2.5, category L runs the draft against THAT persisted extraction (not a generic checklist). The forcing function and the audit are the same five bullets — extracted once, audited against once.

> **Why a forcing function works (`voice-characteristics-extraction-protocol.md:96-100`):** LLMs are pattern-matchers; asking for output without first characterizing the pattern produces regression-to-training-mean. Naming a copywriter nudges vaguely; pasting 200–600 words of their prose THEN forcing the 5-bullet extraction shifts output measurably (Adpharm 2026-04-03). Without the forcing function, the model treats samples as decoration, not pattern source.

---

## 0/§4-companion. The slop / flat / ALIVE Register (load the POSITIVE half or output goes flat)

> Source: `.claude/skills/copywriting/references/alive-without-slop.md:1-189`. **Layer: `global_library`** (craft doctrine seed, loaded for editorial/website content_type per `humanizer/SKILL.md:264` website-copy carve-out). This is WHY the humanizer must "add soul" (§1) and not just strip — and the calibration data the gate grades against.

**The two-failure problem (`alive-without-slop.md:14`):** copy fails in two opposite directions.
- **SLOP** = the writer generating energy from *inside* the sentence (contrast-reframes, colon-aphorisms, billboard balance, button CTAs) because the line carries no real information.
- **FLAT** = copy so de-slopped that the writer killed the buttons AND the source of life, assuming life lived in the rhetoric. It didn't.
- **TARGET = the MIDDLE:** a sharp operator stating specific true things, in the reader's own conversation, aimed at a real desire. Salesmanship-in-print to a peer. Not a billboard, not a spec sheet.

> **Critical engineering consequence:** if Choir loads ONLY the negative half (the 28 patterns + kill-list + critique), the humanizer over-corrects toward FLAT. The positive doctrine MUST also be loaded for editorial content_types so the rewrite knows what ALIVE looks like. **De-slop by moving the line toward the four sources of life below — never toward a vaguer abstraction.** (`alive-without-slop.md:22`)

**The single governing test (the dinner test, `alive-without-slop.md:16`):** *Would the author SAY this sentence out loud to a peer at a dinner — or is it written-for-a-website?* If the latter, cut it. A slightly long, plain, specific sentence beats a short clever one. **Punchy is the defect, not the merit.**

**The four sources of life (none of them rhetoric — `alive-without-slop.md:24-44`):**
1. **Specificity, to the point of being checkable (Hopkins).** Could a competitor paste this exact sentence onto their own site? If yes, it's a platitude — cut it. When a line goes flat, go MORE specific, not blander.
2. **Reason-why — the mechanism is the interesting part (Hopkins/Schwartz).** For every claim, can you write the next sentence starting with "because" or "here's how"? If not, it's a slogan — delete it.
3. **Demonstration — put the reader inside one true scene (Caples/Collier).** Convert every abstract benefit into a concrete moment.
4. **Channeled desire + gradualization (Schwartz/Collier).** Force from OUTSIDE (the reader's pre-existing want); momentum from a chain of acceptances (each line earns the next with "which means", "the reason for that", "here's how").

Plus the governing principle: **respect the reader (Ogilvy)** — "the consumer is not a moron; she is your wife." Never "Here's why 👇".

**The slop/flat/ALIVE calibration table (`alive-without-slop.md:121-130`)** is the load-bearing grading artifact — for each message, SLOP ❌ / FLAT ❌ / ALIVE ✅. **Seed it as the gate's few-shot calibration set** (Choir's grader anchors to these negative+positive examples). Engineers: ingest the full table from the source file verbatim into a `slop_calibration_examples` seed (`global_library`); it is too long to inline here but is the single most load-bearing reference for editorial copy.

---

## 5. Full Pipeline Order + Handoff to the Deterministic Sanitizer

> Sources: `critique-pass-protocol.md:20`, `voice-characteristics-extraction-protocol.md:20`, `LOADING-PROTOCOL.md:109-130`, `humanizer/SKILL.md:116` (sanitizer wired into Step 3.5), `scripts/lib/sanitize-copy.mjs:22-26,385-521`.

### Canonical pipeline order (content-pipeline-agent Chain A, editorial content_types)

```
Step 0    LOAD voice context (LOADING-PROTOCOL):
            - content_type routing → org/brand VOICE.md + prose samples (website/landing/sales)
              OR member voice + prose samples (personal brand)
            - ALWAYS load anti-slop-universal.md (global_library)
            - load alive-without-slop.md POSITIVE doctrine for editorial types (§0)
            ─ HARD STOP if website/landing/sales and NO prose samples exist
Step 0.5  FORCING FUNCTION — 5-characteristic extraction (§4)   [TASTE / model]
            → persist 5 bullets on draft record
Step 1    DRAFT against the 5 characteristics                    [model]
Step 2    SEVEN SWEEPS (copy-editing skill — structural quality) [model]
Step 2.5  HOSTILE-EDITOR CRITIQUE (§3) — 13 cats A–M, verbatim   [TASTE / model + VISIBLE 3-turn gate]
            → category L audits draft vs the Step 0.5 extraction (closed loop)
            → USER GATE: APPROVE | EDIT | SKIP [cat] | ABORT
Step 3    HUMANIZER rewrite (§1, 28 patterns) w/ critique as     [TASTE / model]
            constraint set + 6 rewrite constraints
            ─────────────────────────────────────────────────────────────────
Step 3.5  DETERMINISTIC SANITIZER  ◄── THE HANDOFF (§5 below)    [CODE / no model]
            → sanitize-copy.mjs on post-humanizer output
            → exit 0 = clean → emit polished_content
            → exit 1 = hard-fail → loop back to Step 3 humanizer with the violations
```

### The handoff contract (Step 3 humanizer → Step 3.5 sanitizer)

> Target: `scripts/lib/sanitize-copy.mjs`. Contract verified at `sanitize-copy.mjs:22-26, 385-521`. Detailed in the separate `gates/sanitizer-spec.md` artifact; summarized here so the humanizer-gate engineer knows the contract it must satisfy.

**Why the handoff exists (`humanizer/SKILL.md:116`):** the humanizer is a TASTE pass — it leaks code-detectable patterns ~5–15% (the Rhew ceiling, §1). The sanitizer is the DETERMINISTIC FLOOR that converts that leak to ~0% on the code-detectable subset. **The humanizer does NOT need to be perfect on patterns 7/13/17/18/19/20 — the sanitizer guarantees them.**

**Contract:**

```js
// CLI
node scripts/lib/sanitize-copy.mjs <file.md|-> [--json] [--em-dash-max N] [--register editorial|ads|sales]
//   exit 0 = clean (must be the gate's success condition)
//   exit 1 = hard-fail violations found (must be cleared → loop back to humanizer Step 3)

// Import
import { sanitizeCopy } from './lib/sanitize-copy.mjs';
const { pass, violations, warnings, stats } = sanitizeCopy(text, { register, emDashMax });
//   pass: boolean         (= violations.length === 0)
//   violations: Array     HARD-FAIL — must clear
//   warnings: Array       advisory heuristics (S1–S5 in non-editorial register)
//   stats: Object         { register, register_gated_active, ... }
```

**What the sanitizer HARD-FAILS on (`sanitize-copy.mjs:385-521`) — the code-detectable subset of the 28 patterns:**
1. **Em-dash density** > `--em-dash-max` per paragraph (default 1) — pattern 13.
2. **Curly quotes / smart punctuation** (U+201C/201D/2018/2019) — pattern 18.
3. **Kill-on-sight vocabulary** — parsed at RUNTIME from `anti-slop-universal.md` (stays in sync, no hardcoded drift; ~70 kill-words) — pattern 7.
4. **Banned exact phrases** (case-insensitive substrings, ALL registers; ~28 phrases) — patterns 19/22/24/25.
5. **Register-gated urgency/scarcity CTAs** ("act now", "limited time", etc., word-boundary matched) — **hard-fail ONLY under `--register editorial`**, silent for ads/sales/default. The code half of the DR Register Map.
6. **Structural slop S1–S5** — hard-fail under `--register editorial`, advisory WARN otherwise.
7. **Parallel-fragment stack (Pattern 10)** — surfaces as WARN.

**Register selection logic for the gate (Choir):**

```
register = org.brand_register   // seeded per-org from VOICE.md register field
IF register == "third-person-editorial" OR density == "editorial-restraint":
    run sanitizer with --register editorial   → S1–S5 + urgency CTAs become HARD-FAILS
ELSE (ads, sales, default):
    run sanitizer with default register        → S1–S5 + urgency CTAs are advisory WARN only
```

**The division of labor (engineer's mental model):**

| Layer | What it catches | How | Reliability |
|---|---|---|---|
| Step 0.5 forcing function | regression-to-mean (off-voice drafts) | model commits to 5 chars pre-draft | taste |
| Step 2.5 critique | all 13 categories incl. taste-only S6/S7 + 7 recurring families + voice-violations | model, VISIBLE to user, verbatim quotes | taste + human gate |
| Step 3 humanizer | the 28 patterns, "adding soul" toward ALIVE | model rewrite against critique constraints | taste (~85–95% on code-detectable) |
| **Step 3.5 sanitizer** | code-detectable subset (7/13/17/18/19/20/22 phrases + S1–S5 editorial + urgency CTAs) | **deterministic regex/grep, no model** | **~0% leak (the floor)** |

**S6, S7, and the 7 recurring families NEVER reach the sanitizer** — they are taste-only and die at Step 2.5. The sanitizer only enforces what regex can prove. If a build tries to mechanize S6/S7, that's a known dead-end (`anti-slop-universal.md:162`, `critique-pass-protocol.md:122`).

---

## Appendix A — Kill-on-Sight Vocabulary (full, for critique category E + sanitizer seed)

> Source: `.claude/voice-dna/_shared/anti-slop-universal.md:19-82`. **Layer: `global_library`** (seed table `kill_vocabulary` — the sanitizer parses this at runtime; seed it as the canonical source). `NEVER use → Use instead`:

**Verbs:** delve (into)→explore/examine/look at · leverage→use/apply/draw on · utilize→use · facilitate→help/enable/support · foster→encourage/support/develop · bolster→strengthen/support · underscore→stress/highlight · unveil→reveal/show/introduce · navigate→manage/handle/work through · streamline→simplify · enhance→improve/strengthen · endeavour→try/attempt · ascertain→find out/determine · elucidate→explain/clarify · garner→get/earn/attract · showcase→show/demonstrate/present

**Adjectives:** robust→strong/reliable/solid · comprehensive→complete/thorough/full · pivotal→key/critical · crucial→important/key · vital→important/essential · transformative→significant/major · cutting-edge→new/advanced · groundbreaking→new/original · innovative→new/original/creative · seamless→smooth/easy/effortless · intricate→complex/detailed · nuanced→subtle/complex · multifaceted→complex/varied · holistic→complete/whole · vibrant→lively/active/bright · enduring→lasting/long-standing

**Nouns/abstract terms (NEVER use):** landscape · tapestry · testament · interplay · paradigm · synergy · realm

**Transitions:** furthermore→also/and · moreover→also/and/besides · notwithstanding→despite/still · that being said→however/but/still · at its core→essentially/basically · it is worth noting that→(delete) · in the realm of→in/within · in the landscape of→in/within · in today's [anything]→(delete) · additionally→also/and/plus · Here's the thing:→(delete) · Here's why:→(delete) · Here's what's interesting:→(delete)

**Filler words to strip (`anti-slop-universal.md:234-239`):** absolutely, actually, basically, certainly, clearly, definitely, essentially, extremely, fundamentally, incredibly, interestingly, naturally, obviously, quite, really, significantly, simply, surely, truly, ultimately, undoubtedly, very. Plus: "in order to"→"to", "due to the fact that"→"because", "at this point in time"→"now".

## Appendix B — Banned Phrases (full, sanitizer ALL-register hard-fail seed)

> Source: `anti-slop-universal.md:172-211`. **Layer: `global_library`** (seed `banned_phrases`, category-tagged).

**Opening:** "In today's fast-paced world…" · "In today's digital age…" · "In an era of…" · "In the ever-evolving landscape of…" · "It's important to note that…" · "Let's delve into…" · "Imagine a world where…"
**Transitional:** "That being said…" · "With that in mind…" · "It's worth mentioning that…" · "To put it simply…" · "In essence…"
**Closing:** "In conclusion…" · "To sum up…" · "The future looks bright…" · "Exciting times ahead…" · "This is just the beginning…" · "The implications are staggering…" · "This changes everything…"
**Chatbot artifacts:** "I hope this helps" · "Of course!" · "Let me know if…" · "Here is a…" · "Great question!"
**Pseudo-profound:** "We're witnessing the emergence of…" · "The future of X is Y" · "Once you do X, Y feels wrong" · "After X, you'll never go back to Y"

## Appendix C — Register-Gated Phrases (sanitizer `--register editorial`-ONLY hard-fail)

> Source: `anti-slop-universal.md:214-231`. **Layer: `global_library`** (seed `register_gated_phrases`). Legitimate DR CTAs for ads/sales; off-register for editorial. Word-boundary matched ("act now" never fires inside "react now"). Silent for ads/sales/default register.

"act now" · "don't delay" · "before it's too late" · "last chance" · "limited time" · "limited-time" · "while supplies last" · "while stocks last" · "don't miss out" · "offer ends" · "offer expires"

---

## Net-New Flags (engineers must build; not in KB)

1. **Critique-pass 3-turn state machine + persistence** — the KB describes the workflow and output template but there is no executable critique service. Choir must build: draft-record state enum (`DRAFTED → CRITIQUED → APPROVED|EDITED|ABORTED → REWRITTEN`), critique-block persistence (teaching surface + audit trail + humanizer constraint set), and the `APPROVE|EDIT|SKIP|ABORT` gate handler.
2. **5-characteristic persistence + closed-loop wiring** — the protocol is a prompt; Choir must persist the Step 0.5 extraction on the draft and feed it to category L at Step 2.5 (the KB describes the loop, no code wires it).
3. **Per-content-type pass router** — the suppression/fire logic (critique fires for 5 types; 5-char fires for 5 types; LinkedIn carve-out suppresses pattern 10 + category C) is documented but scattered across 3 files; Choir needs one config table (seed `content_type_pass_matrix`).
4. **Slop/flat/ALIVE few-shot calibration loader** — the calibration table (`alive-without-slop.md:121-130`) must be ingested verbatim into a `slop_calibration_examples` seed and injected as the grader's few-shot anchor. No loader exists.
5. **Humanizer-vs-sanitizer loop-back controller** — on sanitizer exit 1, loop back to Step 3 with the violations; cap retries (KB does not specify a retry limit — net-new policy decision).
6. **Org `brand_register` field → sanitizer flag mapping** — the register-gating (`editorial` vs `ads`/`sales`/`default`) reads from `VOICE.md register:` in the KB; Choir must surface `orgs.brand_register` and map it to the sanitizer `--register` flag.
7. **Anti-over-correction guard enforcement** — the rule "the defect is the wrapper, not the fact; real numbers/names must survive verbatim" (`critique-pass-protocol.md:120`) is a prompt instruction with no mechanical check. Choir could add a fact-preservation diff (entities/numbers present in draft must persist in rewrite) — net-new.

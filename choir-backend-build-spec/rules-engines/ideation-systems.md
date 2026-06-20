# Choir Ideation / Strategy-Card / Calendar / Repurposing Engines — Backend Build Spec

> ENGINEER-READY. Every router, prompt, table, and threshold below is extracted verbatim from the KB. Build the backend directly from this. Deterministic logic is stated as implementable rules (enums, point values, pass/fail). LLM-prompt logic is given as exact prompt text + structured input/output contracts. Cite blocks trace to `path:line`.
>
> **Data-layer tagging convention (Choir 3-layer model):**
> - `global_library` = app-wide read-only seed DB (the 10 idea systems, the strategy-card router table, content-pillar definitions, the 14 repurposing methods, the calendar megaprompt skeleton). Engineers seed these once.
> - `orgs` = shared brand DNA: content pillars chosen for the org, ICP, personas, Wants/Results/Fears banks at org level.
> - `members` = per-member voice, prose samples, beliefs, and member-specific Wants/Results/Fears overrides (FK `org_id`).
>
> Where a piece of data is seed vs org-configured vs member-configured, it is tagged inline as `[LAYER: global_library | orgs | members]`.

---

## 0. Engine Map (what an engineer builds)

| # | Engine | Type | Source of truth |
|---|--------|------|-----------------|
| 1 | Idea-Systems catalog + Decision-Matrix Router | seed table + deterministic router | `linkedin-content-ideation-systems.md:84-456` |
| 2 | Wants/Results/Fears Expander | deterministic fan-out + LLM hook-write | `linkedin-target-audience-framework.md:70-181` |
| 3 | Content Pillars + Weekly Mix Rule | seed table + deterministic allocator | `linkedin-content-types-and-pillars.md:82-432` |
| 4 | Strategy-Card Router | deterministic decision table + LLM hook gen | `step-2-strategy.md:21-152` |
| 5 | Calendar Megaprompt | LLM prompt (verbatim) + deterministic post-validators | `linkedin-content-ai-prompts.md:76-166` |
| 6 | Repurposing Matrix Engine | deterministic router (lift, new-hook rule, cooldown) | `linkedin-content-repurposing.md:132-235` + `narrative-ingredient-to-asset-mapping.md:174-193` |

---

# ENGINE 1 — The 10 Idea Systems + Decision-Matrix Router

`[LAYER: global_library]` — Seed all 10 systems into a read-only `idea_systems` table. The router is deterministic config.
Source: `my-context-os/04-linkedin-content/strategy/linkedin-content-ideation-systems.md:84-456`

## 1.1 The 10 Idea Systems (seed table)

Each row = one `idea_systems` record. Engineers seed `id`, `name`, `inputs`, `outputs`, `when_to_use`, plus the structured sub-data noted.

### System 1 — Seven External Channels for Topic Discovery
- **id:** `seven-external-channels`
- **inputs:** niche/topic keyword; 20 min/week time budget; running idea list (storage)
- **outputs:** validated topic ideas logged to a running list
- **when_to_use:** "Want to stay on top of trends weekly" — ongoing discovery habit, 20 min/week (`:450`)
- **channels (seed sub-table, 7 rows)** (`:88-96`):
  1. AI-Powered Trend Tools (e.g. Taplio) — look for: trending topics in niche, algorithm-curated — tip: use free trial before subscribing
  2. YouTube Filtered Search — search topic, filter by view count to surface proven demand — tip: high-view videos confirm interest, adapt angle for LinkedIn
  3. Instagram & TikTok Hashtag Search — trending formats/visual angles — tip: watch for list/before-after/myth-busting format trends
  4. Quora Search — real questions in audience's own words — tip: the question phrasing itself often makes a strong hook
  5. Comment Sections — pain points, objections, follow-up questions under popular posts — tip: comments reveal what the post missed
  6. Twitter/X Advanced Search — recent high-engagement posts; Twemex surfaces a user's all-time best — tip: filter by minimum engagement
  7. Facebook Groups — active discussions, recurring frustrations — tip: especially strong for B2B niches
- **workflow rule** (`:98`): scan 2-3 channels/week, 20 min, log every viable idea. Idea-gen only; writing is separate.

### System 2 — Reddit & Forum Mining
- **id:** `reddit-forum-mining`
- **inputs:** niche; 3-5 active subreddits; Google search; search modifiers
- **outputs:** mindmap/spreadsheet of topics grouped by theme; keyword clusters → content pillars
- **when_to_use:** "Have a niche but need fresh angles" — surfaces real audience language and pain points (`:448`)
- **6-step process (deterministic checklist)** (`:108-113`):
  1. Identify 3-5 relevant subreddits (e.g. r/SaaS, r/marketing, r/startups)
  2. Google search inside them: `site:reddit.com/r/[subreddit] "how to"`
  3. Vary modifiers: "why", "when", "what", "best way to", "struggling with"
  4. Map results into mindmap/spreadsheet, group by theme ("getting started", "scaling", "common mistakes")
  5. Extract recurring keyword clusters → content pillars
  6. Build topical authority — plan clusters, not one-offs
- **also works for:** niche forums, Stack Overflow, Indie Hackers, GrowthHackers (`:117`)

### System 3 — Five-Prompt AI Content Strategy Workflow
- **id:** `five-prompt-ai-workflow`
- **inputs:** topic; browser-enabled AI (HARPA/Perplexity); ChatGPT
- **outputs:** polished content strategy (questions → themes → hooks → formats → optimized plan)
- **when_to_use:** "Have AI tools and want efficiency" — structured AI pipeline from research to strategy (`:451`)
- **5 prompts (seed ordered sub-table)** (`:128-133`):
  1. **Extract Questions** (browser AI) — browse Quora/Reddit, collect ONLY questions → 30-50 audience questions
  2. **Cluster into Themes** (browser AI/ChatGPT) → 5-8 thematic categories
  3. **Generate Hooks** (ChatGPT) — six angles: Recency, Celebrity, Proximity, Conflict, Unusual, Ongoing → 3-5 hooks/category (30-40 total)
  4. **Pair with Formats** (ChatGPT) — match each theme to List / Step-by-Step / Story / Mixed → calendar draft
  5. **Optimize** (ChatGPT) — optimize for engagement + "value per second" (max insight density, cut filler)
- **6 hook-angle definitions (seed enum + def)** (`:137-142`):
  - `recency`: tie to something happening right now (news, trend, launch)
  - `celebrity`: reference a well-known figure/brand the audience respects
  - `proximity`: make it feel close to the reader's daily reality
  - `conflict`: present tension between two ideas/approaches/beliefs
  - `unusual`: lead with something surprising or counterintuitive
  - `ongoing`: tap a persistent, unresolved repeating problem

### System 4 — 90-Day Content Library Builder
- **id:** `ninety-day-library`
- **inputs:** ONE specific audience + ONE specific outcome; 30 audience tasks
- **outputs:** 90 content pieces (30 tasks × 3 types)
- **when_to_use:** "Need a quarterly content plan" — pre-builds an entire quarter in one session (`:449`)
- **5-step process (deterministic)** (`:154-161`):
  1. Pick a specific audience + specific outcome (e.g. "B2B SaaS marketers trying to reduce CAC 30% in 6 months")
  2. List 30 tasks the audience must complete (full journey, current → desired state)
  3. Create 3 content types per task: **How-to** / **Why-to** / **Success story**
  4. Publish daily for 90 days (30×3=90). 5x/week = 18 weeks fallback
  5. Reshare + expand top performers
- **generation modes (enum)** (`:167-170`):
  - `detailed`: full outline per piece (hook, key points, CTA) — for near-ready drafts
  - `title_and_type_only`: 90 titles categorized by how-to / why-to / story — for writing from a topic list
- **key rule** (`:172`): 90-day library = 30 ideas × 3 angles, NOT 90 unique ideas

### System 5 — Knowledge Capture for Content & Monetization
- **id:** `knowledge-capture`
- **inputs:** last 2 weeks of calendar; recurring capture-cadence block
- **outputs:** library of captured knowledge assets (templates, frameworks, processes, checklists)
- **when_to_use:** "Already create knowledge but don't post" — extracts content from work you already do (`:452`)
- **3-step process** (`:180-209`):
  1. **Audit your calendar** — find every moment you created/shared knowledge (templates, frameworks explained on a call, processes documented, checklists, Slack/email advice)
  2. **Create a capture cadence** — recurring time block (example: Mon 1:45pm review calendar; Mon 2:15pm draft into standalone assets). Tie to existing habit.
  3. **Repurpose into recurring revenue** — package templates into products, frameworks into lead magnets, processes into series, checklists into mini-courses

### System 6 — Pillar-to-Hook Ideation Framework
- **id:** `pillar-to-hook`
- **inputs:** 3 foundation answers (expertise, audience, what you sell)
- **outputs:** 66+ hook directions (22 answers × 3 goal types) → full posts via framework
- **when_to_use:** "No ideas at all, starting from zero" — generates ideas from your own expertise without external research (`:447`) — **DEFAULT for cold-start**
- **5 phases** (`:217-276`):
  - **Phase 1 — Define pillars:** answer (1) What is your expertise? (2) Who is your audience? (3) What do you sell? — intersection = content territory
  - **Phase 2 — Define goals (3-row enum):**
    - `growth`: expand reach, attract followers — broad-resonance content, sparks shares
    - `authority`: demonstrate expertise, build trust — deep knowledge, original thinking
    - `sales`: address buyer pain, drive action — speak to ICP frustrations, present solution
  - **Phase 3 — Ask 22 systematic questions** (seed bank; 8 named examples at `:239-246`): What stories can I tell from my work? / What do clients consistently tell me? / What myths persist in my industry? / What can I reveal about how I actually work? / What unpopular opinions do I hold? / What mistakes do beginners make? / What would I tell my past self? / What frameworks do I use daily?
  - **Phase 4 — Generate hooks** per answer, one per goal (growth/authority/sales). Example (`:254-257`): answer "Most companies waste 80% of content budget on net-new creation" → growth: "80% of your content budget is wasted. Here's the math." / authority: "After managing $2M in content spend across 12 clients, I found the same mistake everywhere." / sales: "Your content team creates 5 posts/week. Only 1 matters. We fix that ratio."
  - **Phase 5 — Select content framework (seed enum, 4+2):**
    - `PAIS`: Pain, Agitate, Ideal Situation, Solution — problem-aware audiences
    - `zero_to_hero`: Starting point, struggle, turning point, result — transformation stories
    - `carousel_6_slide`: Title, Problem, 3 Solution Slides, CTA — visual learners
    - `cheat_sheet`: one topic, 2 fonts max, 2-3 colors — high save/bookmark
    - `future_pacing`: paint life after implementing the advice
    - `AIDA`: Attention, Interest, Desire, Action
- **scale math** (`:259`): 22 answers × 3 goals = 66 hook directions per brainstorm

### System 7 — Reverse Engineer Other Creators
- **id:** `reverse-engineer-creators`
- **inputs:** admired creators' posts
- **outputs:** structural templates (headline / body / CTA) to fill with own copy
- **when_to_use:** "Want to learn from other creators" — structured pattern extraction (`:453`)
- **3 steps** (`:284-312`):
  1. Study headline structures — # lines, white space, "see more" trigger → make a template, insert own copy
  2. Study the post body — detail level, formatting, white space; watch for "Way/x" point markers, bullets, context per point
  3. Study CTAs — what action, where placed, how simple (key = simplicity)

### System 8 — Build-in-Public Content Mining
- **id:** `build-in-public`
- **inputs:** your entrepreneurial journey events
- **outputs:** posts from events/feedback/reflection/fears/decisions
- **when_to_use:** "Building something and need content" — turns events/feedback/fears/decisions into posts (`:454`); best for founders/solopreneurs
- **5 content-mining categories (seed sub-table with prompts)** (`:324-354`):
  - `events`: Was it unexpected? What did you expect? Were you prepared? Did things work out as planned?
  - `feedback`: Great feedback — how felt, what to do? Soul-crushing criticism — how right, will you change? Getting enough?
  - `reflection`: Breakthrough thought — where/trigger/what changes? Invalidated assumption — what was it, why invalid?
  - `fears`: Wrongful assumption unwilling to question? Should be doing but aren't? Biggest risk to business? Should be more public about?
  - `decisions`: What decisions made/making? Why/what motivates? What observed after?

### System 9 — Strategic Narrative Positioning
- **id:** `strategic-narrative`
- **inputs:** 6 positioning questions answered
- **outputs:** central narrative doc (positioning, messaging) = content foundation
- **when_to_use:** "Need a content foundation before writing" — defines POV, ensures cohesion (`:455`)
- **6 positioning questions (seed bank)** (`:377-382`):
  1. What is wrong in your industry today? What's the solution?
  2. What are competitors doing wrong? What's the solution?
  3. What are customers doing wrong? What's the solution?
  4. What are customers' biggest pain points? What's the solution?
  5. What myths, lies, misconceptions exist in your realm?
  6. Expand — stronger/more controversial (within reason) the better
- **execution rules** (`:384-389`): brain dump first; quantity → quality; best POVs tie to product; punchy > polished
- **feeds:** output → System 6 Phase 3 raw material (`:398`)

### System 10 — Data-Driven Corpus Analysis (Lookalike Content)
- **id:** `corpus-analysis`
- **inputs:** existing content corpus with engagement data (~20+ posts minimum)
- **outputs:** 10-section Winning Content Profile + 10 data-matched ideas
- **when_to_use:** "Have content data, want to find what works" — quantitative performance analysis (`:456`)
- **3-phase process** (`:410-414`):
  1. **ANALYSE** — normalize data, compute **TWE score = likes + 2×comments + 4×shares**, segment top/bottom 30%, analyze 7 dimensions
  2. **PROFILE** — 10-section Winning Content Profile + negative patterns (anti-patterns from bottom 30%) + 7-point testable checklist
  3. **GENERATE** — research trends (Exa), filter through 5 perf criteria, produce 10 data-matched ideas
- **7 performance dimensions (seed enum)** (`:418-424`): Topic/Theme, Format/Structure, Hook Style, Content Length, Posting Time, Engagement Type, Audience Segment
- **TWE formula (deterministic — implement exactly):** `TWE = likes + (2 * comments) + (4 * shares)` (`:412`)
- **top/bottom 30% technique** (`:428`): the delta between top-30% and bottom-30% patterns is the actionable insight

## 1.2 Decision-Matrix Router (deterministic)

`[LAYER: global_library]` — Config lookup. Input = situation key; output = system id + rationale. Source: `linkedin-content-ideation-systems.md:445-456`

```json
{
  "ideation_decision_matrix": [
    { "situation": "no_ideas_starting_from_zero",    "system_id": "pillar-to-hook",        "why": "Generates ideas from your own expertise without external research" },
    { "situation": "have_niche_need_fresh_angles",   "system_id": "reddit-forum-mining",   "why": "Surfaces real audience language and pain points" },
    { "situation": "need_quarterly_plan",            "system_id": "ninety-day-library",    "why": "Pre-builds an entire quarter in one session" },
    { "situation": "stay_on_trends_weekly",          "system_id": "seven-external-channels","why": "Ongoing discovery habit, 20 min/week" },
    { "situation": "have_ai_tools_want_efficiency",  "system_id": "five-prompt-ai-workflow","why": "Structured AI pipeline from research to strategy" },
    { "situation": "create_knowledge_dont_post",     "system_id": "knowledge-capture",     "why": "Extracts content from work you already do" },
    { "situation": "want_to_learn_from_creators",    "system_id": "reverse-engineer-creators","why": "Structured approach to extracting patterns from admired creators" },
    { "situation": "building_something_need_content", "system_id": "build-in-public",       "why": "Turns events, feedback, fears, decisions into posts" },
    { "situation": "need_foundation_before_writing", "system_id": "strategic-narrative",   "why": "Defines your POV and ensures content cohesion" },
    { "situation": "have_data_want_what_works",      "system_id": "corpus-analysis",       "why": "Quantitative analysis of existing content performance" }
  ]
}
```

**Router function signature (deterministic):**
```
routeIdeaSystem(situation: SituationEnum) -> { system_id: string, why: string }
```
Fallback when no situation supplied: `pillar-to-hook` (cold-start default — the only system needing zero external input).

**Integration edges (build as `idea_system_feeds` graph)** (`:398, :439`):
- `strategic-narrative` → feeds `pillar-to-hook` Phase 3 (narrative answers become raw material)
- `corpus-analysis` output (Winning Content Profile) → feeds `five-prompt-ai-workflow`, `pillar-to-hook`, `strategic-narrative` as validated constraint data

---

# ENGINE 2 — Wants/Results/Fears Expander

`[LAYER: orgs for shared banks; members for per-member overrides]`
Source: `my-context-os/04-linkedin-content/strategy/linkedin-target-audience-framework.md:70-181`

## 2.1 Core expansion logic (deterministic fan-out)

The expander takes **3 input buckets** and fans each to **5 entries**, then expands each entry to N angles.

**Inputs (3 buckets, 5 each = 15 seeds):** (`:74-78`)
- `wants[5]` — 5 Wants the ideal client has
- `results[5]` — 5 Results they're trying to achieve
- `fears[5]` — 5 Fears that hold them back

**Exact expansion math (engineer must implement this fan-out):**
- Minimum: 15 seeds (3 buckets × 5) → 15 post angles (one post per seed). This is the documented baseline: "Now turn each into a post." (`:78`)
- Maximum: 15 seeds × up to 5 hook variants each = **up to 75 angles**. The 5 variants per seed come from applying the 5 documented hook-emotion lenses below.

**Deterministic seed → angle rule:** for each of the 15 seeds, generate post hooks using the bucket-specific template. The KB ships worked example hooks for all 15 seed positions (5 per bucket) — seed these as `[LAYER: global_library]` example banks and use as few-shot exemplars.

## 2.2 The Post Generation Formula (deterministic combinator)

(`:86-90`)
```
post_idea = ideal_client_frustration + your_framework
```
Rationale: combines empathy (their pain) with authority (your solution). Implement as a join: each frustration row × the org/member's framework → 1+ post idea.

## 2.3 Seed example banks (seed as few-shot exemplars) `[LAYER: global_library]`

**From WANTS (`:98-104`):**
| Want | Post Hook |
|------|-----------|
| Spend less time writing posts | "Spend 70% less time on creating high-quality posts with this strategy:" |
| Get more inbound leads | "The 5-Step Framework I used to get from 0 clients to 3 inbound leads PER DAY in 7 months:" |
| Grow audience faster | "I grew from 0 to [number] followers in [timeframe]. Here's the exact system:" |
| Better content ideas | "Never run out of LinkedIn post ideas again. Use this 15-minute weekly exercise:" |
| More engagement | "My posts used to get 5 likes. Now they average 500. The only thing I changed:" |

**From RESULTS (`:108-114`):**
| Result | Post Hook |
|--------|-----------|
| Generated inbound leads | "From cold outreach to 3 inbound leads/day. Here's what shifted:" |
| Landed dream clients | "I stopped chasing clients. They started chasing me. Here's how:" |
| Built authority in niche | "6 months ago nobody knew my name. Now I get DMs from [industry] leaders:" |
| Grew revenue | "LinkedIn drove $[X] in revenue last quarter. Zero ad spend. Here's the playbook:" |
| Saved time on content | "I create a week's worth of LinkedIn content in 2 hours. Here's the system:" |

**From FEARS (`:118-124`):**
| Fear | Post Hook |
|------|-----------|
| Fear of posting | "Want to start posting, but afraid of what people might think?" |
| Fear of being judged | "I was terrified of posting on LinkedIn. Then I realized nobody cares about your mistakes." |
| Fear of no engagement | "What if I post and nobody likes it? Here's why that fear is holding you back:" |
| Fear of being wrong | "I posted something wrong last week. Here's what happened next (it wasn't what I expected):" |
| Fear of wasting time | "Is LinkedIn worth your time? Here's the math I did before committing:" |

## 2.4 Frustration Mapping Template (deterministic 3-column join) `[LAYER: orgs]`

(`:130-148`) — store as `frustration_map` rows (org-level, members can add). 10-row default capacity.
```
columns: their_frustration -> your_solution -> content_topic
rule: col1 (frustration heard from clients/prospects/audience)
      col2 (how you specifically address it)
      col3 = content backlog (each row >= 1 post, often multiple)
```
Seed examples (`:134-138`):
- "spending 5+ hours/week figuring out what to write" → "content calendar framework" → "How I plan a month of posts in 30 minutes"
- "writing without getting inbound leads" → "lead magnet system" → "Why your posts get likes but no leads"
- "lack of clear content strategy" → "pillar-based planning" → "The 4 content pillars that drive revenue"

## 2.5 Audience Targeting Exercise (deterministic pattern-finder) `[LAYER: orgs]`

(`:154-180`) — for org onboarding when audience is undefined.
1. List everyone who has enquired (name + demographic)
2. Find the pattern (mode of demographic) — deterministic: `argmax(count by demographic)`
3. Commit to ONE audience (highest-count wins)
- **Documented outcome benchmark (store as motivating stat):** before exercise = 5 inbound leads/month avg; after = 28 inbound leads/month avg (`:177-178`)

## 2.6 LLM step (hook writing)

The fan-out (which seed → which template) is deterministic. The actual hook copy generation is an LLM step that takes: the seed (want/result/fear text) + org pillars + member voice + the bucket's exemplar bank (few-shot) → produces a polished hook. Hand off written hooks to the Strategy-Card Router (Engine 4) or content pipeline.

---

# ENGINE 3 — Content Pillars + Weekly Mix Rule

`[LAYER: global_library for definitions + matrix; orgs for the chosen pillar set]`
Source: `my-context-os/04-linkedin-content/strategy/linkedin-content-types-and-pillars.md:82-432`

## 3.1 The 4 Content Pillars (seed enum + definitions)

(`:82-148`)
```json
{
  "pillars": [
    { "id": "synthesis",   "name": "Synthesis",
      "what": "Your own unique take, opinion, insights — a distinctive voice/perspective on domain topics",
      "why": "Demonstrates thought leadership; you process & connect, not just consume",
      "best_post_types": ["opinion", "framework", "lesson"] },
    { "id": "access",      "name": "Access",
      "what": "Sharing a valuable resource — making hidden knowledge/tools/databases/contacts accessible",
      "why": "Highest engagement; immediate tangible value; people save & share",
      "best_post_types": ["template", "step_by_step", "example"] },
    { "id": "contrarian",  "name": "Contrarian",
      "what": "Opposing/dissenting thoughts; challenging status quo with experience-backed unpopular opinions",
      "why": "Sparks debate, drives comments, positions you as independent thinker",
      "best_post_types": ["opinion", "mistake", "story"] },
    { "id": "simplifying", "name": "Simplifying",
      "what": "Organizing complex info into digestible formats: infographics, cheat sheets, lists, frameworks, step-by-step",
      "why": "Highest save/share rate; turns confusion into clarity; becomes reference material",
      "best_post_types": ["step_by_step", "framework", "template"] }
  ]
}
```

## 3.2 The 10 Post Types (seed enum, with structure templates)

(`:152-226`) — seed as `post_types`:
```json
{
  "post_types": [
    { "id": "step_by_step", "format": "Sequential tutorial (numbered steps)",
      "when": "Teaching a process, workflow, or methodology",
      "structure": "Problem statement -> Step 1 -> Step 2 -> ... -> Result",
      "pillar_fit": ["simplifying", "access"] },
    { "id": "opinion", "format": "A clear stance on a topic with reasoning",
      "when": "You have a strong perspective backed by experience",
      "structure": "Bold claim -> Context/evidence -> Why this matters -> Invite discussion",
      "pillar_fit": ["contrarian", "synthesis"] },
    { "id": "story", "format": "Narrative with a lesson embedded",
      "when": "Sharing a personal/professional experience that teaches something",
      "structure": "Setting -> Challenge -> Action -> Outcome -> Lesson",
      "pillar_fit": ["synthesis", "contrarian"] },
    { "id": "case_study", "format": "Results from real work with specifics",
      "when": "You have concrete outcomes (numbers, before/after, client results)",
      "structure": "Context -> Challenge -> What we did -> Results -> Key takeaway",
      "pillar_fit": ["synthesis", "access"] },
    { "id": "framework", "format": "A system, methodology, or mental model",
      "when": "You have a repeatable approach to solve a problem",
      "structure": "Problem -> Why existing approaches fail -> Your framework (named) -> How to apply it",
      "pillar_fit": ["simplifying", "synthesis"] },
    { "id": "example", "format": "Concrete illustration of a concept",
      "when": "Making an abstract idea tangible",
      "structure": "Concept -> Specific example -> Why it works -> How to replicate",
      "pillar_fit": ["simplifying", "access"] },
    { "id": "template", "format": "Fill-in-the-blank resource or swipe file",
      "when": "Providing a ready-to-use starting point that saves time",
      "structure": "Problem -> Template preview -> How to use it -> CTA (DM for full template)",
      "pillar_fit": ["access", "simplifying"] },
    { "id": "lesson", "format": "What you learned from a specific experience",
      "when": "A recent experience taught you something valuable",
      "structure": "Situation -> What happened -> What I learned -> How you can apply this",
      "pillar_fit": ["synthesis", "contrarian"] },
    { "id": "benefit", "format": "Value proposition or outcome-focused post",
      "when": "Highlighting benefits of a tool/approach/decision",
      "structure": "Before state -> After state -> How to achieve the transformation",
      "pillar_fit": ["simplifying", "access"] },
    { "id": "mistake", "format": "What went wrong and how to fix/avoid it",
      "when": "You made an error and learned from it (vulnerability builds trust)",
      "structure": "What I did wrong -> The consequences -> What I should have done -> Lesson for you",
      "pillar_fit": ["contrarian", "synthesis"] }
  ]
}
```

## 3.3 Pillar × Type Matrix (deterministic fit lookup)

(`:411-424`) — `**` = primary fit (weight 2), `*` = secondary fit (weight 1), blank = no fit (0). Seed as `pillar_type_fit`:
```json
{
  "pillar_type_fit": {
    "step_by_step": { "synthesis": 0, "access": 1, "contrarian": 0, "simplifying": 2 },
    "opinion":      { "synthesis": 2, "access": 0, "contrarian": 2, "simplifying": 0 },
    "story":        { "synthesis": 2, "access": 0, "contrarian": 1, "simplifying": 0 },
    "case_study":   { "synthesis": 2, "access": 1, "contrarian": 0, "simplifying": 0 },
    "framework":    { "synthesis": 1, "access": 0, "contrarian": 0, "simplifying": 2 },
    "example":      { "synthesis": 0, "access": 2, "contrarian": 0, "simplifying": 1 },
    "template":     { "synthesis": 0, "access": 2, "contrarian": 0, "simplifying": 1 },
    "lesson":       { "synthesis": 2, "access": 0, "contrarian": 1, "simplifying": 0 },
    "benefit":      { "synthesis": 0, "access": 1, "contrarian": 0, "simplifying": 2 },
    "mistake":      { "synthesis": 1, "access": 0, "contrarian": 2, "simplifying": 0 }
  }
}
```
Use: `bestPillarForType(type) = argmax(weight)`; `validTypesForPillar(pillar) = types where weight >= 1`.

## 3.4 Weekly Mix Rule (DETERMINISTIC allocator — primary)

This is the load-bearing rule from the task. Two sources agree; encode BOTH and reconcile.

**Source A — Recommended Weekly Content Mix, 5 posts/week** (`:426-432`):
```
2 posts: Simplifying OR Access (high-save, high-share)
1 post:  Synthesis (thought leadership)
1 post:  Contrarian (engagement driver)
1 post:  Rotate based on what's working
```

**Source B — Calendar megaprompt built-in per-week mix** (`linkedin-content-ai-prompts.md:156-159`):
```
1 promotional post (testimonial, case study, or service details)
1 unique resource (cheat sheet, checklist, template, etc.)
3 organic value posts aligned to pillars
```

**Reconciled deterministic weekly allocator (engineer implements this exactly):**
```
WEEKLY_MIX (5 posts/week):
  slot_1: pillar in {simplifying, access}   role: value/high-save
  slot_2: pillar in {simplifying, access}   role: value/high-save   <- this is the "unique resource" slot (template/checklist/cheat-sheet) [Source B]
  slot_3: pillar = synthesis                 role: thought-leadership
  slot_4: pillar = contrarian                role: engagement-driver
  slot_5: pillar = ANY                        role: PROMO (testimonial/case-study/service) OR rotate-on-performance [Source A "rotate" == Source B "promo"]

INVARIANTS (deterministic validators):
  - exactly 1 promo post per week (>=1 per Source B). promo allowed in slot_5.
  - exactly 1 resource/lead-magnet post per week (slot_2).
  - >=3 organic value posts (slots 1-4 minus promo).
  - all 5 posts map to >=1 pillar.
  - cycle through all 4 pillars across the calendar (healthy mix invariant, :84).
```

**Anti-patterns (deterministic guardrails — block/warn)** (`:487-494`):
- WARN/BLOCK daily posting: "Posting daily often cannibalizes post reach and engagement. Quality > frequency." Daily dilutes quality/authority, causes audience exhaustion, reduces perceived value (scarcity creates demand).
- Do NOT funnel to newsletters/email/Gumroad as first step — higher-value clients find friction in nurture; aim for real-time interactions (calls, DMs).
- Do NOT pigeonhole in carousels only — format fatigue is real.
- Do NOT overdo hooks — gimmicky if overall quality is low.

## 3.5 TOFU/MOFU/BOFU Funnel Mapping (seed enum) `[LAYER: global_library]`

(`:436-485`) — store as `funnel_stages` for content-stage tagging:
```json
{
  "funnel_stages": [
    { "id": "tofu", "goal": "Gain attention, generate traffic, reach max people",
      "audience": ["problem_unaware", "problem_aware"],
      "format_topics": ["journey & personal stories", "opinions & polarizing content", "storytelling"],
      "pillar_fit": ["synthesis", "contrarian"] },
    { "id": "mofu", "goal": "Establish authority/competence; reach ICP decision tree",
      "audience": ["solution_aware"],
      "format_topics": ["success metrics & case studies", "behind the scenes", "expert tips", "long-form video", "industry insights", "answering common questions", "market trends & tools"],
      "pillar_fit": ["simplifying", "access", "synthesis"] },
    { "id": "bofu", "goal": "Get them into DMs; convert to meeting/call",
      "audience": ["product_aware"],
      "format_topics": ["full playbook/process", "testimonials & hand-raisers", "urgent CTAs & deals", "free 15-min call offers", "service comparisons", "Loom demos", "how-tos tied to your methodology"],
      "pillar_fit": ["access", "simplifying"] }
  ]
}
```

## 3.6 7 Lazy-Effective Formats + 30 Visual Types (seed reference) `[LAYER: global_library]`

These are reference catalogs (not router logic) — seed for the editor's "format picker" UI.

**7 Lazy-Effective Formats** (`:230-326`): `internal_presentations` (very low effort), `workshop_meeting_notes` (very low), `faqs` (very low — keep a running backlog of client questions), `employee_boost` (low — needs employee buy-in, hardest), `add_your_take` (low — repost with credit + substantial original commentary), `call_out_bs` (low — challenge ideas not individuals), `update_old_posts` (low — revisit 3+ month posts).

**30 Visual Types** (`:329-404`) — seed `visual_types` with `{id, name, description, when_to_use}`, grouped by category:
- Data & Information: 1 Infographics, 2 Slides/Carousels, 7 Charts/Data Viz
- Repurposed: 3 Quote Graphics, 4 Tweetshots, 5 Podcast Clips
- Stock/Photography: 6 Stock Photos, 11 Lifestyle Images, 19 Selfies, 21 Work Set-up Images
- Humor/Entertainment: 8 Memes, 9 GIFs, 13 Comic Strips
- Social Proof/Authority: 12 Employee Spotlights, 16 Testimonial Graphics, 17 Branded Assets, 18 Images of Influential Figures
- Behind-the-Scenes: 14 LinkedIn Screenshots, 15 Company Culture Images, 20 Slack Screenshots, 22 Analytics Screenshots, 27 Behind-the-Scenes Pictures
- Video/Live: 23 Tutorial Videos, 29 Vlogs, 30 Live Streams
- Events/Product: 10 Event Announcements, 24 Event Highlights, 25 Zoom Screenshots, 26 Product Images, 28 Media Highlights

---

# ENGINE 4 — Strategy-Card Router

`[LAYER: global_library for the router tables; output is a per-post member-level record]`
Source: `.claude/agents/linkedin-content-steps/step-2-strategy.md:21-152`

The strategy card runs an 8-step decision sequence. Steps 1-5,7 are **deterministic table lookups**; step 6 is an **LLM hook-gen call**. The card is gated on user approval.

## 4.1 Message-type → Post-type mapping (DETERMINISTIC router table)

(`:36-42`) — the core table the task asks for. Seed as `message_type_to_post_type`:
```json
{
  "message_type_to_post_type": {
    "experience":  ["lesson", "case_study", "story"],
    "knowledge":   ["step_by_step", "framework", "example"],
    "opinion":     ["opinion", "mistake"],
    "observation": ["opinion", "story"],
    "result":      ["case_study", "benefit"],
    "question":    ["opinion", "story"]
  }
}
```
> NOTE: source labels the targets with the agent's vocabulary ("How-To, Framework, Explainer"; "Hot Take, Contrarian"; "Pattern, Trend Analysis"; "Data Share"; "Engagement Post, Discussion Starter"). These are normalized above to the canonical 10 post-type enum (Engine 3.2). Keep the human-readable labels as `display_name` aliases. Verbatim source mappings (`:37-42`):
> - `experience` → Lesson Learned, Case Study, Story
> - `knowledge` → How-To, Framework, Explainer
> - `opinion` → Hot Take, Contrarian
> - `observation` → Pattern, Trend Analysis
> - `result` → Case Study, Data Share
> - `question` → Engagement Post, Discussion Starter

## 4.2 Pillar selector (DETERMINISTIC) — match message-type + emotional-core to pillar

(`:25-32`):
```json
{
  "pillar_selection_guide": {
    "synthesis":   "Connecting dots across fields, unique combinations",
    "access":      "Behind-the-scenes, insider perspective, exclusive knowledge",
    "contrarian":  "Challenging conventional wisdom, hot takes, unpopular opinions",
    "simplifying": "Making complex things simple, frameworks, step-by-step"
  }
}
```
Rule (`:32`): match extracted message-type + emotional core to best pillar; cross-check against Pillar×Type Matrix (Engine 3.3) for the post-type's fit.

## 4.3 Format selector (DETERMINISTIC rule cascade — the :94-113 format rules)

(`:44-50`) — Default = text post. Apply first matching condition:
```
FORMAT_RULES (evaluate top-down, first match wins):
  IF educational content with 3+ distinct points/steps -> carousel
  ELSE IF offering a free resource/template/guide       -> lead_magnet
  ELSE IF visual data/comparison/process                -> infographit (infographic post)
  ELSE                                                  -> text   (DEFAULT)

REPURPOSE OVERRIDE:
  IF repurposing AND original_format == candidate_format -> suggest a DIFFERENT format
```
Format enum (from step-2 output schema `:142`): `text | carousel | lead_magnet | infographic`

## 4.4 Framework selector (DETERMINISTIC default + conditional)

(`:53-59`):
```json
{
  "framework_selection": {
    "default": "PAIPS",
    "rules": [
      { "framework": "PAIPS", "expansion": "Problem-Agitate-Insight-Proof-Solution", "when": "default for most posts" },
      { "framework": "AIDA",  "expansion": "Attention-Interest-Desire-Action",        "when": "product/launch announcements" },
      { "framework": "PAS",   "expansion": "Problem-Agitate-Solve",                    "when": "pain-focused posts" },
      { "framework": "BAB",   "expansion": "Before-After-Bridge",                      "when": "transformation stories" },
      { "framework": "StoryLead", "expansion": "story opener -> lesson",               "when": "experience/lesson posts" }
    ]
  }
}
```

## 4.5 Hook-type selector (DETERMINISTIC emotional-core → hook-type)

(`:61-69`) — 12 emotional types live in the hooks playbook (separate seed DB); the mapping from emotional core is:
```json
{
  "emotional_core_to_hook_type": {
    "frustration":      ["contrarian_hook", "pattern_interrupt"],
    "surprise":         ["curiosity_gap", "counter_intuitive"],
    "pride":            ["achievement", "social_proof"],
    "curiosity":        ["open_loop", "question"],
    "contrarian_energy":["myth_busting", "hot_take"],
    "empathy":          ["vulnerability", "shared_struggle"]
  }
}
```

## 4.6 Hook generation (LLM step — generate 3 candidates)

(`:71-78`) — the only non-deterministic core step. Apply **WHAT + WHO + WHY** formula:
- **WHAT:** the specific insight/claim
- **WHO:** the audience who cares
- **WHY:** why it matters now
Rules: 3 candidates, each a different angle; vary style across {question, statement, number, story-opener}.

## 4.7 Psychology lever selector (DETERMINISTIC enum, 9 options)

(`:80-82`): `social_proof | scarcity | authority | reciprocity | consistency | liking | unity | loss_aversion | curiosity_gap`. Select most relevant to message.

## 4.8 Target audience + desired action (DETERMINISTIC enum for action)

(`:84-86`): refine audience from extracted pain point. `desired_action` enum: `comment | save | share | dm | click_link` (the ONE thing the reader should do).

## 4.9 Strategy-Card output contract (verbatim presentation format) `[LAYER: members]`

Present this EXACT format to the user (`:94-114`):
```
## STRATEGY CARD

**Core Message:** [distilled insight from Step 1]

**Pillar:** [X] | **Type:** [X] | **Format:** [X]
**Framework:** [X -- 1-line rationale]
**Hook Type:** [X emotion]
**Psychology:** [X -- why this lever]

**3 Hook Candidates:**
1. [Hook A]
2. [Hook B]
3. [Hook C]

**Target:** [specific persona]
**Action:** [what reader should do]
**Length:** [character range estimate]

Approve? Or tell me what to change.
```

**Persisted JSON schema (verbatim from `:136-152`):**
```json
{
  "core_message": "string",
  "pillar": "synthesis | access | contrarian | simplifying",
  "post_type": "string",
  "format": "text | carousel | lead_magnet | infographic",
  "framework": "string",
  "hook_type": "string",
  "selected_hook": "string",
  "all_hooks": ["string", "string", "string"],
  "psychology_lever": "string",
  "target_audience": "string",
  "desired_action": "string",
  "estimated_length": "string",
  "user_approved": true
}
```

## 4.10 HARD GATE (deterministic state machine)

(`:118-127, :154-157`):
- Do NOT proceed to writing (Step 3) without explicit `user_approved == true`.
- On change request: revise card inline (do NOT re-run extraction), re-present, wait for approval again.
- If user picks a specific hook → set `selected_hook`. If user says "go" → default to hook #1.
- On non-approval: set `status: "gate_failed"`, preserve strategy data for revision.

---

# ENGINE 5 — Content Calendar Megaprompt (VERBATIM)

`[LAYER: global_library for the prompt skeleton; runtime fields filled from orgs + members]`
Source: `my-context-os/06-ai-tooling/prompts/linkedin-content-ai-prompts.md:76-166`

**Source attribution:** Matthew Lakajev (generalized). **Purpose:** generate a full 4-week Mon-Fri LinkedIn content plan in table format. **Output:** table — Week-Day | Pillar | Topic | Approach | Content Type.

## 5.1 The prompt — VERBATIM (store exactly, fill bracketed fields at runtime)

(`:81-139`)
```text
Act like an AI content strategist with expertise in creating a detailed and customized
content plan for LinkedIn. You must consider the following provided information about my
role, industry, and audience, and use it to develop a four-week LinkedIn content plan for
Monday to Friday. This plan should strategically leverage the provided content pillars,
resonate with my audience, and be delivered in the preferred content types, with each post
containing a detailed breakdown of approach and content specifics.

About Me: [YOUR ROLE at YOUR COMPANY - describe what you help your audience do. List
topics you're knowledgeable about, separated by commas.]

About My Audience: [YOUR TARGET AUDIENCE ROLES]
Industry: [YOUR INDUSTRY/INDUSTRIES]

Pain Points: [Describe 2-3 key pain points your audience faces. Be specific about their
current struggles and what's not working for them.]

Fears: [Describe what keeps your audience up at night -- concerns about their future,
competitive threats, market changes they're worried about.]

Needs: [Describe what your audience needs to achieve -- the outcomes they want, the
stability they seek, and how they want to feel.]

My Content Pillars:
[PILLAR 1: e.g., "The art of writing engaging newsletters"]
[PILLAR 2: e.g., "Strategies for high-conversion copy"]
[PILLAR 3: e.g., "Successful case studies"]

Content Types I Want to Create:
[LIST YOUR PREFERRED FORMATS: text posts, image posts, PDF/carousel posts, video, polls, etc.]

The content plan should comprise five posts per week (Monday-Friday) for four weeks,
clearly aligning with one of the content pillars. The plan should be in the form of a table
with the columns: Week - Day, Pillar, Topic, Approach, and Content Type.

In 'Approach', explain the angle or perspective the post will take on the Topic in detail.
It can be an educational overview, a how-to guide, sharing personal insights, a hot take,
real-life case study, addressing misconceptions and mistakes, discussing myths, presenting
statistical data, addressing audience fears, problem-solution framework, or a before-and-
after transformation. For example, if it's an educational post, outline the specific points
or steps the content will cover. If it's a myth debunking post, specify the myth and
provide an explanation or evidence to dispel it.

In 'Content Type', don't just specify the format (e.g., text, image, PDF, carousel), but
also detail what the content will include. For instance, if the content type is an image,
explain what the image should depict or if it's a PDF, outline what information it should
contain.

Include at least one promotional post per week, such as testimonials, case studies, or
details about services. Also, provide one unique additional resource per week as part of one
of the content pillars. Separate from the promo post. This resource could be a cheat sheet,
checklist, Excel sheet, etc., to provide added value to my audience. Incorporate this
resource in the 'Content Type' column.

Use your content strategy expertise to craft an advanced LinkedIn Content Plan that
maximizes engagement with my target audience, enhances my brand visibility, and helps me
become a thought leader in my industry. In case the provided information needs more context,
feel free to ask for clarifications.
```

## 5.2 Runtime input contract (map Choir fields → bracketed slots)

| Prompt slot | Choir source | Layer |
|-------------|--------------|-------|
| `About Me` (role + company + topics) | member profile + org | members + orgs |
| `About My Audience` | org ICP / personas | orgs |
| `Industry` | org | orgs |
| `Pain Points` (2-3) | org ICP pain bank / Engine 2 frustrations | orgs |
| `Fears` | Engine 2 `fears[5]` | orgs/members |
| `Needs` | Engine 2 `wants[5]`/`results[5]` | orgs/members |
| `My Content Pillars` | org chosen pillars (Engine 3.1) | orgs |
| `Content Types I Want to Create` | member format preferences | members |

## 5.3 Output contract + deterministic post-validators

**Output table columns** (`:114, :141`): `Week-Day | Pillar | Topic | Approach | Content Type`. Parse into 20 rows (4 weeks × 5 days).

**Approach enum (validate each row's Approach ∈)** (`:118-122, :143-154`):
`educational_overview | how_to_guide | personal_insights | hot_take | real_life_case_study | addressing_misconceptions_mistakes | discussing_myths | statistical_data | addressing_audience_fears | problem_solution_framework | before_after_transformation`

**Built-in per-week mix (DETERMINISTIC validators — enforce on parsed output)** (`:129-133, :156-159`):
```
PER_WEEK_INVARIANTS (run on each 5-row week):
  - >=1 promotional post (testimonial | case_study | service_details)
  - exactly 1 unique resource (cheat_sheet | checklist | excel/template) — SEPARATE from the promo
  - 3 organic value posts aligned to pillars
  - all 5 rows map to one of the org's content pillars
MONTH_INVARIANTS (run on all 20 rows):
  - Approach variety: NOT all rows the same Approach (warn if any single approach > 40% of rows) (:164)
```

**Usage rules (apply pre-send)** (`:162-165`): fill ALL bracketed fields before sending (specificity → quality); user pillars override the default 4 (just list own); after generation review Approach column for variety; pair each topic with hooks DB to write the opening line.

---

# ENGINE 6 — Repurposing Matrix Engine

`[LAYER: global_library for methods + lift table; members for the repository of their own posts]`
Sources: `my-context-os/04-linkedin-content/strategy/linkedin-content-repurposing.md:132-235` + `narrative-ingredient-to-asset-mapping.md:174-193`

## 6.1 The 20/80 + Demand Calendar operating principles (config constants)

(`:75-112`):
- **20/80 rule:** 20% creation, 80% repurposing/distribution. One great piece → 10+ pieces across formats.
- **Demand calendar rhythm (deterministic 4-week cycle):**
  ```
  Week 1: Create 3-5 original posts
  Week 2: Repurpose best-performers into new formats
  Week 3: Refine and expand top content
  Week 4: Create 2-3 new posts + repurpose ongoing winners
  ```
- **Post Repository fields (members table — track per post)** (`:120-126`): `topic_theme, format, hook_used, performance_metrics{impressions,engagement,comments}, date_published, repurposing_potential[]`.
- **Re-use cooldown rule (DETERMINISTIC — the cooldown the task asks for):** posts from **3+ months old** are eligible for republish with updates (audience has turned over) (`:128, :215-219`). Implement: `repurpose_eligible_after_days = 90` for Method 14 (Update Old Posts) and "Get Inspired" recycles.

## 6.2 The 14 Repurposing Methods (seed table)

(`:134-220`) — seed as `repurposing_methods`. Fields: `id, name, how, tool/source, performance_note, new_hook_required`.
```json
{
  "repurposing_methods": [
    { "id": 1,  "name": "Text -> Diagram",
      "how": "Take the core framework from a text post and visualize it (flowchart/infographic)",
      "tool": "gemini-visual-content-system (whiteboard-style outperforms polished corporate)",
      "new_hook_required": false },
    { "id": 2,  "name": "Simple Repost on Company Page",
      "how": "Post from personal profile first (more reach), share on company page 24-48h later",
      "performance_note": "Extends reach to company followers; cobrand model",
      "new_hook_required": false },
    { "id": 3,  "name": "Text -> Carousel",
      "how": "Each bullet/section becomes a slide; add title slide + CTA slide",
      "tool": "linkedin-carousel-guide (8-step automation)",
      "performance_note": "Carousels get 3x reach vs regular text posts",
      "new_hook_required": false },
    { "id": 4,  "name": "Text -> Video",
      "how": "Record yourself riffing (not reading) the key points in 60-90s; post native, add subtitles",
      "performance_note": "Video reach dropped ~300% since 2023 (van der Blom Feb 2025); subtitles non-negotiable (72% mobile consumption)",
      "new_hook_required": false },
    { "id": 5,  "name": "Update Design (Refine)",
      "how": "Same content, new visual treatment (new image/carousel/infographic)",
      "performance_note": "Visual refresh can revive textually-strong content",
      "new_hook_required": false },
    { "id": 6,  "name": "Refine Opening & Angle",
      "how": "Take a good post that underperformed; rewrite first 2-3 lines with a DIFFERENT hook type",
      "tool": "linkedin-hooks-playbook (12 types — e.g. Fear hook where Curiosity hook failed)",
      "new_hook_required": true },
    { "id": 7,  "name": "Expand",
      "how": "Take a bullet point and make it a full post",
      "performance_note": "Every listicle post contains N future posts (N = list length)",
      "new_hook_required": true },
    { "id": 8,  "name": "Get Inspired by Others",
      "how": "Track 10-15 niche creators; when a post performs, note topic+angle, create your version",
      "ethics": "Copy structure not content; add own insights",
      "new_hook_required": true },
    { "id": 9,  "name": "Expand into Newsletter",
      "how": "Combine 3-5 related posts + connective tissue into a long-form newsletter",
      "performance_note": "Builds owned subscriber base vs algorithm-dependent reach",
      "new_hook_required": true },
    { "id": 10, "name": "Expand into Webinar",
      "how": "Take 5-10 related posts -> each a slide/talking point; add Q&A + deeper examples",
      "performance_note": "Record -> clip into short videos -> post clips",
      "new_hook_required": true },
    { "id": 11, "name": "Expand into Guide",
      "how": "10-20 related posts organized into chapters = complete guide/ebook",
      "tool": "linkedin-lead-magnet-playbook (use as lead magnet)",
      "new_hook_required": true },
    { "id": 12, "name": "Include Podcasts/Webinars in Guides",
      "how": "Transcribe podcast/webinar, edit into written sections, add to guides",
      "performance_note": "Turns audio/video into written assets and vice versa",
      "new_hook_required": false },
    { "id": 13, "name": "Expand into Guest Post",
      "how": "Take 3-5 related posts, expand into 1500-2000w article for industry blogs/Medium",
      "performance_note": "Backlink to your LinkedIn profile for audience growth",
      "new_hook_required": true },
    { "id": 14, "name": "Update Old Posts",
      "how": "Find 3-6 month-old posts that performed; update stats, add examples, refresh hook",
      "performance_note": "Audience has grown; most new followers haven't seen old content",
      "cooldown_days": 90,
      "new_hook_required": true }
  ]
}
```

**New-hook rule (DETERMINISTIC — the task's "new-hook rule"):**
- A repurpose REQUIRES a new hook (`new_hook_required: true`) when the method changes the angle, expands scope, or republishes to the same surface/audience: methods 6, 7, 8, 9, 10, 11, 13, 14.
- A repurpose may KEEP the hook (`new_hook_required: false`) when it only changes the visual/format container or distribution surface: methods 1, 2, 3, 4, 5, 12.
- Special case Method 6 IS the hook rewrite (its whole purpose).
- Repurpose-override from Engine 4.3: if original_format == candidate_format, force a different format (don't repost same format same hook).

## 6.3 Repurposing Decision Matrix (DETERMINISTIC router — original_format → methods + lift)

(`:226-233`) — the lift-labeled matrix the task asks for. Seed as `repurposing_router`:
```json
{
  "repurposing_router": [
    { "original_format": "text_post_high_engagement",
      "best_methods": ["text_to_carousel", "text_to_diagram", "text_to_video", "company_repost"],
      "expected_lift": "2-5x additional reach" },
    { "original_format": "text_post_low_engagement_good_content",
      "best_methods": ["refine_hook", "update_design"],
      "expected_lift": "recovery potential" },
    { "original_format": "carousel_high_engagement",
      "best_methods": ["text_post_different_angle", "webinar_slide"],
      "expected_lift": "format-switch audience" },
    { "original_format": "long_form_article",
      "best_methods": ["split_to_5_10_standalone_posts", "newsletter", "lead_magnet"],
      "expected_lift": "content multiplication" },
    { "original_format": "webinar_recording",
      "best_methods": ["short_video_clips", "written_guide", "post_series"],
      "expected_lift": "multi-format distribution" },
    { "original_format": "podcast_episode",
      "best_methods": ["written_guide", "quote_graphics", "post_series"],
      "expected_lift": "audio-to-visual conversion" }
  ]
}
```
**Router function signature (deterministic):**
```
routeRepurpose(original_format, engagement_level) -> { best_methods[], expected_lift, new_hook_required_per_method{} }
```

## 6.4 Specific lift constants (extract verbatim — engineers may display these)

- Text → Carousel: **3x reach vs regular text** (`:152`)
- Text high-engagement → any of {carousel, diagram, video, company repost}: **2-5x additional reach** (`:228`)
- Video reach: **dropped ~300% since 2023** (van der Blom, Feb 2025) — repurpose-to-video is a declining bet; subtitles required (72% mobile) (`:159`)
- Update old posts cooldown: **3+ months / 90 days** (`:128, :219`)

## 6.5 Narrative-Ingredient → Asset Mapping (7×5 reuse matrix) `[LAYER: orgs + members]`

This is a SEPARATE reuse engine (build-once-reuse-everywhere for sales assets, not post-to-post repurposing).
Source: `narrative-ingredient-to-asset-mapping.md:88-193`

**The 7 narrative ingredients (seed as `narrative_ingredients`, org/member level)** (`:90-98`):
1. `audience` (specific one-line ICP) · 2. `problem` (pain in time/money) · 3. `outcome` (measurable result) · 4. `story` (origin/credibility) · 5. `framework` (named signature method) · 6. `proof` (named wins/logos/before-after) · 7. `offer` (3-tier proximity: DIY → DWY → DFY)

**The 5 sales-asset surfaces (seed as `sales_assets`)** (`:104-171`): `website`, `linkedin_profile`, `promo_post` (7-beat: Hook → Their reality → What they tried → What you did → How life changed → Proof → Mirror), `offer_doc` (NOVEL: Title → Who's this for → Future scenario → Your service → ICP's change → What others say → What's included + 3 tiers), `booking_page` (NOVEL: Who is this for → What they get → Short intake form → Reassurance).

**The 7×5 mapping matrix (DETERMINISTIC reuse lookup — write once, place 5×)** (`:178-186`):
```json
{
  "narrative_7x5_matrix": {
    "audience":  { "website": "Hero (for [role]), Services", "linkedin_profile": "Headline (who it's for), About", "promo_post": "Hook (ICP role name)", "offer_doc": "Who's this for?", "booking_page": "Who is this for" },
    "problem":   { "website": "Hero (situation stuck in)", "linkedin_profile": "About (You can do X & still...)", "promo_post": "Hook + Their reality + What they tried", "offer_doc": "Title (ICP pain), Pain points", "booking_page": "Intake form (pains)" },
    "outcome":   { "website": "Hero (big change), Services (result)", "linkedin_profile": "Banner, Headline (money/time)", "promo_post": "How life changed", "offer_doc": "Title (outcome 1-liner), Future scenario, ICP Change", "booking_page": "What they get (walk-away outcome)" },
    "story":     { "website": "About (origin)", "linkedin_profile": "About (I know 'cause I...)", "promo_post": "What you did", "offer_doc": "Your service (method origin)", "booking_page": "—" },
    "framework": { "website": "Services, About (method/lens)", "linkedin_profile": "About (How it works, Quick overview)", "promo_post": "What you did + How life changed", "offer_doc": "Your service (3 parts), Included", "booking_page": "What they get (format)" },
    "proof":     { "website": "Social proof, Contact (Join 500+)", "linkedin_profile": "Banner (1-3 proof signals), About (1-3 wins)", "promo_post": "Proof (after state)", "offer_doc": "What others say", "booking_page": "Reassurance (testimonials, metrics, badge)" },
    "offer":     { "website": "Services + CTA, Hero CTA", "linkedin_profile": "Featured (lead magnet), Headline (1-3 achievements)", "promo_post": "Mirror + CTA", "offer_doc": "What's included + 3 tiers", "booking_page": "— (page is the offer endpoint)" }
  }
}
```
**Reuse math (operational claim):** 7 ingredients × 5 assets = 35 surface mentions, but only 7 unique writes (`:193`). Read by row ("where do I plug Audience?" → 5 cells) or by column ("what's in my Offer Doc?" → 6 ingredients in order).

---

# Appendix A — Cross-Engine Data Flow (build order)

```
Engine 2 (Wants/Results/Fears, org/member)  ─┐
Engine 1 (idea systems router)              ─┼─> raw post angles
Engine 9-narrative (strategic narrative)    ─┘
        │
        v
Engine 5 (calendar megaprompt) ── fills 20-row plan, validated by Engine 3 weekly-mix
        │
        v   (per row)
Engine 4 (strategy-card router) ── deterministic pillar/type/format/framework/hook-type + LLM 3 hooks + HARD GATE
        │
        v   (approved card)
[content pipeline — out of scope: write/copy-edit/humanize]
        │
        v   (published post + metrics in member repository)
Engine 6 (repurposing router) ── original_format + engagement -> methods + lift + new-hook rule + 90d cooldown
        ↺ loops back into the calendar as repurposed slots
```

# Appendix B — Seed-vs-config summary (for the DB seed migration)

| Data | Layer | Mutable? |
|------|-------|----------|
| 10 idea systems + all sub-tables, decision matrix | global_library | read-only seed |
| 4 pillars, 10 post types, Pillar×Type matrix, funnel stages, 7 lazy formats, 30 visual types | global_library | read-only seed |
| message_type→post_type, format rules, framework selector, hook-type map, psychology levers, action enum | global_library | read-only seed |
| Calendar megaprompt skeleton, approach enum, validators | global_library | read-only seed |
| 14 repurposing methods, repurposing router, lift constants, narrative 7×5 matrix template | global_library | read-only seed |
| Wants/Results/Fears example banks (5 each) | global_library | read-only seed (few-shot) |
| Chosen content pillars, ICP, personas, org-level Wants/Results/Fears, frustration map | orgs | mutable |
| Per-member voice, prose samples, beliefs, member W/R/F overrides, post repository + metrics, narrative ingredients | members (FK org_id) | mutable |
| Strategy-card per-post record (the persisted JSON) | members | mutable |

---
title: "Choir — Master Component Build-Kit Spec"
product: Choir (team content-OS / personal-branding web app, LinkedIn-first, B2B SaaS GTM)
stack: Next.js + React + Tailwind v4 + shadcn/ui
mock_source: brainstorms/content-os-app/app-skeleton/choir-app-mock.html
created: 2026-06-20
status: handoff-spec
audience: engineers (build) + owner (component selection)
---

# Choir — Master Component Build-Kit Spec

**What this is:** the single source of truth for which component builds every element of Choir. Engineers bootstrap the whole UI from the **Install Manifest (§2)**, then build each screen against the **Screen-by-Screen Checklist (§3)**. The owner picks/approves components from these tables.

**The one rule that governs every decision below — RESTRAINT:** Choir is Linear / Vercel / Notion / Raycast restraint plus *tasteful* motion. **ONE electric-violet accent (`#761fff`)** on a clean neutral palette. Whitespace, hierarchy, micro-interactions. Smooth, not busy. **shadcn/ui is the base for ~90% of the app**; reach for a motion/registry component ONLY where it materially lifts the screen. We harvest motion-library *choreography*, never their *skin* — every imported component is recolored to Choir tokens and slowed down. Aceternity's neon-gradient default, cursor-particle effects, and dark-mode glows are **banned** (that is the "AI slop" register the owner rejects).

**Verified against the real mock** (`choir-app-mock.html`, 1529 lines): all element class names (`.seg`, `.recfield`, `.qrow`, `.memcard`, `.vbox`, `.gaptrack`, `.kpis`…), design tokens, and the `@media(prefers-reduced-motion)` contract (line 544) are real. Every `npx` command below is the actual command engineers run.

---

## CROSS-SCREEN CONSISTENCY DECISIONS (resolve once, apply everywhere)

These are the decisions that keep the app from fragmenting. **One element type = one component, app-wide.** If a screen table below seems to omit a choice, it is because the canonical decision lives here.

| Recurring element | CANONICAL component | Rationale (why one choice) |
|---|---|---|
| **Segmented control** (`.seg`): author switch, Ideas 3-mode, Queue filter, Analytics range, source-type chips | **shadcn `Toggle Group`** (`type=single`) + **Motion-Primitives `Animated Background`** sliding pill | The `.seg` pattern appears on 5+ screens. Toggle Group is the primitive; Animated Background gives ONE shared `layoutId` electric-violet-soft pill that slides — the single highest polish-per-line micro-interaction. Same treatment everywhere = one motion language. **Exception:** the Voice zone sub-nav uses `Tabs` (it switches whole PAGES, not in-context filters) — but layers the *same* Animated Background pill so it still reads identical. |
| **Active-nav indicator** (rail `.rbtn.on`, mobile `.tbtn.on`) | **Motion-Primitives `Animated Background`** (same component as segmented controls) | The rail pill and the mobile tab marker are the same motion vocabulary as `.seg`. Reuse the exact component so nav and filters feel like one system. |
| **The dominant ROW** (icon/avatar + title + meta + trailing action): Queue `.qrow`, Engage `.feedcard` head, Ideas cards, top-posts `.apost`, leaderboard `.lbrow`, atom rows, every Voice `.vbox`/`.memitem`/`.anti`, onboarding `.recfield` | **shadcn `Item`** (3.x primitive) | This row pattern repeats ~12 places. `Item` (ItemMedia / ItemContent / ItemActions) standardizes it and kills a dozen bespoke flex rows. Highest-leverage base primitive after Button. |
| **Surface container** (`.card`, `.feedcard`, `.anbox`, `.memcard`, `.composer`…) | **shadcn `Card`**, restyled to Choir tokens | One card style: `--radius 16px`, `1px #ECECEF` border, `--shadow-1`. The composer is the ONLY surface that sits higher (`--shadow-2`). Use Card as the surface only — most internal layouts are bespoke flex, skip Header/Footer slots unless they fit. |
| **All status / category pills** (`.pill-*`): queue states, verdict chips, confidence, voice tags, source tags, KPI deltas, lift pills | **shadcn `Badge`** with a shared **status CVA** | ONE Badge with custom variants beyond shadcn defaults: `success` (green `#0E9F6E`/`#E6F6EF`), `warning` (amber `#B26B00`/`#FFF6E8`), `default` (electric-violet, recolored), `secondary` (neutral `#F0F0F2`), plus a `destructive` for Rejected/Failed. Add a **leading status icon per state** so color is never the only a11y signal. |
| **All toasts** ("Copied", "Approved ✓", "Scheduled Tue 7:45am"…) | **shadcn `Sonner`** (NOT legacy Toast) | One `<Toaster />` at app root; the mock's `toast()` calls map 1:1. Dark surface `#1E1E22` + green check to match the mock. The legacy shadcn Toast is deprecated — do not use it. |
| **All animated numbers** (confidence score, KPIs, proof stats, multipliers) | **Motion-Primitives `Animated Number`** (count-up) + `Sliding Number` (odometer for live-changing counters) | One counter language. `Animated Number` = count-up on reveal (confidence 94%, KPIs, proof bigs, "3.2×", "9 ways"). `Sliding Number` = digit-roll on *value change* only (streak, memory count). **Honesty rule: only animate REAL values, never a fabricated metric.** Aceternity NumberTicker is an acceptable drop-in alt if the team standardizes on it — pick ONE, don't mix. |
| **The "AI is composing" reveal** (post body, comment draft, onboarding hero, rotating question) | **Motion-Primitives `Text Effect`** (`per: word`, `fade-in-blur`) | One reveal language. `per: word` (NOT per-char — gimmicky for body copy), quiet preset, **fire ONCE** on resolve (never loop). Replaces the mock's blunt `@keyframes fade`. |
| **List/row paint-in** (idea lists, Queue rows, Engage feed, top-posts, atom rows) | **Motion-Primitives `Animated Group`** | One stagger: ~50–70ms apart (matches the mock's `--i*60ms` cadence), translateY 4–8px + fade, spring. Stagger on **first paint / mode-switch only** — never on scroll re-entry of seen cards. Cap long lists (stagger first ~6, paint the rest). |
| **Dataviz bar/ring fills** (consistency chart, gap bars, pillar bars, XP ring) | **shadcn `Chart`** (Recharts) + **Motion-Primitives `In View`** to trigger the fill | Charts are legitimate here because **Analytics shows REAL product data**, not fabricated marketing telemetry. `In View` fires the fill ONCE on viewport-enter, matching the mock's `.view.reveal` 0.5s ease-out + `--i*60ms` stagger. Point `--chart-1` at electric-violet. |
| **Loading states** (transcribe, generate, "Analyzing…", "Breaking this down…") | **shadcn `Skeleton`** (+ inline `Spinner` for button-local loading) | One shimmer = the mock's `.wv` rows. `Skeleton` for content-area loads, `Spinner` (3.x) for in-button loads where a full skeleton is too heavy. |
| **Empty / first-run states** (pre-analyze Discover, pre-drop Repurpose, empty Queue/Ideas) | **shadcn `Empty`** (3.x) | One empty-state primitive (EmptyMedia + EmptyTitle + EmptyDescription + action). For a richer illustrated empty state, ONE hand-picked unDraw SVG recolored to electric-violet via `currentColor` (manual pick only — license forbids scraping/AI-training). |
| **Card hover affordance** | The mock's existing `translateY` lift (`hover:-translate-y-0.5 hover:shadow-md`) | This is the on-brand default for ALL clickable cards/rows. The optional cursor-glow (Card Spotlight) is a separate, single-surface decision — see §4. |
| **`prefers-reduced-motion`** | A **project SSR-safe `usePrefersReducedMotion` hook**, applied to every motion import | The mock already hard-codes the reduced-motion branch (line 544: freezes mic meter, renders dataviz at final size). Every Motion-Primitives/Aceternity import MUST honor the same via the project hook — **NOT** the library's own reduced-motion handling (causes a Next.js hydration mismatch). |

**The brain-dump mic is bespoke, not a library import.** Idle breathing glow → rounded-square rec morph → 6-bar amplitude waveform → transcribe Skeleton → captured-tick + CTA pulse. No library waveform fits the electric-violet-on-clean register, and the choreography is product-specific feedback. Build it ONCE as an owned component on a shadcn `Button` atom, reuse it in onboarding Step 3 (the voice interview) and Create.

---

## 1. FOUNDATION

### 1.1 The stack & init order

```bash
# 1. Scaffold (one-time). Pick Neutral base + radius, then OVERRIDE every token (§1.2).
npx shadcn@latest init
# choose: Neutral/Zinc base color, single radius

# 2. (Recommended for agent-assisted builds) wire the shadcn MCP so engineers
#    can pull components by natural-language name in-session:
npx shadcn@latest mcp init --client claude

# 3. Install the whole base in one pass — see §2 Install Manifest.

# 4. Add the motion runtime (Motion-Primitives + Aceternity peer dep):
npm i motion          # "motion" = the package formerly known as framer-motion (v12)
                      # convert any `framer-motion` imports to `motion/react`

# 5. Smooth-scroll polish (lowest-risk, highest-leverage, zero aesthetic cost):
npm i lenis           # wrap the app root in a Lenis provider
```

All shadcn components write source into `components/ui/` — **you own and restyle the code**; nothing is npm-locked. Same for Motion-Primitives (`components/motion-primitives/`) and Aceternity. This is a code-distribution model, not a dependency.

> **CAUTION — do NOT inherit shadcn Blocks / dashboard layouts as-is.** They impose the generic v0/Lovable section ordering the owner rejects. Use shadcn *atoms*; design the IA from Choir's own mock screens, tearing any borrowed template down to skeleton.

### 1.2 Color scale — electric-violet accent + warm neutral

The brand accent is **electric-violet**. Paste this exact 11-stop scale into `tailwind.config` under `colors` (already generated — no need to re-run UI Colors):

```js
// tailwind.config — colors
'electric-violet': {
  '50':  '#f4f1ff',  '100': '#ebe6ff',  '200': '#d9d0ff',
  '300': '#bdaaff',  '400': '#9e7aff',  '500': '#8145ff',
  '600': '#761fff',  '700': '#7218f4',  '800': '#5a0bcc',
  '900': '#4b0ba7',  '950': '#2c0372',
}
// + a warm neutral scale from a ~#0a0a0a base → colors.neutral
```

**Pin these exact CSS variables (the mock’s truth):**

```css
:root{
  --background:#F7F7F8;  --surface:#fff;
  --foreground:#18181B;  /* --ink */   --ink2:#5B5B63;  --ink3:#9B9BA3;
  --line:#ECECEF;  --line2:#E2E2E6;
  --primary:#761fff;          /* electric-violet-600 — THE one accent */
  --accent-soft:#ebe6ff;      /* electric-violet-100 — selected/tint */
  --accent-ink:#5a0bcc;       /* electric-violet-800 — hover/pressed + text-on-light */
  --green:#0E9F6E;  --green-soft:#E6F6EF;  --amber:#B26B00;  --amber-soft:#FFF6E8;
  --ink-surface:#1C1C20;  /* workspace mark, dark toast */
  --radius:1rem;          /* 16px — single radius scale */
  --shadow-1:0 1px 2px rgba(24,24,27,.04),0 1px 3px rgba(24,24,27,.06);
  --shadow-2:0 2px 4px rgba(24,24,27,.05),0 8px 24px rgba(24,24,27,.08);
  --shadow-3:0 12px 40px rgba(24,24,27,.14);
}
```

**Spend discipline:** 11 stops generated ≠ 11 used. Use **3–4 stops max** — `electric-violet-600` (CTAs, active nav/segment, focus ring, ONE KPI highlight), `electric-violet-100`/`50` (selected row / chip tint = `--accent-soft`), `electric-violet-800` (hover/pressed = `--accent-ink`). Neutral carries ~95% of the UI. **White text on `-600` clears ~6:1 (WCAG AA); `-500` is too light for white-on-fill, so fills use `-600`.** Green / amber stay **semantically separate** (verdict, status, confidence) so they never fight the accent. Run every text-on-surface pair through the free WCAG checker.

### 1.3 Font — Fontshare

**Primary (UI + body): General Sans Variable.** Neutral Swiss-grotesque warmth, clean at body, holds as display — avoids the overused-Inter look. **Self-host the variable `.woff2`** (one file, fluid weight ramp, smaller payload, kills the third-party request).

```html
<!-- prototyping CDN fallback only; ship self-hosted -->
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">
```
Download from `fontshare.com/fonts/general-sans` → `/public/fonts` → `@font-face` `font-display:swap` + preload the H1 weight → map to Tailwind `--font-sans`.

- **License:** Free (ITF-FFL) — no attribution, no tracking; cannot resell the font files.
- **Optional second family — Switzer Variable** for dense data UI (analytics tables, calendar, KPI strips) where a tighter neo-grotesque reads cleaner at small sizes. **Two-family systems read premium only if disciplined — if in doubt, ship General Sans only** (or Satoshi as a single family everywhere).
- The mock currently uses a system-font stack (`--sans`); swapping to General Sans is the single biggest "feels designed" lift at zero structural cost.

### 1.4 Motion library

**Motion-Primitives (ibelick) — free / MIT — is the core motion set.** Spring-physics, Linear/Vercel-tactile vocabulary, shadcn-CLI-native (drops source into `components/motion-primitives/`, you own it). Six earned components across the whole app: `Animated Background`, `Animated Number`, `Sliding Number`, `Text Effect`, `Animated Group`, `In View` (+ optional `Border Trail`, `Spotlight`).

**Aceternity (free tier) is the surgical accent layer** — at most ~3–4 in the app interior, bones-not-skin (recolor to Choir tokens, halve motion speed). **Skiper / Componentry / 21st.dev / ShaderGradient are landing-page or single-flourish only** — see §4 for the explicit ban list.

Install protocol (both libs ride the shadcn registry):
```bash
npx motion-primitives@latest add <name>
# OR equivalently:  npx shadcn@latest add https://motion-primitives.com/c/<name>.json
```

### 1.5 MCP servers to add (so engineers/agents pull components by name)

| MCP | Purpose | Add command | Tier |
|---|---|---|---|
| **shadcn** | Natural-language component installs in-session | `npx shadcn@latest mcp init --client claude` | Free |
| **21st.dev Magic** | OPTIONAL premium motion pulls (animated counter, text reveal) — use Motion-Primitives free equivalents first | `claude mcp add 21st-dev -- npx -y @21st-dev/magic@latest` | Browse free; full code/MCP pulls PAID |
| **Mobbin** | Ground UI against real shipped flows + mine shipped microcopy ("Text in Screenshots") | `claude mcp add mobbin --scope user --transport http https://api.mobbin.com/mcp` (browser OAuth, no key) | Pro-gated (~£8/mo) |
| **Refero** | Clean-premium DESIGN.md calibration (Linear/Vercel/Cursor) + 132K shipped-screen query | `claude mcp add --transport http refero https://api.refero.design/mcp --header "Authorization: Bearer <token>"` | Free Beta (DESIGN.md copy-paste); MCP/search Pro |

> Per CLAUDE.md Rule 5 + MCP supply-chain pins: **pin exact versions** in `.mcp.json` when adding any MCP (`npx -y <pkg>@latest` re-resolves every session). Mobbin/Refero are *reference-grounding* MCPs — reference structure/flow/microcopy, never clone an identity.

---

## 2. THE INSTALL MANIFEST (consolidated, de-duplicated)

Run these to bootstrap the entire component set in one pass. Grouped by library.

### 2.1 shadcn/ui base — one batched command

```bash
npx shadcn@latest add button button-group toggle-group tabs \
  textarea input input-group field label select \
  card item separator badge avatar progress \
  dialog sheet popover dropdown-menu tooltip command \
  table chart calendar \
  skeleton spinner empty sonner alert collapsible
```

**What each covers (de-duped across all screens):**

| Component | Builds |
|---|---|
| `button` | Every action + the rail/tab nav atoms + starter chips |
| `button-group` | Joined action rows (Copy+Tweak, Approve+Reject, action bars, onboarding footers) |
| `toggle-group` | Every `.seg` segmented control + single-select source-type chips |
| `tabs` | Voice zone sub-nav (My Voice / Winning content / Company) |
| `textarea` | Composer, onboarding answer box, Repurpose paste field |
| `input` `input-group` `field` `label` | Onboarding form rows; Discover/Repurpose search bars (icon + input + inline button) |
| `select` | Discover's 4 Taplio-style filters |
| `card` | The surface behind nearly every block |
| `item` | The dominant row pattern (~12 places — see consistency table) |
| `separator` | Section dividers, Team Review band, repsum/stat dividers |
| `badge` | The whole pill system (add green/amber/destructive CVA variants) |
| `avatar` | All identity surfaces (author chips, feed, leaderboard with illustrated SVG faces) |
| `progress` | Onboarding step bar, XP bar (linear option), gap/pillar bars (Progress option) |
| `dialog` `sheet` | "View all 47" memory, invite, edit-brand-DNA, post editor |
| `popover` `dropdown-menu` | Workspace/account menu (`.smenu`); Calendar trigger; filter dropdowns |
| `tooltip` | Rail labels, badge titles, confidence explanations, disabled-feature hints |
| `command` | ⌘K palette (fast-follow, not in mock) |
| `table` | Team leaderboard, Analytics top-posts (REAL data = honest UI) |
| `chart` | Consistency chart, gap/pillar bars, XP ring (Recharts) |
| `calendar` | Schedule-slot picker on Approve (mock fakes with a toast) |
| `skeleton` `spinner` | All loading states (content shimmer + in-button spinner) |
| `empty` | Pre-action / first-run empty states |
| `sonner` | All toasts (one `<Toaster />` at root) |
| `alert` | Engage `.complybar` "nothing sent automatically" trust banner |
| `collapsible` | The "why?" provenance panel (inline expand) |

### 2.2 Motion-Primitives (free / MIT) — the motion set

```bash
npx motion-primitives@latest add animated-background animated-number sliding-number \
  text-effect animated-group in-view
# optional (gated, see §4):
npx motion-primitives@latest add border-trail spotlight
```

| Component | Builds |
|---|---|
| `animated-background` | The sliding electric-violet-soft pill on EVERY `.seg` + rail/tab active state |
| `animated-number` | Confidence score 94%, KPI count-ups, proof bigs (96%/214), "3.2×", "9 ways" |
| `sliding-number` | Streak counter, core-memory count — digit-roll on real value change only |
| `text-effect` | Post-body / comment-draft / onboarding-hero / rotating-question reveals |
| `animated-group` | Idea-list, Queue, Engage-feed, top-posts, atom-row stagger |
| `in-view` | Fire-once scroll wrapper gating all count-ups + dataviz fills |
| `border-trail` *(optional)* | Electric-violet trace on composer/memcard while actively generating only |
| `spotlight` *(optional)* | At most ONE focal-card cursor-glow (Motion-Primitives variant) |

### 2.3 Aceternity (free tier) — accent layer (install only what you use)

Aceternity installs by **per-component registry URL** — there is no registered `@aceternity` shadcn CLI namespace (unlike `@componentry`, which IS registered). **Confirm each slug on `ui.aceternity.com` before running** (the registry path can shift).

```bash
# Card hover — OPTIONAL, single-surface experiment only (see §4.2 — dark-mode-native):
npx shadcn@latest add "https://ui.aceternity.com/registry/card-spotlight.json"
# npx shadcn@latest add "https://ui.aceternity.com/registry/glare-card.json"   # alt — fiddly on white
# Layout skeleton (STRUCTURE ONLY — strip all skin):
npx shadcn@latest add "https://ui.aceternity.com/registry/bento-grid.json"
# Landing/marketing surfaces only:
npx shadcn@latest add "https://ui.aceternity.com/registry/infinite-moving-cards.json"
# Brief explicitly names a NumberTicker — Aceternity alt to Motion-Primitives' Animated Number:
npx shadcn@latest add "https://ui.aceternity.com/registry/number-ticker.json"   # OR Magic UI fallback:
# npx shadcn@latest add "https://magicui.design/r/number-ticker"
```
**License:** Aceternity free = copy-paste, no attribution (own the code). Pro/All-Access = pay-once. **Everything recommended here is on the free tier.**

> **Card Spotlight cost note (verified):** the `card-spotlight.json` registry item ships on `bg-black` and declares a `registryDependency` on `canvas-reveal-effect.json` — which pulls `@react-three/fiber` + `three` and a hardcoded blue/purple WebGL shader. On Choir's warm-paper light surface this is a **full reimplementation, not a recolor**. The translateY hover-lift is the canonical default; treat Card Spotlight as a skippable single-surface stretch goal.

### 2.4 Optional registry picks (free / MIT — install only if chosen)

**Verify each Watermelon slug before install.** The four below are install-on-use ALTS to shadcn primitives already named as canonical — they are not in the KB-confirmed Watermelon slug set (`button`, `animated-accordion`, `chart`). If a slug 404s, drop the row and use the canonical primitive in the trailing comment.

```bash
# Watermelon UI (free/MIT) — layout-skeleton references to strip down, NOT ship as-is:
npx shadcn add "https://registry.watermelon.sh/fluid-tabs.json"      # Voice sub-nav alt    (canon: Tabs)
npx shadcn add "https://registry.watermelon.sh/edit-profile.json"    # Brand-DNA editor     (canon: Field+Textarea)
npx shadcn add "https://registry.watermelon.sh/file-upload.json"     # Repurpose drop-zone
npx shadcn add "https://registry.watermelon.sh/gauge.json"           # XP/voice ring alt    (canon: Chart RadialBar)
# Componentry.fun (free/MIT) — at most ONE flourish:
npx shadcn@latest add @componentry/split-flap-display               # ONE hero proof stat (optional)
```

---

## 3. SCREEN-BY-SCREEN CHECKLIST

Element → Component → Source → Install → Treatment. Canonical recurring decisions (§ consistency table) are referenced, not repeated.

### 3.1 App Shell — desktop rail (`.rail`, lines 562–574)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Rail nav item `.rbtn` (icon + 10px label) | `Button` (ghost, flex-col) | shadcn | `button` | flex-col, 20px Lucide icon (PenLine/Lightbulb/Layers/MessageCircle/BarChart3/AudioLines) + 10px label; `data-active` = electric-violet text + `#ebe6ff` bg |
| Active-nav sliding pill + 3px electric-violet spine | `Animated Background` | Motion-Primitives | `animated-background` | **Canonical** — shared `layoutId`, slides between items; electric-violet-soft pill + 3px left spine; reduced-motion: snap |
| Rail-icon hover labels / disabled-feature hints | `Tooltip` | shadcn | `tooltip` | low-delay, neutral surface |
| Bottom account avatar `.ravatar` ("SM") | `Avatar` (trigger for the menu) | shadcn | `avatar` | AvatarFallback "SM" on `#2B2B31`; electric-violet-soft hover ring; wraps the workspace DropdownMenu |

### 3.2 App Shell — mobile tab bar (`.tabbar`, lines 1202–1209 / CSS 529–540)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Mobile tab `.tbtn` (icon + 9.5px label) | `Button` (ghost, flex-col) | shadcn | `button` | Same atom as `.rbtn`, smaller; fixed bottom flex bar (no native shadcn bottom-tab — compose it) |
| Active-tab top marker (2px electric-violet) | `Animated Background` | Motion-Primitives | `animated-background` | **Canonical** — reuse the rail's `layoutId` pattern; 2px top-anchored; reduced-motion: snap |

### 3.3 App Shell — workspace / account menu (`.smenu`, lines 1213–1226)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Whole anchored menu + backdrop + ESC | `Dropdown Menu` | shadcn | `dropdown-menu` | Radix gives focus-trap/ESC/arrow-nav/item-roles free — replaces the hand-rolled `.smask` + keydown listener. `DropdownMenuSeparator` for `.sdiv` |
| Workspace header (T logo + "1 member · solo workspace") | `Avatar` + `DropdownMenuLabel` | shadcn | `avatar` | Square Avatar (rounded-9px) on `#1C1C20`; "1 member" reads as honest product state |
| Disabled teaser rows (Roles/Workspace settings) | `DropdownMenuItem` (disabled) + `Badge` | shadcn | `badge` | disabled item + neutral Badge ("team"/"admin") + Tooltip "unlocks when a teammate joins" |

### 3.4 App Shell — global toasts + ⌘K palette

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| All confirmation toasts (`.toast`) | `Sonner` | shadcn | `sonner` | **Canonical** — one `<Toaster />` at root; dark `#1E1E22` + green ✓ |
| ⌘K command palette (Create/Ideas/Queue/Engage/Analytics/Voice + quick actions) | `Command` (cmdk) | shadcn | `command` | Mirrors nav routes; Linear/Raycast premium signal; **fast-follow, not v1-blocking** (not in mock) |

### 3.5 Onboarding — Step 1: welcome / account (lines 1237–1246)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Progress bar `.ob-prog` | `Progress` | shadcn | `progress` | electric-violet indicator, 5px, width per step index; reduced-motion: jump |
| "Skip demo →" | `Button` (ghost/link, sm) | shadcn | `button` | quiet ink3, deliberately understated |
| Form rows (label + input + helper) `.field` | `Field` + `Input` + `Label` | shadcn | `field input label` | 3.x Field composes label+control+hint+validation in one accessible block; electric-violet focus ring |
| Account CTAs (Continue with email / Google) | `Button` (default electric-violet + outline) | shadcn | `button` | full-width; ONE electric-violet (email), Google is neutral |
| Welcome headline reveal | `Text Effect` (`per:word`, fade-in-blur) | Motion-Primitives | `text-effect` | **Canonical reveal** — one quiet word-by-word H2 entrance, fire once |

### 3.6 Onboarding — Step 2: "react, don't fill" record cards (lines 1249–1259)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Researched record row `.recfield` (key + value + confidence) | `Item` + `Card` | shadcn | `item card` | **Canonical row** — ItemContent = key+value, ItemActions = pill; editable-in-place: inline Input on click |
| Confidence pills (High=green / Med=amber) | `Badge` (success/warning) | shadcn | `badge` | **Canonical pills** — real model-confidence values, honest UI |
| "You add" dashed prompt cards `.recfield.add` | `Card` (dashed-electric-violet) + `Field` + `Textarea` | shadcn | `card field textarea` | `1px dashed var(--accent)` — the ONE place a electric-violet border earns its place (signals "human input required") |
| Reveal headline + 5-card stagger | `Text Effect` + `Animated Group` | Motion-Primitives | `text-effect animated-group` | **The wow moment** — headline word-reveal, then `.recfield` cascade (~50–70ms); fire once on step-enter |
| Step footer (Back / "Looks right →") | `Button Group` + `Button` | shadcn | `button-group button` | ghost Back + electric-violet forward |

### 3.7 Onboarding — Step 3: one-question voice interview (lines 1262–1274)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Question progress `.qdots` (7 dots, active stretches to electric-violet bar) | **Bespoke** dot-stepper (Tailwind) | shadcn atoms | `progress` (fallback) | Keep bespoke — the electric-violet stretch IS the delight; `width:22px` electric-violet pill on `.on` |
| Big rotating question `.qbig` | `Text Effect` (`per:word`) | Motion-Primitives | `text-effect` | **The one screen where re-firing the reveal is correct** (new content each step) — AnimatePresence key on question index |
| Mode buttons (Record / Type instead) | `Button Group` + `Button` (outline) | shadcn | `button-group button` | both ghost; "Record" slightly weightier (talking-first product) |
| Interview mic | **Reuse the bespoke Create recorder** + `Spinner` | shadcn atom | `spinner` | Same recorder component as Create (idle glow → rec → transcribe Spinner → `.qcap` ✓) |
| Type-instead box `.obtextarea` | `Textarea` | shadcn | `textarea` | electric-violet focus ring; hidden until "Type instead" |
| Answer-captured `.qcap` (green ✓) | `Text Effect` (fade) / inline span | Motion-Primitives | `text-effect` | quiet green fade; a plain CSS fade is fine — don't over-animate a status line |

### 3.8 Onboarding — Step 4: first post + AHA confirm (lines 1277–1303)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| First-post preview (postcard) | `Card` + `Avatar` | shadcn | `card avatar` | Same postcard composition as Create (user recognizes it) |
| Post-body reveal ("written in your voice") | `Text Effect` (`per:word`) | Motion-Primitives | `text-effect` | **The single most important reveal in the app** — slow, quiet, fire once |
| Confidence row (✓ No AI tells · 94%) | `Badge` + `Animated Number` | shadcn + Motion-Primitives | `badge` + `animated-number` | 94 counts 0→94% (gentle spring, no bounce); real score = honest count-up |
| AHA buttons (Yes / Not quite) | `Button Group` + `Button` | shadcn | `button-group button` | **THE conversion click** — electric-violet "Yes" + ghost "Not quite" (opens quick-fix) |

### 3.9 Create — author switch + composer + starters (lines 582–617)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| "Writing as" author switch `.seg` | `Toggle Group` + `Animated Background` | shadcn + Motion-Primitives | `toggle-group` + `animated-background` | **Canonical segmented** — white `.on` pill slides between authors; pair Avatar chip per author |
| Composer textarea (borderless 18px) | `Textarea` (restyled) in `Card` | shadcn | `textarea card` | strip border/outline, 18px/1.55, transparent bg; Card gets `--shadow-2` (the ONE focal surface) |
| "Write in my voice" CTA (`.ctapulse`) | `Button` (default electric-violet, sm) | shadcn | `button` | keep the bespoke `.ctapulse` ring (tasteful "now do this" nudge); reduced-motion: drop pulse |
| Optional focal glow on composer | `Spotlight` — **OPTIONAL** | Motion-Primitives | `spotlight` | borderline; at most this ONE card, very low-opacity electric-violet; cut if loud (hover-lift is the safe default) |
| Starter chips `.starter` + "+ Browse 14 ideas" | `Button` (outline, rounded-full, sm) | shadcn | `button` | pill buttons, electric-violet border on hover; "+ Browse" electric-violet-bordered → routes to Ideas |

### 3.10 Create — brain-dump mic (lines 592–602, JS 1359–1404)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Idle mic + breathing glow `.micbtn::after` | **Bespoke recorder** (on a `Button` atom) | shadcn atom + custom | `button` | electric-violet circle, Lucide Mic; keep the `micGlow` (scale 1→1.22, 2.6s); build the whole recorder as ONE owned component; reduced-motion freezes glow |
| Rec state: rounded-square morph + pulsing dot | **Bespoke motion** | custom | `button` | `border-radius 99px→13px` + bg→electric-violet-ink; product-specific feedback, no library |
| Live waveform `.recwave` (6 bars) | **Bespoke** animated bars | — | n/a | 6 electric-violet bars; in product drive heights off Web Audio amplitude; reduced-motion: hold at rest height |
| Rec timer "0:00" | `Sliding Number` — **OPTIONAL** | Motion-Primitives | `sliding-number` | plain tabular-nums is fine; odometer is a low-priority nicety; keep `tabular-nums` |
| Transcribe shimmer `.shim`/`.wv` | `Skeleton` | shadcn | `skeleton` | **Canonical loading** — copy verbatim; reused for generate + Discover/Repurpose loads |
| Stop button | `Button` (electric-violet, sm) | shadcn | `button` | right-aligned in `.recbar` |
| Capture-confirm `.captick` (green ✓) | `Text Effect` (fade) + `Sonner` | Motion-Primitives + shadcn | `text-effect sonner` | quiet green fade (auto-hides 4s) + toast |

### 3.11 Create — generating state (lines 614–617, JS 1332–1344)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Generating shimmer ("Writing in Sofia's voice…") | `Skeleton` | shadcn | `skeleton` | **Canonical** — same Skeleton as transcribe |
| Optional "AI working" border light | `Border Trail` — **OPTIONAL** | Motion-Primitives | `border-trail` | composer only, gated to the in-flight state, then STOP (perpetual = slop); ship Skeleton first |

### 3.12 Create — postcard preview (lines 620–628)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Post author header (avatar + name + meta) | `Item` + `Avatar` | shadcn | `item avatar` | **Canonical row** — Item header pattern; honest "now" timestamp |
| Post body `.pc-body` (pre-wrap) | `Card` content + `Text Effect` (`per:word`) on first reveal | shadcn + Motion-Primitives | `card` + `text-effect` | **Canonical reveal** — per-word on resolve, fire once; `white-space:pre-wrap` for the content |
| Default card hover (all clickable cards/rows) | `translateY` hover-lift | CSS / shadcn | none (`hover:-translate-y-0.5 hover:shadow-md`) | **Canonical default everywhere** — the mock's existing lift |
| Optional cursor-glow — single-surface experiment only | `Card Spotlight` | Aceternity | `"https://ui.aceternity.com/registry/card-spotlight.json"` | OPTIONAL, skippable. **Dark-mode-native** (ships on `bg-black` + pulls a WebGL canvas-reveal dep) — full reimplementation on light, not a recolor. Try on ONE surface, cut if loud; confirm slug first |

### 3.13 Create — confidence strip + score + "why?" panel (lines 629–640)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| "No AI tells" (green ✓) | `Badge` (success) | shadcn | `badge` | green token; real check |
| "94% sounds like you" — the score | `Animated Number` (count-up) | Motion-Primitives | `animated-number` | **THE signature count-up** — 94 ticks 0→94% via `useInView`, fire once, gentle settle, NO bounce; real value only |
| "why?" expandable panel `.whyp` (4 rows) | `Collapsible` | shadcn | `collapsible` | inline expand (matches in-flow panel); chevron rotates; faint `#FCFCFD` panel; rows = key/value grid |
| Provenance footnote `.provline` | plain text + `Separator` | shadcn | `separator` | ink3 12px, bolded source names; no component overkill |

### 3.14 Create — action bar + feedback → core-memory (lines 641–654)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Feedback buttons (Nailed it / Almost — teach Choir) | `Button Group` + `Button` (outline, sm) | shadcn | `button-group button` | two outline sm; low-pressure ask (neither electric-violet-filled) |
| "Saved to your voice memory" `.fblearn` | `Text Effect` (fade) + `Sonner` | Motion-Primitives + shadcn | `text-effect sonner` | **The flywheel moment** — quiet green ✓ line + toast; let the "core memory" copy carry it |
| Action bar `.actions` (Approve & schedule / Copy / Regenerate / Edit) | `Button Group` + `Button` (1 electric-violet + 3 ghost) | shadcn | `button-group button` | "Approve & schedule" = the ONE electric-violet CTA; Copy/Regenerate/Edit ghost; fires Sonner |
| Approve → schedule slot picker | `Calendar` + `Popover` | shadcn | `calendar popover` | mock fakes with a toast; real surface = Popover-anchored Calendar (best-window informed); flag to engineers |

### 3.15 Ideas — shell (shared across 3 modes)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| View header (h1 + subhead) | Typography (shadcn type tokens) | shadcn base | (init) | h1 → text-2xl/3xl semibold tracking-tight; subhead → muted-foreground; no motion |
| 3-mode switch (For you / Discover / Repurpose) `.seg` | `Toggle Group` + `Animated Background` | shadcn + Motion-Primitives | `toggle-group` + `animated-background` | **Canonical segmented** — inline icons (sparkle/refresh) before labels; electric-violet-soft sliding pill |

### 3.16 Ideas / For you

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Source chips `.srcchip` + dashed "+ Add source" | `Badge` (secondary, leading icon) + `Button` (outline dashed) for Add | shadcn | `badge button` | non-interactive chips = Badge; Add = dashed electric-violet-text Button |
| Belief-derived idea card `.idea` (title + provenance + pill + Write) | `Item` in `Card` | shadcn | `item card` | **Canonical row** — ItemContent = title + `.prov`, ItemActions = Write; keep `translateY` hover-lift |
| Source-category pill (beliefs=green / gap=electric-violet / news=neutral) | `Badge` (success/default/secondary) | shadcn | `badge` | **Canonical pills** — semantic colors, one-accent rule respected |
| "Write →" button | `Button` (ghost, sm) | shadcn | `button` | arrow can nudge on hover (CSS translateX, no library) |
| Idea-list reveal | `Animated Group` | Motion-Primitives | `animated-group` | **Canonical stagger** — first paint / mode-switch only |

### 3.17 Ideas / Discover ("Inspire me") — richest screen

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Search bar (icon + input + "Analyze") `.searchbar` | `Input Group` (+ `Spinner` in button) | shadcn | `input-group button spinner` | 3.x Input Group = leading icon + input + trailing button as one control; swap Analyze label for Spinner while analyzing |
| Filter row (4 selects) `.filterrow` | `Select` ×4 | shadcn | `select` | styled accessible replacement for native selects; electric-violet focus ring; small leading label each |
| Pre-analyze empty state `.discempty` | `Empty` | shadcn | `empty` | **Canonical empty** — EmptyMedia (search glyph) + title + description; no motion |
| Loading shimmer ("Analyzing top posts…") | `Skeleton` (+ optional `Border Trail`) | shadcn (+ Motion-Primitives) | `skeleton` | **Canonical loading**; optional electric-violet Border Trail on the analyzing card, stop when done |
| AI trend-breakdown card `.trendcard` (electric-violet left-border + 4 stats) | `Card` (left-border) + `Animated Number` on "3.2×" | shadcn + Motion-Primitives | `card separator animated-number` | 3px electric-violet left-border; "3.2× vs median" = real value → count-up on view-enter; non-numeric stats static; **the ONE focal insight card** |
| Optional hero-card glow (trend card) | `Card Spotlight` — **OPTIONAL, skippable single-surface experiment** | Aceternity | `"https://ui.aceternity.com/registry/card-spotlight.json"` | default hover = translateY lift; Card Spotlight is dark-mode-native (full reimplementation on light — see §4.2); try on this ONE surface, cut if loud; confirm slug first |
| "What's winning" card `.winfmt` | `Card` | shadcn | `card` | plain Card, h4 + two label lines; static |
| "Top posts analyzed" list `.apost` | `Item` (avatar + content + ♥ score) in `Card` | shadcn | `item avatar` | **Canonical row**; stagger with Animated Group |
| 5 idea cards + Format/Hook/Visual chips `.chip2` | `Item`/`Card` + `Badge` (outline) | shadcn | `item badge button` | chip = small outline Badge with electric-violet-bold key; Write = ghost; stagger on reveal |

### 3.18 Ideas / Repurpose

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| URL input (link icon + "Repurpose") `.searchbar` | `Input Group` | shadcn | `input-group button` | same pattern as Discover, link leading icon |
| Source-type chips (Blog/Podcast/YouTube/Webinar/Past post) `.srcchip.src` | `Toggle Group` (`type=single`) | shadcn | `toggle-group` | single-select rounded-full; active = electric-violet-soft fill; can share the sliding pill for consistency |
| "or paste transcript" toggle + textarea `.obtextarea` | `Button` (link) + `Textarea` | shadcn | `button textarea` | toggle reveals Textarea (rounded 12px, electric-violet focus) |
| Pre-action empty state `.discempty` | `Empty` | shadcn | `empty` | **Canonical empty** — loop/refresh glyph |
| Optional drag-drop ingest | `file-upload` — **OPTIONAL** | Watermelon UI | `npx shadcn add "https://registry.watermelon.sh/file-upload.json"` | free/MIT; only if product wants a drop-zone path; recolor accent to electric-violet; not in mock |
| Loading shimmer ("Breaking this down…") | `Skeleton` | shadcn | `skeleton` | **Canonical loading** |
| Value-summary stat bar `.repsum` (9 ways / 6 pieces / 4–6 wks) | `Card` (3 cells via `Separator`) + `Animated Number` | shadcn + Motion-Primitives | `card separator animated-number` | lead "9" is electric-violet + loudest → count-up; "6" count-up; "4–6 wks" static; `tabular-nums` |
| "What is reusable" atom list `.atomrow` | `Item` rows in `Card` + `Badge` (atom type) | shadcn | `item badge separator` | **Canonical row**; leading Badge (electric-violet-soft) + extracted text; stagger on reveal |
| Suggested-asset cards + lift pills `.liftpill` (3× reach…) | `Item`/`Card` + `Badge` (success green) + outline chips | shadcn | `item badge button` | lift pill = green success Badge inline; **keep lift pills HONEST** (static badges, only real projections animate) |

### 3.19 Queue

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Segmented filter (All / Needs approval / Scheduled) `.seg` | `Toggle Group` + `Animated Background` | shadcn + Motion-Primitives | `toggle-group` + `animated-background` | **Canonical segmented**; on change fire Sonner ("Filter: Scheduled") |
| Post row `.qrow` (avatar + title + meta + status + action) | `Item` in `Card` | shadcn | `item card avatar` | **Canonical row** — ItemMedia=Avatar, content=title(truncate)+meta, actions=Badge+Button; keep hover-lift |
| **8-state status pills** (Scheduled/Draft/Needs you+approval/Approved/Posted/Rejected/Failed/Generating) | `Badge` (status CVA → 4 colors + icon) | shadcn | `badge` | **Canonical pills** — green (Scheduled/Approved/Posted), secondary (Draft), electric-violet (Needs you/approval), amber (Generating); destructive variant for Rejected/Failed; **leading icon per state for a11y** (color is not the only signal) |
| Generating/in-flight status | `Badge` + `Spinner` | shadcn | `spinner badge` | Generating state hosts inline Spinner; optional (only if Queue surfaces in-flight gen) |
| "Team Review · 1 needs you" band `.teamband` | `Separator` (centered label) | shadcn | `separator` | label flanked by two rules; uppercase tracked; neutral (no electric-violet) |
| Approve / Reject controls | `Button Group` (Approve electric-violet + Reject outline) + `Sonner` | shadcn | `button-group button sonner` | join cleanly; fire "Post approved ✓"; the Draft row's "Review" = ghost → Create |
| Empty Queue first-run | `Empty` (+ optional unDraw SVG) | shadcn | `empty` | **Canonical empty** — inbox glyph + CTA to Ideas/Create; optional single-accent unDraw "Empty Inbox" recolored via currentColor (manual pick) |
| Queue row reveal | `Animated Group` | Motion-Primitives | `animated-group` | **Canonical stagger** — first paint / filter-change only |

### 3.20 Engage — warm-feed cards + compliance bar + in-voice draft (lines 942–1010 region)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| `.complybar` "nothing sent automatically" banner | `Alert` (quiet info variant) | shadcn | `alert` | lock icon electric-violet, **neutral surface (NOT a warning color)** — it's a trust signal; AlertDescription only, one line |
| `.feedcard` container | `Card` | shadcn | `card` | **Canonical surface** — 16px radius, `#ECECEF` border, shadow-1; subtle hover-lift; electric-violet only on verdict pill + CTA |
| `.fc-head` (avatar + name + role/account + relative time) | `Item` | shadcn | `item` | **Canonical row** — ItemMedia=Avatar, title=name, description=role+account, trailing="3h ago" |
| `.fc-av` initials avatar (RP/MT) | `Avatar` | shadcn | `avatar` | initials in AvatarFallback (no photos in Engage); neutral fallback bg |
| Fit/verdict chip (Strong fit=green / Pursue=amber) | `Badge` (success/warning) | shadcn | `badge` | **Canonical pills** — verdict color carries fit semantics; **electric-violet stays OFF** (reserved for the CTA so they never compete) |
| "Draft a comment in my voice" CTA | `Button` (default electric-violet, sm) | shadcn | `button` | the focal action; swap label for Spinner while drafting |
| Generating state | `Spinner` (in button) + optional `Skeleton` line | shadcn | `spinner skeleton` | Spinner inline (full skeleton too heavy for one comment); optional single Skeleton line ~600ms before reveal |
| `.cdmeta` confidence line (✓ Sofia's voice · 0 AI tells) | `Badge` (secondary, quiet) | shadcn | `badge` | quiet inline proof micro-label; green ✓ + muted text; Tooltip expands "0 AI tells" |
| `.cdbody` generated comment (electric-violet-soft panel) | `Text Effect` (`per:word`, fade-in-blur) | Motion-Primitives | `text-effect` | **The one motion moment on Engage** — per-word reveal on resolve, fire once; panel stays `#ebe6ff` |
| Copy & open in LinkedIn / Tweak | `Button Group` + `Button` | shadcn | `button-group button` | Copy=electric-violet, Tweak=outline; "Copy & open" fires "Copied — opening LinkedIn" |
| Copy/Tweak toasts | `Sonner` | shadcn | `sonner` | **Canonical toasts** |
| Card paint-in | `Animated Group` — **OPTIONAL** | Motion-Primitives | `animated-group` | **Canonical stagger** — first paint only; cap long feeds; ship plain paint if busy |
| Confidence-line / disabled hints | `Tooltip` | shadcn | `tooltip` | quiet, neutral surface |

### 3.21 Analytics — gamification + KPIs + proof + chart + winning-content + leaderboard (lines 1010–1130 region)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Page scaffold (KPI row + panels + leaderboard) | `Bento Grid` (**STRUCTURE ONLY**) — or hand-built shadcn grid | Aceternity (ref) | `"https://ui.aceternity.com/registry/bento-grid.json"` | take the asymmetric grid skeleton, strip 100% of gradient/skew/glow → Choir `.card` tokens; **SKIP entirely if your shadcn grid already covers it** |
| 30d / Quarter / All time switch `.seg` | `Toggle Group` + `Animated Background` | shadcn + Motion-Primitives | `toggle-group` + `animated-background` | **Canonical segmented**; range change fires Sonner |
| `.gamestrip` container | `Card` | shadcn | `card` | surface only; bespoke 3-col flex (ring \| badges \| streak) |
| `.gring` level ring ("L4" + XP arc) | `Chart` (Recharts RadialBar) — or Watermelon `gauge` | shadcn (alt Watermelon) | `chart` (alt `gauge.json`) | XP gauge (320/500 ≈ 64%); `--chart-1` electric-violet, track electric-violet-soft; "L4" static center; arc fills once via In View; **one gauge max per screen** |
| `.glvl-t/.glvl-s` ("Creator · Level 4" + "320/500 XP") | `Item` + `Progress` (linear XP option) | shadcn | `item progress` | optional linear bar beside the ring; Tooltip explains XP |
| `.gbadges` (5 badges, 2 locked) | `Badge` + `Tooltip` (locked = muted) | shadcn | `badge tooltip` | emoji + Tooltip label (a11y upgrade over `title=`); locked = desaturated + "Unlocks when…"; badges static by default (over-animating = slop) |
| `.gstreak` ("🔥 4 week streak") | `Sliding Number` | Motion-Primitives | `sliding-number` | **Canonical counter** — digit-roll on real week increment only; `tabular-nums` |
| `.kpis` (4 tiles + deltas) | `Card` + `Animated Number` + `Badge` (delta) | shadcn + Motion-Primitives | `card badge animated-number` | **THE explicitly-requested KPI ticker** — each `.kv` counts up via In View, **stagger 4 tiles ~60ms apart** (never simultaneous); `tabular-nums`; handle "6.2%"/"1,240"/"+312"; delta = quiet green-up/muted-down Badge; **real values only** |
| On-voice proof `.anbox` (96% / 214) | `Card` + `Animated Number` on `.proofbig` | shadcn + Motion-Primitives | `card animated-number` | **the metric only Choir has** — reserve count-up weight here; 96% electric-violet-ink, 214 ink; fire once; optional ONE Split-Flap flourish (see §4) |
| Consistency chart `.bars` (W1–W4 + target bars) | `Chart` (Recharts BarChart) + `In View` | shadcn + Motion-Primitives | `chart in-view` | **REAL data = honest chart**; `--chart-1` electric-violet for target-hit bars, electric-violet-soft under-target; In View fires height fill once, 0.5s ease-out + `--i*60ms`; **preserve reduced-motion branch** |
| "What's working" `.anbox` (3 top-posts + chip strip) | `Item` (top-posts) + `Badge` (chips) + `Card` | shadcn | `card item badge button` | top-post = Item row + format Badge; `.chip2` strip = flex-wrap secondary Badges; "Turn winners into ideas" = ghost Button; no motion (let data speak) |
| Team leaderboard `.anbox` (`.lbrow` rows) | `Table` + `Avatar` (illustrated SVG faces) + `Badge` | shadcn | `table avatar badge` | **REAL data = honest Table**; cols rank(medal)/avatar/name+streak/points; `.facav` SVG faces → AvatarImage (initials fallback); `.me` row = electric-violet-soft highlight + "you"; streak = small Badge; points static by default |
| Leaderboard "Invite your team" flow | `Dialog` (alt Watermelon `integration-card`) | shadcn | `dialog` | Radix focus-trap; "they inherit brand DNA, keep their own voice"; electric-violet only on "Send invite" |
| Scroll-reveal orchestration + count-up gating | `In View` | Motion-Primitives | `in-view` | **Canonical** — fire-once wrapper gating all count-ups + chart/ring fills; preserve reduced-motion |

### 3.22 Voice — Tab 1: My Voice (lines 1130–1197 region)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Zone sub-nav (My Voice / Winning content / Company) `.seg` | `Tabs` + `Animated Background` (alt Watermelon `fluid-tabs`) | shadcn + Motion-Primitives | `tabs` + `animated-background` | switches whole PAGES → `Tabs` (not Toggle Group); layer the **same** sliding electric-violet-soft pill for app-wide consistency; "Winning content" SVG icon in TabsTrigger |
| "How you sound" card (voice-tone chips + Signature/Never) | `Card` + `Badge` (`.vtag` chips) | shadcn | `card badge` | `.vd` electric-violet dot in H3; chips = secondary/outline Badges (**NOT electric-violet** — too many electric-violet chips fights the one-accent rule); Signature/Never = small ink3 |
| "What you believe" card (`.vbel` statements) | `Card` (electric-violet left-border) | shadcn | `card` | the differentiator axis; subtle electric-violet-soft left border / `.vd` dot to pair with "How you sound"; optional ONE Text Effect reveal on tab-open (quiet, once) |
| `.memcard` Core Memory (count + explainer + memitem rows) | `Card` + `Item` (rows) + `Badge` (count) — optional `Border Trail` | shadcn (+ Motion-Primitives) | `card item badge` | **the product's emotional core** — `.mdot` electric-violet dot + "47 things learned" Badge (Sliding Number if it ticks live); each `.memitem` = Item row (icon + statement + `.msrc` provenance); optional electric-violet Border Trail ONLY while "updated today" |
| "View all 47" expansion | `Dialog` (alt `Sheet`) | shadcn | `dialog sheet` | scrollable full memory list, grouped by type; rows reuse the Item pattern |
| Voice-status rows `.vbox` (Belief interview / Samples / Visibility / Deepen) | `Item` + `Badge` (status) | shadcn | `item badge` | **Canonical row** — ItemMedia=electric-violet-soft icon tile, trailing=status Badge; "Deepen your voice" = dashed-border add-row (electric-violet + plus) firing the 18-Q interview toast |
| My Voice CTAs (Write a post / Replay first-run) | `Button Group` / `Button` | shadcn | `button button-group` | "Write a post" = electric-violet → Create; "Replay first-run" = outline + play icon |

### 3.23 Voice — Tab 2: Winning Content

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| `.wcformula` "Your winning formula" callout | `Card` (electric-violet-soft tint) — optional `Card Spotlight` | shadcn (opt Aceternity) | `card` (opt `"https://ui.aceternity.com/registry/card-spotlight.json"`) | the hero insight — distinct electric-violet-soft tinted Card + bold inline emphasis. **The electric-violet-soft tint alone is enough.** Card Spotlight here is a skippable single-surface stretch goal (dark-mode-native, full reimplementation on light — see §4.2); confirm slug first |
| Format gap bars `.gapbar`/`.gaptrack` (+34% … −19%) | `Chart` (horizontal bars) or `Progress` + `In View` | shadcn + Motion-Primitives | `chart progress in-view` | **REAL per-dim data**; positive deltas electric-violet, "Think-piece −19%" in ink3; In View width fill once, `--i*60ms`; preserve reduced-motion |
| Hooks-that-work / Length & timing / Engagement `.wcdim` | `Card` + `Item` | shadcn | `card` | plain reference Cards (bold key phrases, muted underperforms line); In View can fade each card in subtly |
| "Stop doing" `.anti` rows (✕) | `Item` (✕ media icon) | shadcn | `item` | **Canonical row** — ✕ in quiet ink3 (**NOT red/electric-violet** — neutral "stop" observations, not errors); no motion |
| Pillar balance `.pillarbar` (actual vs target) | `Chart` (target-marker bars) or `Progress` + `In View` | shadcn + Motion-Primitives | `chart progress in-view` | same fill pattern; on-target (`.ok`) = electric-violet, off-target neutral; `.pv` label carries actual/target + arrow; a reference line at target % reads cleaner than two bars |
| Winning Content CTA ("Get ideas in your winning formats") | `Button` (electric-violet) | shadcn | `button` | → Ideas/Discover; no motion |

### 3.24 Voice — Tab 3: Company (Team Brand DNA)

| Element | Component | Source | Install | Treatment |
|---|---|---|---|---|
| Brand-DNA rows (Positioning / ICP & personas / Brand voice rules, all Approved) `.vbox` | `Item` + `Badge` (status) | shadcn | `item badge` | **Canonical row** — same `.vbox` pattern as My Voice; all show success "Approved" |
| "Edit brand DNA" admin CTA + editor | `Button` (ghost) → `Dialog`/`Sheet` w/ Watermelon `edit-profile` | shadcn (alt Watermelon) | `button` (editor: `edit-profile.json`) | admin-gated (Tooltip on disabled for non-admins); editor = Watermelon edit-profile (positioning/ICP/voice-rules fields), torn down to Choir's field set + recolored neutral+electric-violet |

---

## 4. PREMIUM / MOTION NOTES

**Doctrine:** motion is for hierarchy and feedback, **never decoration**. Ship ONE tasteful moment per screen, not motion everywhere. Default to SUBTRACT.

### 4.1 The earned motion moments (the whole app's motion budget)

| Moment | Component | Where | Intensity |
|---|---|---|---|
| **Magic-move pill** (highest polish-per-line) | `Animated Background` | EVERY `.seg` + rail/tab active state + Voice tabs | shared `layoutId`, electric-violet-soft `#ebe6ff` |
| **Confidence/score count-up** | `Animated Number` | Create score (94%), AHA step, on-voice proof (96%/214) | gentle spring, no bounce, fire once, REAL values only |
| **KPI tickers** | `Animated Number` | Analytics 4 KPIs + Discover "3.2×" + Repurpose "9 ways" | stagger ~60ms, In View-gated, `tabular-nums` |
| **"Composing in your voice" reveal** | `Text Effect` (`per:word`, fade-in-blur) | post body, comment draft, onboarding hero, rotating question | quiet, fire once (never loop) |
| **Odometer counters** | `Sliding Number` | streak, core-memory count | roll on real value change only |
| **List stagger** | `Animated Group` | idea lists, Queue, Engage feed, top-posts, atom rows | ~50–70ms, first paint only, cap long lists |
| **Dataviz fills** | `In View` (triggers `Chart`/Progress) | consistency chart, gap/pillar bars, XP ring | fire once, 0.5s ease-out, reduced-motion = final size |
| **Smooth scroll** (zero aesthetic cost, highest leverage) | Lenis | app-root `.main` scroll container | subtle inertia; disable under reduced-motion |

### 4.2 Optional flourishes (ship only if they lift the screen — default skip)

- **Card Spotlight** (Aceternity, free) — **skippable single-surface experiment, NOT a default.** The translateY hover-lift is the unambiguous default for every card in the app. Card Spotlight is **dark-mode-native**: the registry item ships on `bg-black` and pulls a WebGL `canvas-reveal-effect` dep (`@react-three/fiber` + `three` + a hardcoded blue/purple shader). Making it electric-violet-soft-on-white is a **full reimplementation, not a recolor** — the cost is real. If the team wants to try it, do so on exactly ONE surface (Discover trend card OR Winning-Formula callout), confirm the slug on ui.aceternity.com, and cut it the moment it reads loud. The team may skip it entirely with zero loss.
- **Border Trail** (Motion-Primitives) — electric-violet trace on the composer OR memcard, **gated to the active generating/updating state only**, then STOP. Ship Skeleton/static first.
- **Spotlight** (Motion-Primitives) — cursor-glow on the ONE composer focal card; borderline, low opacity, cut if loud.
- **Split-Flap Display** (Componentry, free) — mechanical flip on AT MOST one hero proof stat. Sliding Number is the quieter default; reserve Split-Flap for a single deliberate "wow".

### 4.3 Anti-slop guardrails (enforce on every PR)

1. **ONE electric-violet accent** (`#761fff`). Electric-violet lives on: primary CTA, active nav/segment pill, focus ring, ONE KPI/proof highlight, chart target bars, voice dots, the winning-formula tint, the "human input required" dashed card. Verdict/status colors (green/amber) stay **semantically separate** so they never fight the accent. Too many electric-violet chips = slop.
2. **Harvest bones, burn skin.** Every Aceternity/Skiper/Componentry import: recolor 100% to Choir tokens, halve motion duration, convert `framer-motion` → `motion/react`.
3. **Fire-once, never loop.** Every reveal/count-up fires on resolve/view-enter once. Looping motion is slop.
4. **`prefers-reduced-motion` honored everywhere** via the project SSR-safe hook (NOT library handling). Mock already freezes the mic meter + renders dataviz at final size — preserve it.
5. **Honesty rule.** Only animate REAL values. Never count up a fabricated metric. Charts/Tables are legitimate here ONLY because Analytics shows real product data.
6. **Polish-cap caution.** At most ~3–4 Aceternity/registry motion components in the app interior; one motion moment per viewport.

### 4.4 BANNED for Choir (the "AI slop" register — what NOT to do)

- **All Aceternity loud-school effects:** Aurora Background, Background Beams (+Collision), Meteors, Vortex, Wavy Background, Shooting Stars, Sparkles, Spotlight-New (dual-beam dark), Evervault Card, Glowing Effect (neon border), Background Gradient Animation, 3D Card/Comet/Wobble/3D Marquee, Container Scroll 3D-rotate, all Shaders/Dither/Pixelated/Webcam-Pixel, gimmick text (ASCII Art, Encrypted Text, Typewriter, Squiggly).
- **All cursor-particle / WebGL / kinetic-decorative type:** Text Scramble/Shimmer/Spinning, particle typography, Matrix Rain, magnetic dock, tilt, custom cursor.
- **Most of Componentry.fun** (Orbit Stack, Layered Stack, Magnetic Dock, Eye Tracking) — dark-neon maximalist. Only Spotlight Card + Split-Flap survive the restraint filter.
- **Skiper** Image Cursor Trail (skiper18), Dynamic Island (skiper2 — fake device chrome), creative carousels (skiper50/51).
- **21st.dev for interior app screens** — its neon-gradient default is the wrong register; use Motion-Primitives free equivalents. 21st is acceptable ONLY on onboarding reveal screens, and only if a specific variant materially beats the free equivalent.
- **ShaderGradient inside the product app** — at most ONE slow grainy electric-violet→neutral hero wash on a marketing/login screen, exported as WebM (no Three.js in the app bundle). Inside the app: a flat electric-violet-tinted surface is the premium default.

---

## 5. UX-REFERENCE — ground each build against real shipped flows

Use Mobbin (flows + microcopy) and Refero (clean-premium aesthetic cluster) to ground generation BEFORE building each screen. These are **taste-setting / study references — never copyable assets, never clone an identity.**

| Choir screen | Reference (study, don't copy) | What to mine |
|---|---|---|
| App shell / nav | **Linear, Raycast** (Refero cluster) | icon-rail restraint, ⌘K palette, active-state motion |
| Onboarding (react-don't-fill, voice interview, AHA) | **Mobbin** onboarding + setup-wizard flows | step pacing, progress affordances, confidence-as-trust, the activation/aha moment structure |
| Create / composer | **Notion, Linear** editors (Refero) | borderless composer restraint, focal-surface elevation, inline action rows |
| Ideas / Discover & Repurpose | **Mobbin** content-discovery + search-result flows; **Taplio** (the filter-row inspiration named in the mock) | search → filter → empty/loading/result state transitions, filter density |
| Queue / scheduling | **Mobbin** content-calendar + scheduling flows | status-pill systems, approval rows, schedule-slot pickers |
| Engage | **Mobbin** feed + social flows | warm-feed card density, compliance/trust banners, inline-draft affordance |
| Analytics | **Mobbin** dashboard flows; **Vercel, Linear** dashboards (Refero) | KPI tile composition, honest dataviz, leaderboard density (study Watermelon `lead-dashboard` as a strip-down skeleton — do NOT ship its stock SaaS styling) |
| Voice / settings | **Mobbin** settings + profile flows | settings-row pattern, status surfaces, admin-gated editors |
| Microcopy (everywhere) | **Mobbin** "Text in Screenshots" axis | shipped UX writing so Choir's copy sounds shipped, not generated |

**Free now (no Pro needed):** copy a clean-premium **Refero DESIGN.md** (Linear/Vercel/Cursor) into the build-agent context before generating any screen — it defaults the output to restraint. Watermelon templates are **free/MIT layout-skeleton references** (strip to skeleton, rewire to Choir metrics, never ship stock styling — that stock SaaS texture IS the slop register the owner rejects).

---

## APPENDIX — install-command audit (de-dup proof)

- **shadcn base:** 31 components in one batched command (§2.1). Every recurring element resolves to a canonical shadcn primitive — no duplicate installs across screens.
- **Motion-Primitives:** 6 core + 2 optional (§2.2). Six components cover ALL ~30 motion moments via reuse (`Animated Background` alone serves 7+ segmented controls + 2 nav states).
- **Aceternity:** 4 (free tier), install-on-use, by per-component registry URL (no `@aceternity` CLI namespace — confirm each slug on ui.aceternity.com). Card Spotlight is a skippable single-surface stretch goal (dark-mode-native — full reimplementation on light); NumberTicker is a pick-ONE alt to Motion-Primitives' Animated Number.
- **Optional registry:** 5 Watermelon + 1 Componentry, install-on-use only.

**Net handoff:** the §2 manifest = the complete bootstrap. Everything else is owned source the team restyles to the tokens in §1.2.

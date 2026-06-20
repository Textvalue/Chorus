# Tutti — Design System

> **Your team. In tune. Your brand. Heard everywhere.**
> *Alone we can do so little. Together we make music.*

Tutti is the **team content OS**: it turns a company's strategy and each person's real voice into on-brand content that plays beautifully together — so a whole team sounds like one brand, while every post still sounds human. The wedge is **harmony, not unison**: competitors push the *same* corporate post to every employee; Tutti gives each person their instrument, tunes it to one score, and lets the whole team play.

This repository is the brand's design system — tokens, components, brand assets, and a full app UI kit — for building Tutti interfaces and on-brand artifacts.

**The guiding rule, inherited by every screen and every line of copy:**
**off-key means the tool hasn't learned you yet — never that your writing is bad.** The instrument is untuned, not the player untalented.

## Sources

- `uploads/ChatGPT Image 20. lip 2026. 02_47_57.png` — the master brand sheet (logo, palette, type, icon style, character illustrations, badges, venue ladder, app-screen mockups). All brand assets in `assets/` are extracted from this sheet.
- Tutti PRD v1.0 (2026-06-20) — product, brand, voice, and technical spec. The metaphor map (Tuning, the Score, Your Part, Sounds Flat, the venue ladder) is the product architecture, not decoration.

---

## Content fundamentals

Tutti talks like **a great bandleader: warm, encouraging, direct, a little witty — never corporate, never hypey.** The voice must pass its own *Sounds Flat* gate: if a sentence reads like AI marketing, it's wrong.

- **Person & address.** Second person, "you / your team." Warm and direct, like explaining it to a friend.
- **Casing.** Sentence case everywhere — headings, buttons, nav. The only all-caps is the small eyebrow/overline label (e.g. `ONBOARDING · TUNING`). The wordmark is always lowercase `tutti`.
- **Sentence shape.** Short. Plain words. Real specifics (a named entity, a number, a dated story). No em-dash pile-ups, no curly-quote slop.
- **Encourage, never scold.** *"This might squeak a bit"* — self-aware and kind, not a warning. Reject is "a correction, not a failure."
- **Use the metaphor lightly.** Lean in where it's natural (tuning, off-key, theme & variations, rehearsal, in tune). Drop it where it'd be twee — billing, settings. Never force music onto every screen.
- **Emoji.** Sparingly and purposefully — a streak 🔥, a musical note ♪ as a marker. Not decorative confetti. Icons do most of the work.
- **Numbers carry meaning.** "96% sounds like you", "12.4M impressions", "Level 12 · 12-day streak" — every stat ties to real value (approved on-voice posts, real reach, corrections that improved the model), never raw generation count.

**Words & tells to avoid:** delve · game-changer · revolutionary · unlock (overused) · "in today's fast-paced world" · synergy · paradigm shift · em-dash pile-ups · anything that sounds like a press release.

**Sample lines:** *Harmony, not unison.* · *One score, every voice.* · *From first note to full stadium.* · *We catch the off-brand notes before they go live.* · *In tune — 96% sounds like you.*

---

## Visual foundations

**Overall principle: editorial-clean meets warm-playful.** Serious enough for a CRO to trust; delightful enough that people screenshot their badges and their "sold-out theater."

- **Color.** Navy `#0B1833` ink keeps it B2B-credible. Blue `#2563EB` is the primary action. The **dual accent is intentional: teal `#1488A6` carries the musical, brand-soul moments; green `#22C55E` signals "on key," success, and growth.** Slate `#64748B` for secondary text, gray `#E5E7EB` for lines/surfaces. Tints/shades are derived in `tokens/colors.css`. Avoid bluish-purple gradients — they aren't part of this brand.
- **Type.** Inter throughout — Bold/Extrabold for headings (clean, authoritative), Regular for body (clear, readable). Display sizes use tight tracking (`-0.02em`). No serif, no second display face (an optional later lever, not used here).
- **Spacing.** 4px base grid (`--space-1`…`--space-24`). Generous card padding (24px default). Comfortable, not dense.
- **Backgrounds.** Light and airy: page is `--gray-50`, cards are white. No full-bleed photography, no repeating textures, no heavy gradients. The two accent gradient chips (teal, green) appear only on small brand-soul moments. The one rich, atmospheric image is the **stadium** (the "fill the stadium" reach payoff).
- **Cards.** White, **hairline 1px border** (`--border-subtle`), **soft rounding** (`--radius-lg` = 16px), and a **gentle navy-tinted shadow** (`--shadow-sm`). Interactive cards lift `-2px` with `--shadow-md` on hover. Never a colored left-border accent stripe.
- **Corner radii.** Inputs/buttons 12px (`--radius-md`), cards 16px, pills/badges fully round.
- **Shadows.** Soft, low-spread, navy-tinted (`rgba(11,24,51,…)`), four steps xs→lg. No hard black drop shadows.
- **Animation.** Gentle and encouraging. Standard ease `cubic-bezier(0.4,0,0.2,1)`; a soft-overshoot spring (`--ease-spring`) reserved for wins (badges, the in-tune ring filling). Durations 120/200/320ms. No harsh snaps, no infinite decorative loops.
- **Hover / press.** Hover = a step-darker fill (primary→`--blue-600`) or a `--gray-100` wash on ghost/secondary. Press = `translateY(1px)`. Focus = a 3px soft-blue ring (`--ring`).
- **Imagery vibe.** Warm, friendly, **lightly hand-drawn character illustrations** are the emotional core — the musician avatar with expressive states (squeaky & unsure → confident & in tune), the instruments, the venues, the orchestra. Approachable, never corporate-flat. Skin/wood tones are warm; backgrounds neutral. This is what makes Tutti shareable.

---

## Iconography

- **Style:** simple, consistent, purposeful **line icons** — one weight (~1.8px stroke), round caps/joins, one personality. Subjects: note, people, star, waveform, check, growth chart, tuning bars.
- **Where they live:** `ui_kits/tutti-app/icons.jsx` defines the in-house set as plain inline SVG (`window.TuttiIcons`). Reuse these rather than hand-rolling new ones. They match the brand sheet's "icon style" panel.
- **Substitution note:** the set is hand-authored to the brand's line-icon spec (it is *Lucide-adjacent* in weight and feel). If you prefer a CDN set for breadth, [Lucide](https://lucide.dev) is the closest match (same 1.8 stroke, round caps) — swap it in and keep the single-weight rule.
- **Emoji:** used only as occasional accent markers (🔥 streak, ♪ instrument). Never as primary iconography.
- **The spark:** the teal/green four-point spark on the second *t* of the wordmark is the brand's signature mark — "the little click of getting it right." It works alone as the app icon (`assets/spark.png`).

---

## Index — what's in this system

**Foundations**
- `styles.css` — global entry (import this). Imports the token files + base element styles.
- `tokens/colors.css` · `typography.css` · `spacing.css` · `elevation.css` (radius/shadow/motion) · `fonts.css` (Inter via Google Fonts) · `base.css`.
- `guidelines/*.card.html` — specimen cards rendered in the Design System tab (palette, accents, scales, type, spacing, radius/elevation, logo, illustrations, badges, venue ladder, voice & tone).

**Components** (`components/`) — reusable React primitives, namespace `window.DesignSystem_42715e`:
- `buttons/` — **Button** (primary/accent/success/secondary/ghost), **IconButton**
- `forms/` — **Input**, **Textarea**, **Switch**, **Checkbox**
- `data-display/` — **Card**, **Badge**, **Avatar** (with instrument marker), **Stat**
- `feedback/` — **TuneScore** (the signature in-tune ring), **ProgressBar**, **ProgressMeter**
- `navigation/` — **Tabs**, **StepNav**

**UI kit** (`ui_kits/tutti-app/`) — interactive recreation of the Tutti app: Studio (dashboard), Create (the Sounds-Flat magic moment), Rehearsal (approval queue), Ensemble (team + unison alarm), Tuning (onboarding). Open `index.html`.

**Assets** (`assets/`) — `logo-wordmark.png`, `spark.png`, musician illustrations (`musician-unsure`, `musician-learning`, `musician-tuning`, `musician-confident`), `ensemble.png`, `stadium.png`, badges (`badge-first-note`, `-on-key`, `-rising-star`, `-encore`), `venue-ladder.png`, `personas-strip.png`.

**SKILL.md** — Agent-Skill front matter so this system can be used directly in Claude Code.

---

## Caveats

- **Fonts** are loaded from Google Fonts (no local Inter binaries were provided). Swap in self-hosted `.woff2` files in `tokens/fonts.css` for offline/pinned use.
- **Illustrations & badges** are raster crops from the single brand sheet (white backgrounds, not transparent PNGs). They're used with `mix-blend-mode: multiply` on light surfaces in the kit. For production, request transparent vector/PNG exports.

# Penkala — marketing site

The public Penkala landing site. Self-contained Next.js app that lives in this
subfolder of the Chorus repo and deploys independently.

- **Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Geist · shadcn
- **Routes:** `/` (home) · `/product` · `/pricing` · `/about`
- **Theme:** light by default, dark-mode toggle in the nav (persists per visitor)

## Run locally

```bash
cd landing-page
npm install
npm run dev        # http://localhost:3007
```

## Deploy (Vercel)

This folder deploys on its own. In the Vercel project, set **Root Directory =
`landing-page`** — Vercel auto-detects Next.js and builds it. Every push to
`main` redeploys; pull requests get their own preview URL.

```bash
npm run build      # production build (what Vercel runs)
```

## Structure

```
app/              routes + globals.css (brand tokens) + layout (theme script)
components/
  site/           Nav, Footer, ThemeToggle
  shared/         Section, PageHero, ScreenFrame, CtaBand, FaqAccordion
  home/ product/ pricing/   per-page sections
  anim/           CSS concept animations (waveform, idea pulse, learning loop…)
  brand/          Logo, CTAs, accents
public/logo-mark.png   the violet P-nib mark
```

Brand: electric-violet `#761fff`, Geist, warm-neutral surfaces. Copy is written
in an editorial, anti-slop register.

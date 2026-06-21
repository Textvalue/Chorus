// Turn a post into an image prompt. Uses the build-spec's visual-gen method
// (choir-backend-build-spec/integrations/integration-spec.md §5): a Brand-DNA visual modifier
// prepended to a 5-block prompt template (FORMAT / BRAND&COLOR / ZONE-BY-ZONE / ELEMENT-DIFF / VIBE),
// plus the regenerate-on-typo guard (spelling must be correct). Engine = OPENROUTER_IMAGE_MODEL
// (default google/gemini-3.1-flash-image), with optional reference images (brand logo, author headshot).
import type { Org, Post } from "./types";

export type ImageKind = "image" | "infographic";

// One carousel slide (4:5, 1080x1350 per the spec). Same brand modifier + 5-block method.
export function buildCarouselSlidePrompt(
  slide: { kind: string; title: string; body: string },
  org: Org,
  index: number,
  total: number
): string {
  return [
    brandModifier(org),
    ``,
    `BLOCK 1 — FORMAT & LAYOUT: A single portrait (4:5) LinkedIn carousel slide, ${index + 1} of ${total}.`,
    `Large bold title in the upper third, supporting line(s) below, lots of breathing room.`,
    `BLOCK 2 — BRAND & COLOR: near-black ink #18181B text on off-white #F7F7F8, electric-violet #761FFF accents.`,
    `BLOCK 3 — ZONE-BY-ZONE: a small "${index + 1}/${total}" marker top-left; TITLE = "${slide.title}";`,
    `BODY = "${slide.body}"; a thin electric-violet rule + "${org.name}" small at the bottom.`,
    `BLOCK 4 — ELEMENT: one simple relevant line icon supporting the idea, not decorative clutter.`,
    `BLOCK 5 — VIBE & FINISH: clean, modern, consistent with the other slides in the set. Calm, premium.`,
    ``,
    `ALL TEXT MUST BE SPELLED CORRECTLY and legible. Render exactly the title and body text given above.`,
  ].join("\n");
}

// §5.1 Brand-DNA Prompt Modifier — a short paragraph prepended to every image prompt so visuals stay
// on-brand. We don't scrape brand hex yet, so we derive a clean, consistent palette + mood from the org.
function brandModifier(org: Org): string {
  return [
    `Brand: ${org.name}. ${org.positioning}`,
    `Visual identity: confident, modern B2B. Palette — electric-violet #761FFF, deep violet #5A0BCC,`,
    `near-black ink #18181B, warm off-white #F7F7F8, soft lavender #EBE6FF. Clean geometric sans-serif type.`,
    `Generous negative space, soft shadows, subtle depth. Editorial tech aesthetic — never stocky,`,
    `clip-arty, or neon. No logos, no real faces.`,
  ].join(" ");
}

export function buildImagePrompt(post: Post, org: Org, kind: ImageKind): string {
  const topic = post.topic || post.body.split("\n")[0];
  const modifier = brandModifier(org);

  if (kind === "infographic") {
    return [
      modifier,
      ``,
      `BLOCK 1 — FORMAT & LAYOUT: A single square (1:1) LinkedIn infographic. A bold title bar at the top,`,
      `then 3 to 5 numbered key points stacked vertically, each with a simple line icon. Tidy grid, aligned.`,
      `BLOCK 2 — BRAND & COLOR: near-black ink #18181B text on off-white #F7F7F8, electric-violet #761FFF accents for numbers/icons.`,
      `BLOCK 3 — ZONE-BY-ZONE: HEADER = the post's core claim as a short bold title. CORE = the 3-5 points,`,
      `each one short phrase + one supporting line. FOOTER = a thin electric-violet rule with "${org.name}" small, lower-right.`,
      `BLOCK 4 — ELEMENT DIFFERENTIATION: give each numbered point a distinct, relevant icon (not repeated).`,
      `BLOCK 5 — VIBE & FINISH: modern, calm, lots of white space, crisp legible type, gentle shadows.`,
      ``,
      `ALL TEXT MUST BE SPELLED CORRECTLY and easy to read. Pull the points from this post:`,
      post.body.slice(0, 900),
    ].join("\n");
  }

  return [
    modifier,
    ``,
    `BLOCK 1 — FORMAT & LAYOUT: A single square (1:1) conceptual illustration for a LinkedIn post. No text.`,
    `BLOCK 2 — BRAND & COLOR: the brand palette above — electric-violet, deep violet, off-white, ink.`,
    `BLOCK 3 — SUBJECT: capture this idea metaphorically and cleanly: "${topic}".`,
    `BLOCK 4 — COMPOSITION: one clear focal metaphor, balanced, lots of negative space. Absolutely no words.`,
    `BLOCK 5 — VIBE & FINISH: editorial, premium, minimal, soft light.`,
    ``,
    `Concept context (do not render literally as text): ${post.body.slice(0, 400)}`,
  ].join("\n");
}

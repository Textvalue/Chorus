// Turn a post into an image prompt. Uses the build-spec's visual-gen method
// (choir-backend-build-spec/integrations/integration-spec.md §5): a Brand-DNA visual modifier
// prepended to a 5-block prompt template (FORMAT / BRAND&COLOR / ZONE-BY-ZONE / ELEMENT-DIFF / VIBE),
// plus the regenerate-on-typo guard (spelling must be correct). Engine = Nano Banana 2
// (Gemini 3.1 Flash Image), the spec's default for infographics + text rendering.
import type { Org, Post } from "./types";

export type ImageKind = "image" | "infographic";

// §5.1 Brand-DNA Prompt Modifier — a short paragraph prepended to every image prompt so visuals stay
// on-brand. We don't scrape brand hex yet, so we derive a clean, consistent palette + mood from the org.
function brandModifier(org: Org): string {
  return [
    `Brand: ${org.name}. ${org.positioning}`,
    `Visual identity: confident, modern B2B. Palette — deep navy #14233A, crisp teal #1F9D8A, warm off-white`,
    `#F6F4EF, soft slate grey. Clean geometric sans-serif type. Generous negative space, soft shadows,`,
    `subtle depth. Editorial tech aesthetic — never stocky, clip-arty, or neon. No logos, no real faces.`,
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
      `BLOCK 2 — BRAND & COLOR: navy #14233A text on off-white #F6F4EF, teal #1F9D8A accents for numbers/icons.`,
      `BLOCK 3 — ZONE-BY-ZONE: HEADER = the post's core claim as a short bold title. CORE = the 3-5 points,`,
      `each one short phrase + one supporting line. FOOTER = a thin teal rule with "${org.name}" small, lower-right.`,
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
    `BLOCK 2 — BRAND & COLOR: the brand palette above — navy, teal, off-white, slate.`,
    `BLOCK 3 — SUBJECT: capture this idea metaphorically and cleanly: "${topic}".`,
    `BLOCK 4 — COMPOSITION: one clear focal metaphor, balanced, lots of negative space. Absolutely no words.`,
    `BLOCK 5 — VIBE & FINISH: editorial, premium, minimal, soft light.`,
    ``,
    `Concept context (do not render literally as text): ${post.body.slice(0, 400)}`,
  ].join("\n");
}

// Turn a post into an image prompt. Two modes: a clean editorial illustration (no text), or an
// infographic that renders the post's key points as legible text. Kept tasteful and on-brand.
import type { Org, Post } from "./types";

export type ImageKind = "image" | "infographic";

const STYLE =
  "Clean, modern, professional. Muted confident palette, lots of negative space, soft shadows. " +
  "Editorial tech aesthetic, not stocky or clip-arty. No logos, no watermarks, no faces of real people.";

export function buildImagePrompt(post: Post, org: Org, kind: ImageKind): string {
  const topic = post.topic || post.body.split("\n")[0];

  if (kind === "infographic") {
    return [
      `Design a single LinkedIn infographic (square, 1:1) that summarizes this idea for ${org.name}.`,
      `Topic: ${topic}`,
      ``,
      `Pull 3-5 short, punchy key points from the post below and lay them out as a clear, legible infographic`,
      `(numbered list, simple icons, or a tidy comparison). Text must be spelled correctly and easy to read.`,
      `A short bold title at the top. ${STYLE}`,
      ``,
      `POST:\n${post.body.slice(0, 900)}`,
    ].join("\n");
  }

  return [
    `Create a single LinkedIn post image (square, 1:1) — a tasteful conceptual illustration for this idea.`,
    `Topic: ${topic}`,
    `Capture the concept metaphorically. Do NOT put any words or text in the image. ${STYLE}`,
    ``,
    `Context (for the concept, not to render literally): ${post.body.slice(0, 400)}`,
  ].join("\n");
}

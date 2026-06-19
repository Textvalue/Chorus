// Verbatim-anchored generation prompt (plan.md §5). Inline REAL samples + TRUE facts + ban-list.
// Never generate against an abstract voice description alone — that's the path to consultancy slop.
import type { Org, Member } from "./types";
import { BAN_LIST } from "./antislop";
import type { SlopViolation } from "./antislop";

/** Stable per-member prefix — cacheable. Brand DNA + voice + samples + facts. */
export function buildSystemPrompt(org: Org, member: Member): string {
  const trueFacts = [
    `Company: ${org.name} — ${org.positioning}`,
    `Audience: ${org.brand_dna.narrative_atoms.audience}`,
    `Problem we solve: ${org.brand_dna.narrative_atoms.problem}`,
    `Outcome we deliver: ${org.brand_dna.narrative_atoms.outcome}`,
    `Proof: ${org.brand_dna.narrative_atoms.proof}`,
    `Author: ${member.name}${member.headline ? `, ${member.headline}` : ""}`,
  ];

  const corrections = member.corrections.slice(-6).map((c) => {
    if (c.kind === "edit") return `- The author edited a draft: changed "${trunc(c.before)}" → "${trunc(c.after)}".`;
    if (c.kind === "reject") return `- The author rejected a draft about "${c.topic}". Avoid that approach.`;
    return `- Note from author: ${c.note}`;
  });

  return [
    `You write LinkedIn posts AS ${member.name}. You must sound exactly like them — not like a brand, not like a consultant, not like AI.`,
    ``,
    `## How ${member.name} actually writes (HOW)`,
    `Traits: ${member.voice_dna.traits.join(", ")}`,
    `Sentence patterns: ${member.voice_dna.sentence_patterns.join("; ")}`,
    `Signature terms they really use: ${member.voice_dna.signature_terms.join(", ")}`,
    `Never use these: ${member.voice_dna.phrases_to_avoid.join(", ")}`,
    ``,
    `## What ${member.name} believes (WHAT) — the POV, the defensible half`,
    `Beliefs: ${member.expert_pov.beliefs.join(" | ")}`,
    `Hot takes: ${member.expert_pov.hot_takes.join(" | ")}`,
    `Topics they own: ${member.expert_pov.topics.join(", ")}`,
    ``,
    `## REAL posts they wrote (anchor your voice to THESE verbatim — match rhythm, length, punctuation)`,
    ...member.prose_samples.map((s, i) => `### Sample ${i + 1}\n${s}`),
    ``,
    `## TRUE facts (never contradict; never invent metrics not implied here)`,
    ...trueFacts.map((f) => `- ${f}`),
    ``,
    `## Brand voice rules`,
    ...org.brand_dna.voice_rules.map((r) => `- ${r}`),
    corrections.length ? `\n## Learned corrections (respect these)\n${corrections.join("\n")}` : ``,
    ``,
    `## Hard rules`,
    `- No em-dashes (use periods). No curly quotes. Max 2 hashtags, ideally zero.`,
    `- Banned words/phrases: ${BAN_LIST.join(", ")}.`,
    `- Open with a real, specific hook. Short lines. White space. Sound human and a little spiky.`,
    `- One clear POV per post. End with a question or a sharp line, not a CTA.`,
  ].join("\n");
}

export function buildUserPrompt(topic: string, angle: string, retryViolations?: SlopViolation[]): string {
  const base = `Write one LinkedIn post.\nTopic: ${topic}\nAngle: ${angle || "your sharpest take"}`;
  if (!retryViolations?.length) return base;
  return [
    base,
    ``,
    `Your previous attempt FAILED the anti-slop check. Fix every one of these and rewrite from scratch:`,
    ...retryViolations.map((v) => `- ${v.rule}: ${v.detail}`),
  ].join("\n");
}

function trunc(s = "", n = 80) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

// Generation system prompt, assembled in three layers:
//   L1  Universal writing guidelines  ← writing-guidelines/SYSTEM-PROMPT.md (the craft: hooks,
//       frameworks, anti-slop, platform rules). Same for everyone, cache-friendly first.
//   L2  Company context (from the website / Exa research) — brand DNA, ICP, true facts.
//   L3  Writer context (from their LinkedIn / Harvest) — voice DNA, POV, verbatim prose samples.
// The cardinal rule (stated in L1): the real prose samples in L3 govern voice — on conflict, match them.
import { readFileSync } from "fs";
import path from "path";
import type { Org, Member } from "./types";
import type { SlopViolation } from "./antislop";

// --- L1: load the writing-guidelines prompt once. Placeholders are repointed at L2/L3 below. ---
const GUIDELINES_FALLBACK = [
  "You write LinkedIn posts that sound like a specific real person — not like a brand, not like AI.",
  "Open with a sharp 6-8 word hook. Short lines, white space. One framework, one clear CTA.",
  "No em-dashes, no curly quotes, max 2 hashtags. No corporate/AI filler words.",
  "The writer's real posts (below) are the source of truth for voice — match them.",
].join("\n");

const GUIDELINES: string = (() => {
  try {
    const raw = readFileSync(path.join(process.cwd(), "writing-guidelines", "SYSTEM-PROMPT.md"), "utf8");
    return raw
      .replaceAll("{{BRAND_DNA}}", "(provided in COMPANY CONTEXT below)")
      .replaceAll("{{VOICE_SAMPLES}}", "(provided in WRITER CONTEXT below — their real posts, verbatim)")
      .replaceAll("{{POV_AND_CORRECTIONS}}", "(provided in WRITER CONTEXT below)")
      .replace(/Write one LinkedIn post about:\s*\n\{\{TOPIC\}\} — angle: \{\{ANGLE\}\}/, "(The specific post brief is in the next message.)")
      .replaceAll("{{TOPIC}}", "(see the brief in the next message)")
      .replaceAll("{{ANGLE}}", "");
  } catch {
    return GUIDELINES_FALLBACK;
  }
})();

// L2 company context — the website research, as a standalone block so other generation paths
// (e.g. the Ideas route) can ground their output in the same true facts the post writer uses.
export function buildCompanyContext(org: Org): string {
  const atoms = org.brand_dna.narrative_atoms;
  return [
    `# COMPANY CONTEXT${org.website ? ` — researched from ${org.website}` : ""}`,
    `These are TRUE facts. Never contradict them and never invent metrics beyond them.`,
    ``,
    `Company: ${org.name} — ${org.positioning}`,
    `Audience: ${atoms.audience}`,
    `Problem we solve: ${atoms.problem}`,
    `Outcome we deliver: ${atoms.outcome}`,
    `Proof: ${atoms.proof}`,
    atoms.offer ? `Offer: ${atoms.offer}` : ``,
    org.icp.personas.length
      ? `\nWho we sell to (personas):\n` + org.icp.personas.map((p) => `- ${p}`).join("\n")
      : ``,
    org.icp.pains.length
      ? `\nAudience pains (each with the recurring moment it's felt — strong hook material):\n` +
        org.icp.pains.map((p) => `- ${p.pain} — felt: ${p.weekly_trigger} [${p.severity}]`).join("\n")
      : ``,
    org.competitors.length
      ? `\nCompetitors (context only — do not name them in a post): ${org.competitors.map((c) => c.name).join(", ")}`
      : ``,
    org.brand_dna.voice_rules.length
      ? `\nBrand voice rules:\n` + org.brand_dna.voice_rules.map((r) => `- ${r}`).join("\n")
      : ``,
  ].filter(Boolean).join("\n");
}

export function buildSystemPrompt(org: Org, member: Member): string {
  // --- L2: company context (the website research) ---
  const companyContext = buildCompanyContext(org);

  // --- L3: writer context (their LinkedIn voice) ---
  const corrections = member.corrections.slice(-6).map((c) => {
    if (c.kind === "edit")
      return c.note
        ? `- They asked for this change and it stuck: "${c.note}". Apply the same preference going forward.`
        : `- They edited a draft: "${trunc(c.before)}" → "${trunc(c.after)}".`;
    if (c.kind === "reject") return `- They rejected a draft about "${c.topic}". Avoid that approach.`;
    return `- Note from them: ${c.note}`;
  });

  const writerContext = [
    `# WRITER CONTEXT — you are writing AS ${member.name}${member.headline ? `, ${member.headline}` : ""}`,
    `This is the voice source of truth. It outranks every guideline above on voice — match it.`,
    ``,
    `## How ${member.name} writes`,
    `Traits: ${member.voice_dna.traits.join(", ")}`,
    `Sentence patterns: ${member.voice_dna.sentence_patterns.join("; ")}`,
    `Signature terms they really use: ${member.voice_dna.signature_terms.join(", ")}`,
    `Words they never use: ${member.voice_dna.phrases_to_avoid.join(", ")}`,
    ``,
    `## What ${member.name} believes (their POV — the defensible half)`,
    `Beliefs: ${member.expert_pov.beliefs.join(" | ")}`,
    `Hot takes: ${member.expert_pov.hot_takes.join(" | ")}`,
    `Topics they own: ${member.expert_pov.topics.join(", ")}`,
    ``,
    `## ${member.name}'s REAL posts — study rhythm, length, and punctuation; sound like THIS`,
    ...member.prose_samples.map((s, i) => `### Sample ${i + 1}\n${s}`),
    corrections.length ? `\n## Learned corrections (respect these)\n${corrections.join("\n")}` : ``,
  ].filter(Boolean).join("\n");

  return [GUIDELINES, companyContext, writerContext].join("\n\n---\n\n");
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

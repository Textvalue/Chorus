// Builds the LinkedIn profile-optimizer system prompt from writing-guidelines/PROFILE-OPTIMIZER-PROMPT.md,
// grounded in the company context (who they sell to) and the member's real voice.
import { readFileSync } from "fs";
import path from "path";
import type { Org, Member } from "./types";
import type { LinkedInProfile } from "./harvest";

const FALLBACK =
  "You audit a LinkedIn profile and return a specific makeover: an audit score, the issues, 3 rewritten " +
  "headline options (Who you help + How + Proof), a full About rewrite in the person's voice, and the " +
  "ordered top changes. No buzzwords, no em-dashes, no invented metrics.";

const GUIDE: string = (() => {
  try {
    return readFileSync(path.join(process.cwd(), "writing-guidelines", "PROFILE-OPTIMIZER-PROMPT.md"), "utf8");
  } catch {
    return FALLBACK;
  }
})();

// The 34 headline formulas (verbatim from the build-spec, via hooks.json) — grouped, with exemplars.
const HEADLINE_FORMULAS: string = (() => {
  try {
    const raw = readFileSync(path.join(process.cwd(), "writing-guidelines", "seed-data", "hooks.json"), "utf8");
    const hf = (JSON.parse(raw).headline_formulas ?? []) as {
      category: string; template: string; exemplar_headline: string;
    }[];
    const by = new Map<string, string[]>();
    for (const f of hf) {
      const list = by.get(f.category) ?? [];
      list.push(`  • ${f.template}  —  e.g. "${f.exemplar_headline}"`);
      by.set(f.category, list);
    }
    return [...by.entries()].map(([c, lines]) => `${c}:\n${lines.join("\n")}`).join("\n\n");
  } catch {
    return "";
  }
})();

// The 7×5 narrative → LinkedIn profile-section map (build-spec ideation-systems.md).
const PROFILE_SECTION_MAP = `Where each narrative ingredient belongs on the profile:
- Audience  → Headline (who it's for) + About opening line
- Problem   → About ("You can do X and still…")
- Outcome   → Banner + Headline (money/time)
- Story     → About ("I know because I…")
- Framework → About ("How it works" / quick overview)
- Proof     → Banner (1-3 proof signals) + About (1-3 wins)
- Offer     → Featured (lead magnet) + Headline (1-3 achievements)`;

export function buildProfilePrompt(org: Org, member: Member, profile: LinkedInProfile): string {
  const a = org.brand_dna.narrative_atoms;
  const profileBlock = [
    `Name: ${profile.name}`,
    `Current headline: ${profile.headline || "(empty)"}`,
    `Current About: ${profile.about || "(empty)"}`,
    profile.location ? `Location: ${profile.location}` : "",
    profile.followers ? `Followers/connections: ${profile.followers}` : "",
    profile.experience.length
      ? `Experience:\n${profile.experience.map((e) => `- ${e.position}${e.company ? ` @ ${e.company}` : ""}`).join("\n")}`
      : "",
  ].filter(Boolean).join("\n");

  const companyBlock = [
    `Company: ${org.name} — ${org.positioning}`,
    `Audience (their ICP): ${a.audience}`,
    `Problem solved: ${a.problem}`,
    `Outcome delivered: ${a.outcome}`,
    `Proof: ${a.proof}`,
    a.offer ? `Offer / next step: ${a.offer}` : "",
    org.icp.pains.length ? `Pains: ${org.icp.pains.map((p) => p.pain).join("; ")}` : "",
  ].filter(Boolean).join("\n");

  const voiceBlock = [
    `Traits: ${member.voice_dna.traits.join(", ")}`,
    `Signature terms: ${member.voice_dna.signature_terms.join(", ")}`,
    `Beliefs: ${member.expert_pov.beliefs.join(" | ")}`,
    member.prose_samples[0] ? `A real post of theirs (match this voice):\n${member.prose_samples[0]}` : "",
  ].filter(Boolean).join("\n");

  const filled = GUIDE
    .replace("{{PROFILE}}", profileBlock)
    .replace("{{COMPANY_CONTEXT}}", companyBlock)
    .replace("{{VOICE}}", voiceBlock);

  return [
    filled,
    `\n---\n## Headline formula bank (use one per option, name which you used)\n${HEADLINE_FORMULAS}`,
    `\n---\n## Profile section map\n${PROFILE_SECTION_MAP}`,
  ].join("\n");
}

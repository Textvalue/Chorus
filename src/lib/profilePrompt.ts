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

  return GUIDE
    .replace("{{PROFILE}}", profileBlock)
    .replace("{{COMPANY_CONTEXT}}", companyBlock)
    .replace("{{VOICE}}", voiceBlock);
}

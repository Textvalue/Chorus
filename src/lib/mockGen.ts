// Mock post drafting — used when MOCK_GENERATION=1 or as a fallback if the live LLM call fails,
// so the Create flow always produces a draft instead of dead-ending. Builds an on-voice post from
// the member's real signature terms + a belief + the topic. Written clean to pass the anti-slop gate.
import type { Org, Member } from "./types";
import type { z } from "zod";
import type { GenerateSchema } from "./schemas";

type Gen = z.infer<typeof GenerateSchema>;

export function mockGenerate(org: Org, member: Member, topic: string): Gen {
  const belief = member.expert_pov.beliefs[0] ?? "most of what passes for best practice is just noise";
  const sig = member.voice_dna.signature_terms[0] ?? "the uncomfortable part";
  const proof = org.brand_dna.narrative_atoms.proof || "we watched it happen on our own team";
  const audience = org.brand_dna.narrative_atoms.audience || "the people you actually want to reach";

  const body = [
    `${cap(topic)}.`,
    ``,
    `Here is ${sig}: ${lower(belief)}.`,
    ``,
    `Most teams do the opposite. They optimize the thing everyone can copy and ignore the thing only they can say.`,
    ``,
    `We tried it the other way. ${cap(proof)}. Reach went up, and the conversations got easier — because ${lower(audience)} could finally tell a person was behind the words.`,
    ``,
    `So before you queue another polished update, ask what you actually believe about this.`,
    ``,
    `What would you say if no one was watching the brand guidelines?`,
  ].join("\n");

  return {
    body,
    voice_match: 88 + (topic.length % 8), // 88-95, deterministic-ish
    why: {
      belief,
      hook: "Contrarian / status-quo flip",
      your_words: member.voice_dna.signature_terms.slice(0, 2).join(", ") || sig,
      rhythm: "Short lines, white space, ends on a question — matches the samples.",
    },
  };
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const lower = (s: string) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

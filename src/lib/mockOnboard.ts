// Mock onboarding fallbacks — used when the live research/scrape calls fail or no API
// keys are set, so onboarding always completes for the demo instead of dead-ending.
import type { Member } from "./types";
import type { OrgExtract } from "./schemas";

export type MemberDraft = {
  name: string;
  headline: string;
  voice_dna: Member["voice_dna"];
  prose_samples: string[];
  expert_pov: Member["expert_pov"];
};

export function normalizeUrl(website: string): string {
  return website.startsWith("http") ? website : `https://${website}`;
}

function companyNameFromUrl(website: string): string {
  const domain = normalizeUrl(website)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
  const base = domain.split(".")[0] || "Your company";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function nameFromLinkedin(url: string): string {
  const slug = (url.replace(/\/+$/, "").split("/").pop() || "new-member").split("?")[0];
  const words = slug
    .split("-")
    .filter((w) => w && !/^[0-9a-f]{6,}$/i.test(w) && !/^\d+$/.test(w))
    .map((w) => w.replace(/[^a-zA-Z]/g, ""))
    .filter(Boolean);
  if (!words.length) return "New member";
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export function mockOrgDraft(website: string): OrgExtract & { website: string } {
  const url = normalizeUrl(website);
  const name = companyNameFromUrl(url);
  return {
    name,
    website: url,
    positioning: `${name} helps teams show up on LinkedIn without sounding like a slop machine — one shared strategy, every voice still human.`,
    icp: {
      personas: ["Founders", "Heads of Marketing", "Sales leaders (CROs)"],
      pains: [
        { pain: "The team freezes at the blank page", weekly_trigger: "Monday content planning", severity: "high" },
        { pain: "AI drafts all sound the same and read as generic", weekly_trigger: "Every draft review", severity: "high" },
        { pain: "One corporate post pushed to everyone reads as spam", weekly_trigger: "Campaign launches", severity: "medium" },
      ],
      anti_personas: ["Solo creators with no team", "Brands that want fully automated posting"],
    },
    competitors: [
      { name: "Taplio", url: "https://taplio.com", note: "All-in-one, but every employee sounds the same" },
      { name: "EveryoneSocial", url: "https://everyonesocial.com", note: "Pushes one post to many — unison, not harmony" },
    ],
    brand_dna: {
      voice_rules: [
        "Warm, encouraging, direct — like a great bandleader",
        "Sentence case. Short sentences. Real specifics.",
        "No AI tells: no em-dash pile-ups, no curly quotes, no press-release language",
        "Off-key means not tuned yet, never that the writer is bad",
      ],
      narrative_atoms: {
        audience: "teams who want to post on LinkedIn without sounding like AI",
        problem: "every employee's AI output sounds identical, so the brand sounds like noise",
        outcome: "a whole team sounds like one brand while every post still sounds human",
        proof: "we watched our own team go from an echo to a conversation",
        offer: "one shared score, every voice in tune",
      },
    },
  };
}

export function mockMemberData(linkedin_url: string): MemberDraft {
  const name = nameFromLinkedin(linkedin_url);
  return {
    name,
    headline: "",
    voice_dna: {
      traits: ["direct", "warm", "specific"],
      sentence_patterns: ["opens on a concrete moment", "short lines with white space", "ends on a question"],
      signature_terms: ["here's what I keep seeing", "the real version"],
      phrases_to_avoid: ["thrilled to announce", "game-changer", "leverage", "synergy"],
    },
    prose_samples: [
      "The best post I wrote this year started as a voice note in the car.\n\nNo hook formula, no template. Just the thing I'd actually said to a colleague an hour earlier, typed out plainly.\n\nIt did better than anything I'd optimized. People can tell when a real person is behind the words.",
      "Most advice in my space is written to sound smart, not to be true.\n\nI'd rather say the slightly awkward, specific thing than the smooth forgettable one. The awkward version is the one people remember, and the one they reply to.",
    ],
    expert_pov: {
      beliefs: [
        "People can tell when a real person is behind the words",
        "The specific, slightly awkward take beats the smooth one",
      ],
      topics: ["building in public", "team content", "honest marketing"],
      hot_takes: ["Optimized content is forgettable content"],
      status: "inferred",
    },
  };
}

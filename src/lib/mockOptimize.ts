// Mock profile makeover — fallback when Harvest scrape or the LLM call fails, so the optimizer
// never dead-ends. Built from the member + org data already in the store.
import type { Org, Member } from "./types";
import type { LinkedInProfile } from "./harvest";
import type { ProfileMakeover } from "./schemas";

export function mockProfile(member: Member): LinkedInProfile {
  return {
    name: member.name,
    headline: member.headline || "",
    about: member.prose_samples[0] ? member.prose_samples[0].slice(0, 220) : "",
    photo: "",
    location: "",
    followers: 0,
    experience: member.headline ? [{ company: "", position: member.headline }] : [],
  };
}

export function mockMakeover(org: Org, member: Member, profile: LinkedInProfile): ProfileMakeover {
  const a = org.brand_dna.narrative_atoms;
  const who = a.audience || "the people you want to reach";
  const proof = a.proof || "real results";
  const belief = member.expert_pov.beliefs[0] ?? "say the true thing, not the polished one";

  return {
    overall_score: 62,
    verdict: "Your headline reads like a job title, so visitors can't tell who you help in 3 seconds.",
    sections: [
      { name: "headline", score: 55, issue: "Leads with a role, not who you help or a result.", fix: `Lead with the audience and the outcome: who you help + how + proof.` },
      { name: "about", score: 60, issue: "Reads like a résumé summary, not a person talking.", fix: "Open on the reader's pain, state your POV, show one proof, end with a clear next step." },
      { name: "experience", score: 70, issue: "Titles only, no outcomes.", fix: "Add one line per role on the result you drove, with a number where you have one." },
      { name: "featured", score: 40, issue: "Nothing pinned, so a visitor has no next step.", fix: `Pin your best post or a lead magnet tied to: ${a.offer || "your offer"}.` },
      { name: "banner", score: 45, issue: "Generic or default banner.", fix: `Put your outcome + 1–3 proof signals on the banner (${proof}).` },
    ],
    headline: {
      current: profile.headline || "(empty)",
      options: [
        { text: `Helping ${who} ${a.outcome || "get results"} | ${proof}`, formula: "Help Statement + Credibility", why: "Audience-first, with proof — clear in 3 seconds." },
        { text: `I help ${who} ${a.outcome || "win"} through ${org.name}. ${proof}.`, formula: "I-Statement (action)", why: "Active and specific; shows the mechanism." },
        { text: `${member.headline || "Your role"} · ${who} → ${a.outcome || "the outcome"}`, formula: "Credibility + Value Prop", why: "Keeps the title but makes the value legible." },
      ],
    },
    about: {
      current_read: profile.about ? "Competent but generic — it describes you, not what the reader gets." : "Empty — you're leaving the most valuable real estate on the page blank.",
      rewrite: [
        `${who} have a problem nobody admits: ${a.problem || "the obvious approach quietly stops working"}.`,
        ``,
        `Here's what I believe: ${belief}.`,
        ``,
        `That's what I do at ${org.name} — ${org.positioning}.`,
        ``,
        `Proof: ${proof}.`,
        ``,
        `If that's you, DM me "${(a.offer || "start").split(" ")[0]}" and I'll send the playbook.`,
      ].join("\n"),
    },
    priorities: [
      { change: "Rewrite the headline (option 1).", why: "It follows you on every post and comment — biggest leverage.", effort: "quick" },
      { change: "Replace the About opening line with the reader's pain.", why: "The first line above the fold decides if they keep reading.", effort: "quick" },
      { change: `Pin a Featured asset tied to your offer.`, why: "Gives profile visitors a next step instead of a dead end.", effort: "medium" },
    ],
  };
}

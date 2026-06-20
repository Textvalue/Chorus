// Demo seed — a tuned "Acme" ensemble so Penkala is fully browsable out of the box
// (no API keys, no onboarding required). load() falls back to this when data/store.json
// is absent; the first real write materializes it to disk. Mirrors the design-system UI kit.
import type { Store, Member, Post } from "./types";

const ORG_ID = "org_acme";

function member(
  member_id: string,
  name: string,
  headline: string,
  voice: Member["voice_dna"],
  prose_samples: string[],
  pov: Member["expert_pov"]
): Member {
  return {
    member_id,
    org_id: ORG_ID,
    name,
    headline,
    linkedin_url: `https://www.linkedin.com/in/${name.toLowerCase().replace(/\s+/g, "-")}`,
    voice_dna: voice,
    prose_samples,
    expert_pov: pov,
    corrections: [],
  };
}

const members: Member[] = [
  member(
    "mem_alex",
    "Alex Johnson",
    "Content Lead at Acme",
    {
      traits: ["direct", "warm", "systems-minded"],
      sentence_patterns: ["opens on a concrete moment", "short lines, lots of white space", "ends on a question"],
      signature_terms: ["the score", "play your part", "in tune", "the blank page"],
      phrases_to_avoid: ["thrilled to announce", "game-changer", "leverage", "synergy"],
    },
    [
      "We stopped measuring our team's posts by volume last quarter.\n\nFor two years the goal was simple: more posts, more reach. So everyone posted more. Engagement went flat, and half the team quietly stopped.\n\nThen we changed one number. Not posts published — posts that sounded like the person who wrote them. Suddenly people had something to say again.\n\nReach followed. It always does. The audience can tell when a person is behind the words.\n\nWhat's the one metric your team optimizes that's quietly making the work worse?",
      "A blank page is not a talent problem. It's a tuning problem.\n\nMost people on your team can talk for ten minutes about their work and sound sharp, funny, specific. Put them in front of an empty post box and they freeze, then reach for the most generic sentence they can find.\n\nThe fix isn't a better prompt. It's giving them their own voice back — the words they actually use, the takes they actually hold.\n\nWe got there by listening to how people already talk. Turns out the voice was never missing. The instrument was just out of tune.",
    ],
    {
      beliefs: [
        "A company has an orchestra, not a voice — most instruments are still in the case",
        "Reward what compounds (showing up, real reach), never raw output volume",
        "The defensible part is what you believe, not how you sound",
      ],
      topics: ["team content", "brand voice", "creator-led growth"],
      hot_takes: ["Employee advocacy that pushes the same post to everyone is unison — lifeless noise"],
      status: "confirmed",
    }
  ),
  member(
    "mem_maya",
    "Maya Patel",
    "Copywriter at Acme",
    {
      traits: ["punchy", "contrarian", "vivid"],
      sentence_patterns: ["pattern-interrupt hook", "concrete image early", "one idea per line"],
      signature_terms: ["echo", "the script", "forty cellos one note"],
      phrases_to_avoid: ["dive in", "unlock", "in today's landscape"],
    },
    [
      "Your employee advocacy program is making everyone sound the same.\n\nI watched a 40-person team post the identical paragraph last week. Forty cellos, one note. That isn't reach. It's an echo.\n\nThe algorithm reads sameness as spam, and so do humans. We scroll past the second copy without finishing the first.\n\nGive people the score, not the script. Same strategy, distinct voices. That's the version that travels.\n\nWhen did we decide that on-brand had to mean identical?",
      "I used to think good copy was about the perfect word.\n\nIt's not. It's about the true one.\n\nThe perfect word is smooth and forgettable. The true word is a little rough and you remember exactly who said it. \"Echo.\" \"Squeak.\" \"The script.\" Those aren't clever. They're mine.\n\nAI gives you the perfect word every time. That's exactly the problem.",
    ],
    {
      beliefs: ["Good writing uses the true word, not the perfect word", "Sameness reads as spam to both the algorithm and the reader"],
      topics: ["copywriting", "brand voice", "LinkedIn"],
      hot_takes: ["The perfect word is the forgettable one"],
      status: "confirmed",
    }
  ),
  member(
    "mem_jordan",
    "Jordan Lee",
    "Designer at Acme",
    {
      traits: ["measured", "analytical", "calm"],
      sentence_patterns: ["data-led opener", "shows the math", "lands on a principle"],
      signature_terms: ["ran the math", "the quiet version", "signal-to-noise"],
      phrases_to_avoid: ["mind-blowing", "10x", "rockstar"],
    },
    [
      "Most advocacy tools optimize for the wrong thing: volume.\n\nWe ran the math on a client's team. Same post, 30 shares, near-zero replies. The reach number looked great in the deck. The pipeline number didn't move at all.\n\nDistinct voices on one strategy beat identical voices every time. Not because it's nicer — because it's how attention actually works. People reply to people.\n\nThe quiet version of this: stop counting shares, start counting conversations.",
    ],
    {
      beliefs: ["Count conversations, not shares", "Distinct voices on one strategy outperform identical voices"],
      topics: ["design systems", "analytics", "brand"],
      hot_takes: ["Reach is a vanity number until it starts a conversation"],
      status: "inferred",
    }
  ),
  member(
    "mem_taylor",
    "Taylor Kim",
    "Social Manager at Acme",
    {
      traits: ["friendly", "practical", "story-led"],
      sentence_patterns: ["small story opener", "lists three concrete things", "warm close"],
      signature_terms: ["here's what changed", "tiny habit", "show up"],
      phrases_to_avoid: ["hustle", "grind", "crushing it"],
    },
    [
      "Three things I changed about how our team shows up on LinkedIn this year.\n\nOne: a 60-second voice note every morning instead of a blank content calendar. People talk better than they type.\n\nTwo: we review for whether it sounds like the person, not whether it's polished. Polished is easy and forgettable.\n\nThree: we stopped publishing on Fridays and nobody noticed except our sanity.\n\nSmall habits, repeated. That's the whole thing.",
    ],
    {
      beliefs: ["Small daily habits beat big content sprints", "People talk better than they type"],
      topics: ["social media", "team habits", "content ops"],
      hot_takes: ["The content calendar is where good ideas go to get generic"],
      status: "inferred",
    }
  ),
  member(
    "mem_casey",
    "Casey Brown",
    "Analyst at Acme",
    {
      traits: ["curious", "earnest", "still finding their voice"],
      sentence_patterns: ["asks a question early", "thinks out loud", "honest close"],
      signature_terms: ["I keep noticing", "the boring truth"],
      phrases_to_avoid: ["thought leader", "disrupt", "paradigm"],
    },
    [
      "A quick story about the first time a post actually landed.\n\nI'd written maybe twenty that went nowhere. All of them tried to sound like someone smarter than me. Then I wrote one that just said the boring truth about a number I couldn't explain, and asked if anyone else saw it.\n\nForty replies. Most of them smarter than my post.\n\nTurns out the move was never sounding like an expert. It was being honest enough that experts wanted to talk to me.",
    ],
    {
      beliefs: ["Honesty earns better replies than authority", "Most posts fail because they imitate someone smarter"],
      topics: ["analytics", "learning in public"],
      hot_takes: ["The boring truth outperforms the clever take"],
      status: "inferred",
    }
  ),
];

function post(
  id: string,
  member_id: string,
  topic: string,
  angle: string,
  body: string,
  status: Post["status"],
  voice_match: number
): Post {
  return {
    id,
    member_id,
    org_id: ORG_ID,
    topic,
    angle,
    body,
    generated_body: body,
    status,
    voice_match,
    created_at: "2026-06-19T09:00:00.000Z",
    edits: [],
  };
}

const posts: Post[] = [
  post("post_1", "mem_maya", "Why pushing the same post to every employee kills your brand", "pattern interrupt",
    members[1].prose_samples[0], "draft", 96),
  post("post_2", "mem_jordan", "Advocacy tools optimize the wrong metric", "data-led",
    members[2].prose_samples[0], "draft", 94),
  post("post_3", "mem_alex", "We stopped measuring posts by volume", "contrarian",
    members[0].prose_samples[0], "approved", 95),
  post("post_4", "mem_maya", "The blank page is a tuning problem", "reframe",
    members[0].prose_samples[1], "approved", 97),
  post("post_5", "mem_taylor", "Three things I changed about how our team shows up", "how-to",
    members[3].prose_samples[0], "draft", 88),
  post("post_6", "mem_casey", "The first time a post actually landed", "story",
    members[4].prose_samples[0], "rejected", 71),
];

export const SEED: Store = {
  org: {
    org_id: ORG_ID,
    name: "Acme",
    website: "https://acme.com",
    icp: {
      personas: ["Founders", "Heads of Marketing", "Sales leaders (CROs)"],
      pains: [
        { pain: "The team freezes at the blank page", weekly_trigger: "Monday content planning", severity: "high" },
        { pain: "AI drafts all sound the same and get flagged as generic", weekly_trigger: "Every draft review", severity: "high" },
        { pain: "One approved corporate post pushed to everyone reads as spam", weekly_trigger: "Campaign launches", severity: "medium" },
      ],
      anti_personas: ["Solo creators with no team", "Brands that want fully automated posting"],
    },
    positioning: "The team content OS — harmony, not unison. A whole team sounds like one brand, every post still human.",
    competitors: [
      { name: "Scripe", url: "https://scripe.io", note: "Learns from past posts — a backward style mirror" },
      { name: "Taplio", url: "https://taplio.com", note: "All-in-one, but every employee's output sounds the same" },
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
        audience: "teams who want to show up on LinkedIn without sounding like a slop machine",
        problem: "every employee's AI output sounds identical, so the brand sounds like noise",
        outcome: "a whole team sounds like one brand while every post still sounds human",
        proof: "we watched our own 40-person team go from an echo to a conversation",
        offer: "one shared score, every voice in tune",
      },
    },
    owner_member_id: "mem_alex",
  },
  members,
  posts,
};

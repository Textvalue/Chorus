// Deterministic anti-slop sanitizer — runs AFTER generation (plan.md §5). Pure rules, no LLM.

const KILL_WORDS = [
  "delve",
  "tapestry",
  "game-changer",
  "game changer",
  "unleash",
  "unlock the power",
  "in today's fast-paced",
  "in the ever-evolving",
  "navigating the",
  "elevate",
  "supercharge",
  "leverage synergies",
  "robust solution",
  "seamless",
  "cutting-edge",
  "revolutionize",
  "paradigm shift",
  "at the end of the day",
  "needle-moving",
  "best-in-class",
  "world-class",
];

const BANNED_PHRASES = [
  "i'm thrilled to",
  "i am thrilled to",
  "excited to announce",
  "without further ado",
  "let's dive in",
  "let's dive into",
  "the bottom line is",
  "it's not about x, it's about y",
  "here's the thing",
  "in conclusion",
  "in summary",
];

// Structural tells: the "It's not just X. It's Y." and rule-of-three em-dash slop.
const STRUCTURAL = [
  /\bit'?s not (just )?[^.]+\.\s*it'?s\b/i, // "It's not just a tool. It's a movement."
  /^🚀|^✨|^🔥/m, // emoji-led lines
];

export type SlopViolation = { rule: string; detail: string };

export function sanitize(text: string): { violations: SlopViolation[]; pass: boolean } {
  const v: SlopViolation[] = [];
  const lower = text.toLowerCase();

  // 1. curly quotes / curly apostrophes
  if (/[‘’“”]/.test(text)) {
    v.push({ rule: "curly_quotes", detail: "Contains curly quotes/apostrophes (AI tell)." });
  }

  // 2. em-dash density > 1 per paragraph
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim());
  for (const p of paras) {
    const dashes = (p.match(/—/g) ?? []).length;
    if (dashes > 1) {
      v.push({ rule: "em_dash_density", detail: `A paragraph has ${dashes} em-dashes (>1).` });
      break;
    }
  }

  // 3. kill-words
  for (const w of KILL_WORDS) {
    if (lower.includes(w)) v.push({ rule: "kill_word", detail: `Banned word: "${w}".` });
  }

  // 4. banned phrases
  for (const phrase of BANNED_PHRASES) {
    if (lower.includes(phrase)) v.push({ rule: "banned_phrase", detail: `Banned phrase: "${phrase}".` });
  }

  // 5. structural tells
  for (const re of STRUCTURAL) {
    if (re.test(text)) v.push({ rule: "structural_tell", detail: "Slop sentence structure detected." });
  }

  // 6. hashtag pile-up (>2 hashtags)
  if ((text.match(/#\w+/g) ?? []).length > 2) {
    v.push({ rule: "hashtag_pileup", detail: "More than 2 hashtags." });
  }

  return { violations: v, pass: v.length === 0 };
}

/** The ban-list inlined into the generation prompt so the model avoids slop up front. */
export const BAN_LIST = [...KILL_WORDS, ...BANNED_PHRASES];

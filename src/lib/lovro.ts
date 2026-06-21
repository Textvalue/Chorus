// Hardcoded demo overrides for the Lovro Čulina / TalentLyft demo account. Everything here is
// keyed off the account email so it ONLY fires for that user — every other account gets the
// normal generated flow untouched. Used by the post + image job runners (see lib/jobs.ts).
export const LOVRO_EMAIL = "lovro.culina@talentlyft.com";

export function isLovro(email: string | null | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === LOVRO_EMAIL;
}

// His "Generate" always returns this one hand-written post. Formatting cleaned up from the
// source: real paragraph breaks (one blank line between beats) and a real 👇 instead of the
// ":point_down:" shortcode.
export const LOVRO_POST_BODY = [
  "It still surprises me how many companies treat hiring developers as a sourcing problem.",
  "The best engineering teams I know solved it years earlier, as an employer brand problem.",
  "Think about it: a good developer doesn't pick where to work from a recruiter message or a job ad. They decide from what they can see long before you ever talk to them: the handbook, the code, the engineering blog, what your own team says in public.",
  "The companies that win developers just make more of that visible.",
  "GitLab puts its entire 3,000-page company handbook online, so you know exactly how they work before you apply. Netflix wrote a culture deck so honest that Sheryl Sandberg called it one of the most important documents to come out of Silicon Valley. Vercel barely has to source engineers at all; most come from the open-source community already using its tools.",
  "None of this is a recruiting campaign. It's employer brand, built in the open.",
  "Developers can smell a recruiting pitch. What they trust is what they can verify before they ever apply.",
  "I pulled 6 of these plays into one overview below. 👇",
  "Which one is your team already doing well, and which are you sleeping on?",
].join("\n\n");

export const LOVRO_POST_VOICE_MATCH = 97;

export const LOVRO_POST_WHY = {
  belief: "Hiring developers is an employer-brand problem, not a sourcing problem.",
  hook: "Contrarian reframe",
  your_words: "employer brand, built in the open",
  rhythm: "Short opening lines, white space between beats, ends on a question.",
};

// His infographic click returns this static, committed image instead of calling the model.
export const LOVRO_INFOGRAPHIC_URL = "/post.png";

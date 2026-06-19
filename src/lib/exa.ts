// Exa company research — docs.exa.ai. Gathers raw text/snippets to feed an OpenRouter extraction pass.
import Exa from "exa-js";

function client() {
  const key = process.env.EXA_API_KEY;
  if (!key) throw new Error("EXA_API_KEY is not set");
  return new Exa(key);
}

export type ExaResearch = {
  website: string;
  siteText: string;
  competitorsText: string;
  painsText: string;
};

/** Pull the company's own site content + competitor + pain signals from the web. */
export async function researchCompany(website: string): Promise<ExaResearch> {
  const exa = client();
  const domain = website.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  // 1. The company's own site — full text + a targeted summary.
  const site = await exa.getContents([website], {
    text: { maxCharacters: 6000 },
    summary: {
      query:
        "What does this company sell, who is the ideal customer (ICP), what pains do they solve, and how do they position vs competitors?",
    },
  });
  const siteRes = site.results?.[0];
  const siteText = [siteRes?.summary, siteRes?.text].filter(Boolean).join("\n\n");

  // 2. Competitors + positioning via answer endpoint (sourced).
  const competitors = await exa
    .answer(`Who are the main competitors of the company at ${domain}, and how does it differentiate?`, {
      text: false,
    })
    .catch(() => ({ answer: "" }) as { answer: string });

  // 3. Customer pains via a neural search over the company's space.
  const pains = await exa
    .search(`${domain} customer pain points and ideal customer profile`, {
      type: "auto",
      numResults: 5,
      category: "company",
      contents: {
        highlights: { query: "customer pain points, ideal customer profile, who buys this" },
      },
    })
    .catch(() => ({ results: [] as { highlights?: string[] }[] }));

  const painsText = (pains.results ?? [])
    .flatMap((r) => r.highlights ?? [])
    .join("\n");

  return {
    website,
    siteText: siteText || `Company website: ${website}`,
    competitorsText: typeof competitors.answer === "string" ? competitors.answer : "",
    painsText,
  };
}

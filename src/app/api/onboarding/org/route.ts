import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { researchCompany } from "@/lib/exa";
import { OrgExtractSchema } from "@/lib/schemas";

export const maxDuration = 60;

// Research a company website with Exa, then extract a structured draft org via OpenRouter.
export async function POST(req: Request) {
  try {
    const { website } = (await req.json()) as { website?: string };
    if (!website) return NextResponse.json({ error: "website required" }, { status: 400 });
    const url = website.startsWith("http") ? website : `https://${website}`;

    const research = await researchCompany(url);

    const { object } = await generateObject({
      model: model(EXTRACT_MODEL),
      schema: OrgExtractSchema,
      system:
        "You are a B2B GTM strategist. From the research below, extract a precise company record. " +
        "Every pain MUST have a concrete weekly_trigger (the recurring moment it's felt). " +
        "Be specific and grounded in the text — do not invent facts or metrics.",
      prompt: [
        `WEBSITE: ${url}`,
        `\n--- COMPANY SITE ---\n${research.siteText}`,
        `\n--- COMPETITORS / POSITIONING ---\n${research.competitorsText}`,
        `\n--- PAIN SIGNALS ---\n${research.painsText}`,
      ].join("\n"),
    });

    return NextResponse.json({ draft: { ...object, website: url } });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "research failed" },
      { status: 500 }
    );
  }
}

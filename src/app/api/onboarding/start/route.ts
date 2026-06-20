// Combined onboarding: process the company website AND the member's LinkedIn AT THE SAME TIME.
// Each half independently falls back to mock data so onboarding always completes.
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { researchCompany } from "@/lib/exa";
import { OrgExtractSchema } from "@/lib/schemas";
import { mockOrgDraft, normalizeUrl } from "@/lib/mockOnboard";
import { captureMember } from "@/lib/captureMember";

export const maxDuration = 120;

async function processOrg(website: string): Promise<{ draft: OrgExtractDraft; mocked: boolean }> {
  const url = normalizeUrl(website);
  try {
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
    return { draft: { ...object, website: url }, mocked: false };
  } catch (e) {
    console.error("[onboarding/start] org research fell back to mock:", e);
    return { draft: mockOrgDraft(url), mocked: true };
  }
}

type OrgExtractDraft = Awaited<ReturnType<typeof mockOrgDraft>>;

export async function POST(req: Request) {
  try {
    const { website, linkedin_url } = (await req.json()) as {
      website?: string;
      linkedin_url?: string;
    };
    if (!website || !linkedin_url) {
      return NextResponse.json({ error: "website and linkedin_url are both required" }, { status: 400 });
    }

    // The two slow jobs run concurrently — company research and voice capture at the same time.
    const [org, member] = await Promise.all([processOrg(website), captureMember(linkedin_url)]);

    return NextResponse.json({
      org: org.draft,
      member: member.draft,
      mocked: org.mocked || member.mocked,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "onboarding failed" },
      { status: 500 }
    );
  }
}

// Combined onboarding: process the company website AND the member's LinkedIn AT THE SAME TIME.
// Each half independently falls back to mock data so onboarding always completes.
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { researchCompany } from "@/lib/exa";
import { fetchProfile, fetchPosts, selectProseSamples } from "@/lib/harvest";
import { OrgExtractSchema, VoiceDnaSchema, ExpertPovSchema } from "@/lib/schemas";
import { mockOrgDraft, mockMemberData, normalizeUrl, type MemberDraft } from "@/lib/mockOnboard";

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

async function processMember(linkedin_url: string): Promise<{ draft: MemberDraft; mocked: boolean }> {
  try {
    const [profile, posts] = await Promise.all([fetchProfile(linkedin_url), fetchPosts(linkedin_url, 2)]);
    const prose_samples = selectProseSamples(posts, 5);
    if (prose_samples.length < 1) throw new Error("no usable posts found");
    const corpus = prose_samples.map((s, i) => `--- Post ${i + 1} ---\n${s}`).join("\n\n");
    const [voice, pov] = await Promise.all([
      generateObject({
        model: model(EXTRACT_MODEL),
        schema: VoiceDnaSchema,
        system:
          "Extract HOW this person writes (voice DNA) from their real LinkedIn posts. " +
          "Be concrete: real signature terms they actually use, real rhythm. No generic adjectives.",
        prompt: corpus,
      }),
      generateObject({
        model: model(EXTRACT_MODEL),
        schema: ExpertPovSchema,
        system:
          "Extract WHAT this person believes (expert POV) from their real LinkedIn posts: " +
          "contrarian beliefs, recurring topics, hot takes. Infer from the corpus only.",
        prompt: corpus,
      }),
    ]);
    return {
      draft: {
        name: profile.name,
        headline: profile.headline,
        voice_dna: voice.object,
        prose_samples,
        expert_pov: { ...pov.object, status: "inferred" },
      },
      mocked: false,
    };
  } catch (e) {
    console.error("[onboarding/start] member voice capture fell back to mock:", e);
    return { draft: mockMemberData(linkedin_url), mocked: true };
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
    const [org, member] = await Promise.all([processOrg(website), processMember(linkedin_url)]);

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

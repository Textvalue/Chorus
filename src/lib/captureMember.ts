// Capture a member's voice from a LinkedIn URL: HarvestAPI pull → filter → two extraction passes
// (voice DNA + expert POV), with a mock fallback so it never dead-ends. Shared by onboarding and
// the "invite member" flow.
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { fetchProfile, fetchPosts, selectProseSamples } from "@/lib/harvest";
import { VoiceDnaSchema, ExpertPovSchema } from "@/lib/schemas";
import { mockMemberData, type MemberDraft } from "@/lib/mockOnboard";

export async function captureMember(
  linkedin_url: string
): Promise<{ draft: MemberDraft; mocked: boolean }> {
  try {
    const [profile, posts] = await Promise.all([
      fetchProfile(linkedin_url),
      fetchPosts(linkedin_url, 2),
    ]);
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
    console.error("[captureMember] fell back to mock:", e);
    return { draft: mockMemberData(linkedin_url), mocked: true };
  }
}

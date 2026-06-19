import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { fetchProfile, fetchPosts, selectProseSamples } from "@/lib/harvest";
import { VoiceDnaSchema, ExpertPovSchema } from "@/lib/schemas";
import { getOrg, upsertMember, id } from "@/lib/store";
import type { Member } from "@/lib/types";

export const maxDuration = 120;

// Member setup (plan.md §3b): Harvest pull -> filter -> extraction pass A (voice) + B (POV).
export async function POST(req: Request) {
  try {
    const { linkedin_url } = (await req.json()) as { linkedin_url?: string };
    if (!linkedin_url) return NextResponse.json({ error: "linkedin_url required" }, { status: 400 });

    const org = await getOrg();
    if (!org) return NextResponse.json({ error: "org not set up" }, { status: 400 });

    const [profile, posts] = await Promise.all([
      fetchProfile(linkedin_url),
      fetchPosts(linkedin_url, 2),
    ]);

    const prose_samples = selectProseSamples(posts, 5);
    if (prose_samples.length < 1) {
      return NextResponse.json(
        { error: "No usable posts found for this profile (need original posts, 120+ words)." },
        { status: 422 }
      );
    }

    const corpus = prose_samples.map((s, i) => `--- Post ${i + 1} ---\n${s}`).join("\n\n");

    // Pass A (HOW) + Pass B (WHAT) in parallel.
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

    const member: Member = {
      member_id: id("mem"),
      org_id: org.org_id,
      name: profile.name,
      headline: profile.headline,
      linkedin_url,
      voice_dna: voice.object,
      prose_samples,
      expert_pov: { ...pov.object, status: "inferred" },
      corrections: [],
    };
    await upsertMember(member);

    return NextResponse.json({ ok: true, member });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "member onboarding failed" },
      { status: 500 }
    );
  }
}

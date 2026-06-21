// Discover — a real trending-content analysis for a topic, grounded in (1) our own LinkedIn
// frameworks (lib/contentFrameworks.ts, distilled from the repo's seed taxonomies), (2) the
// company context, and (3) the selected author's voice/POV. Replaces the old static mock with a
// genuine LLM analysis. Falls back to a grounded mock if MOCK_GENERATION=1 or the model call fails,
// so the Discover flow never dead-ends (same philosophy as the Create flow).
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { DiscoverSchema } from "@/lib/schemas";
import { TRENDING_ANALYSIS_FRAMEWORK, mockDiscover } from "@/lib/contentFrameworks";
import { buildCompanyContext } from "@/lib/prompt";
import { getOrg, getMember } from "@/lib/store";

export const maxDuration = 60;

const MOCK = process.env.MOCK_GENERATION === "1";

export async function POST(req: Request) {
  try {
    const { topic, member_id } = (await req.json()) as { topic?: string; member_id?: string };
    const t = (topic ?? "").trim();
    if (!t) return NextResponse.json({ error: "topic required" }, { status: 400 });

    const org = await getOrg();
    const member = member_id ? await getMember(member_id) : undefined;
    if (!org || !member) return NextResponse.json({ error: "member not found" }, { status: 404 });

    if (MOCK) return NextResponse.json({ ...mockDiscover(t), mocked: true });

    try {
      const { object } = await generateObject({
        model: model(EXTRACT_MODEL),
        schema: DiscoverSchema,
        system: [
          `You are a LinkedIn content strategist analyzing what's working RIGHT NOW for a given topic,`,
          `for ${member.name}, who posts on behalf of ${org.name}. Produce a sophisticated, specific`,
          `breakdown — not generic advice. The company is the lens (frame the topic for ${org.name}'s`,
          `audience and category); ${member.name}'s POV/voice is the angle.`,
          ``,
          `Reason ONLY with the framework below. It carries the real, research-backed numbers — use`,
          `THOSE for any quantitative claim (format multipliers, suppression penalties, timing). Never`,
          `invent precise metrics like "3.2x vs median"; keep topic-specific judgements qualitative`,
          `(emerging / hot / saturated, which angles are overdone, which hooks fit).`,
          ``,
          `Tag every hook with one of the 12 emotional hook types and every idea with one of the 4`,
          `content pillars. Recommend exactly one copywriting framework for the winning structure.`,
          `Hooks and idea titles must be human and slop-free: no em-dash pile-ups, no "unlock/elevate/`,
          `game-changer/supercharge", no "excited to share". Do not invent company facts or metrics.`,
          ``,
          TRENDING_ANALYSIS_FRAMEWORK,
        ].join("\n"),
        prompt: [
          `# TOPIC TO ANALYZE`,
          t,
          ``,
          `---`,
          ``,
          buildCompanyContext(org),
          ``,
          `---`,
          ``,
          `# AUTHOR POV — the angle/voice to apply`,
          `Name: ${member.name}${member.headline ? ` — ${member.headline}` : ""}`,
          `Beliefs: ${member.expert_pov.beliefs.join(" | ") || "(none captured)"}`,
          `Hot takes: ${member.expert_pov.hot_takes.join(" | ") || "(none captured)"}`,
          `Topics they own: ${member.expert_pov.topics.join(", ") || "(none captured)"}`,
          `Voice traits: ${member.voice_dna.traits.join(", ") || "(none captured)"}`,
        ].join("\n"),
      });

      return NextResponse.json({ ...object, topic: object.topic || t, mocked: false });
    } catch (genErr) {
      // Never dead-end Discover: fall back to the grounded mock if the live model call fails.
      console.error("[discover] live LLM failed, using mock fallback:", genErr);
      return NextResponse.json({ ...mockDiscover(t), mocked: true });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "discover failed" },
      { status: 500 }
    );
  }
}

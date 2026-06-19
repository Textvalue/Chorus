import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { IdeasSchema } from "@/lib/schemas";
import { getOrg, getMember } from "@/lib/store";

export const maxDuration = 60;

// Ideas (plan.md §6): expand a member's beliefs/topics + org pains into angle cards.
export async function POST(req: Request) {
  try {
    const { member_id } = (await req.json()) as { member_id?: string };
    const org = await getOrg();
    const member = member_id ? await getMember(member_id) : undefined;
    if (!org || !member) return NextResponse.json({ error: "member not found" }, { status: 404 });

    const { object } = await generateObject({
      model: model(EXTRACT_MODEL),
      schema: IdeasSchema,
      system:
        "Generate 6-8 specific, postable LinkedIn idea cards. " +
        "Each must map to a real belief/topic/hot-take or a company pain (use its weekly_trigger as the hook). " +
        "Make them sharp and concrete — no generic 'tips' posts.",
      prompt: [
        `Beliefs: ${member.expert_pov.beliefs.join(" | ")}`,
        `Hot takes: ${member.expert_pov.hot_takes.join(" | ")}`,
        `Topics: ${member.expert_pov.topics.join(", ")}`,
        `Company pains (with weekly triggers): ${org.icp.pains
          .map((p) => `${p.pain} [trigger: ${p.weekly_trigger}]`)
          .join("; ")}`,
        `Positioning: ${org.positioning}`,
      ].join("\n"),
    });

    return NextResponse.json({ ideas: object.ideas });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "ideas failed" },
      { status: 500 }
    );
  }
}

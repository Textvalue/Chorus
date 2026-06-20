import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { IdeasSchema } from "@/lib/schemas";
import { buildCompanyContext } from "@/lib/prompt";
import { getOrg, getMember } from "@/lib/store";

export const maxDuration = 60;

// Ideas (plan.md §6): expand a member's beliefs/topics + org pains into angle cards.
// Both halves matter: the author's POV is the *voice/angle*, the company is the *subject*.
// We feed the same rich COMPANY CONTEXT the post writer uses so ideas stay on-brand even when
// the author's personal expertise sits in a different domain than the company.
export async function POST(req: Request) {
  try {
    const { member_id } = (await req.json()) as { member_id?: string };
    const org = await getOrg();
    const member = member_id ? await getMember(member_id) : undefined;
    if (!org || !member) return NextResponse.json({ error: "member not found" }, { status: 404 });

    const { object } = await generateObject({
      model: model(EXTRACT_MODEL),
      system: [
        `You generate LinkedIn post ideas for ${member.name}, who posts on behalf of ${org.name}.`,
        ``,
        `Generate 6-8 specific, postable idea cards. Every idea must be relevant to ${org.name}'s`,
        `audience and category — the company is the SUBJECT, the author's POV is the ANGLE/VOICE.`,
        ``,
        `Two sources, and you must use BOTH (aim for a roughly even split):`,
        `- source_type "pain": led by a company audience pain. Use its weekly_trigger as the hook.`,
        `- source_type "belief": led by one of the author's beliefs/hot-takes/topics — but BRIDGE it`,
        `  to the company's audience and category. Never produce an idea about the author's personal`,
        `  industry that ${org.name}'s buyers wouldn't care about; reframe the belief through what the`,
        `  company sells and who it serves.`,
        ``,
        `Set "source" to the specific pain or belief it came from. Make ideas sharp and concrete —`,
        `no generic "5 tips" posts. Do not invent metrics or facts beyond the company context.`,
      ].join("\n"),
      schema: IdeasSchema,
      prompt: [
        buildCompanyContext(org),
        ``,
        `---`,
        ``,
        `# AUTHOR POV — the angle/voice to apply to ${org.name}'s subject matter`,
        `Beliefs: ${member.expert_pov.beliefs.join(" | ")}`,
        `Hot takes: ${member.expert_pov.hot_takes.join(" | ")}`,
        `Topics they own: ${member.expert_pov.topics.join(", ")}`,
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

import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { BrainDumpSchema } from "@/lib/schemas";
import { getMember, updateMember } from "@/lib/store";

export const maxDuration = 60;

// Brain dump (plan.md §6): freeform text -> ideas + append/correct expert_pov (the moat loop).
export async function POST(req: Request) {
  try {
    const { member_id, text } = (await req.json()) as { member_id?: string; text?: string };
    if (!member_id || !text)
      return NextResponse.json({ error: "member_id and text required" }, { status: 400 });

    const member = await getMember(member_id);
    if (!member) return NextResponse.json({ error: "member not found" }, { status: 404 });

    const { object } = await generateObject({
      model: model(EXTRACT_MODEL),
      schema: BrainDumpSchema,
      system:
        `Process a freeform brain dump from ${member.name}. ` +
        `Their current beliefs: ${member.expert_pov.beliefs.join(" | ")}. ` +
        `Extract concrete post ideas AND any new/sharpened POV. ` +
        `Only return new_* items that are genuinely new or sharper than what they already hold.`,
      prompt: text,
    });

    // Append/correct POV; flip to confirmed when the dump adds real signal.
    const updated = await updateMember(member_id, (m) => {
      const merge = (a: string[], b: string[]) => Array.from(new Set([...a, ...b]));
      return {
        ...m,
        expert_pov: {
          beliefs: merge(m.expert_pov.beliefs, object.pov_updates.new_beliefs),
          topics: merge(m.expert_pov.topics, object.pov_updates.new_topics),
          hot_takes: merge(m.expert_pov.hot_takes, object.pov_updates.new_hot_takes),
          status: object.pov_updates.confirm ? "confirmed" : m.expert_pov.status,
        },
        corrections: [
          ...m.corrections,
          { at: new Date().toISOString(), kind: "brain_dump" as const, note: text.slice(0, 280) },
        ],
      };
    });

    return NextResponse.json({ ideas: object.ideas, pov: updated?.expert_pov });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "brain dump failed" },
      { status: 500 }
    );
  }
}

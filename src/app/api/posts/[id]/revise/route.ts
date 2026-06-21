// AI chat-edit for a draft: take the writer's plain-language feedback, rewrite the post in their
// voice applying it, and — crucially — record the feedback as a correction so it trains every
// future draft (the moat loop). Returns the revised body synchronously (one model call).
import { NextResponse } from "next/server";
import { z } from "zod";
import { generateObject } from "ai";
import { model, DRAFT_MODEL } from "@/lib/ai";
import { buildSystemPrompt } from "@/lib/prompt";
import { sanitize } from "@/lib/antislop";
import { getOrg, getMember, getPosts, updatePost, updateMember } from "@/lib/store";

export const maxDuration = 120;

const ReviseSchema = z.object({
  body: z.string().describe("The full revised LinkedIn post, ready to publish, in the member's voice"),
  voice_match: z.number().describe("Self-assessed 0-100 score for how much it still sounds like the member"),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { instruction } = (await req.json()) as { instruction?: string };
    if (!instruction?.trim()) return NextResponse.json({ error: "instruction required" }, { status: 400 });

    const posts = await getPosts();
    const post = posts.find((p) => p.id === id);
    if (!post) return NextResponse.json({ error: "post not found" }, { status: 404 });

    const [org, member] = await Promise.all([getOrg(), getMember(post.member_id)]);
    if (!org || !member) return NextResponse.json({ error: "workspace not found" }, { status: 404 });

    const system = buildSystemPrompt(org, member);
    const prompt = [
      `Here is the current draft of a LinkedIn post written as ${member.name}:`,
      ``,
      `"""`,
      post.body,
      `"""`,
      ``,
      `${member.name} gave this feedback on the draft:`,
      `"${instruction.trim()}"`,
      ``,
      `Rewrite the FULL post applying that feedback. Keep their voice exactly (match the real samples),`,
      `honor every anti-slop rule (no em-dashes, no AI-tell words, max 2 hashtags), and change only what`,
      `the feedback asks for. Return the complete revised post, not a diff or commentary.`,
    ].join("\n");

    const { object } = await generateObject({ model: model(DRAFT_MODEL), schema: ReviseSchema, system, prompt });
    const newBody = object.body.trim();
    const violations = sanitize(newBody).violations;

    const now = new Date().toISOString();
    const before = post.body;
    const updated = await updatePost(id, (p) => ({
      ...p,
      body: newBody,
      voice_match: object.voice_match,
      edits: [...p.edits, { at: now, before, after: newBody }],
    }));

    // Moat loop: the feedback itself is the lesson. Store it as a correction with the explicit
    // instruction in `note` so it surfaces in Core memory and steers future generations.
    await updateMember(member.member_id, (m) => ({
      ...m,
      corrections: [
        ...m.corrections,
        { at: now, kind: "edit", topic: post.topic, before, after: newBody, note: instruction.trim() },
      ],
    }));

    return NextResponse.json({
      ok: true,
      body: updated?.body ?? newBody,
      voice_match: object.voice_match,
      antislop: { pass: violations.length === 0, violations },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "revise failed" },
      { status: 500 }
    );
  }
}

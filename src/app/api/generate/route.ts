import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, DRAFT_MODEL } from "@/lib/ai";
import { GenerateSchema } from "@/lib/schemas";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { sanitize, type SlopViolation } from "@/lib/antislop";
import { getOrg, getMember, addPost, id } from "@/lib/store";
import type { Post } from "@/lib/types";

export const maxDuration = 120;

const MAX_TRIES = 3;

export async function POST(req: Request) {
  try {
    const { member_id, topic, angle } = (await req.json()) as {
      member_id?: string;
      topic?: string;
      angle?: string;
    };
    if (!member_id || !topic)
      return NextResponse.json({ error: "member_id and topic required" }, { status: 400 });

    const org = await getOrg();
    const member = await getMember(member_id);
    if (!org || !member) return NextResponse.json({ error: "member not found" }, { status: 404 });

    const system = buildSystemPrompt(org, member);

    let violations: SlopViolation[] = [];
    let object: typeof GenerateSchema._type | null = null;
    let attempts = 0;

    for (let i = 0; i < MAX_TRIES; i++) {
      attempts++;
      const res = await generateObject({
        model: model(DRAFT_MODEL),
        schema: GenerateSchema,
        system,
        prompt: buildUserPrompt(topic, angle ?? "", violations),
      });
      object = res.object;
      const check = sanitize(object.body);
      violations = check.violations;
      if (check.pass) break; // anti-slop gate passed
    }

    if (!object) return NextResponse.json({ error: "generation failed" }, { status: 500 });

    const passed = violations.length === 0;
    const post: Post = {
      id: id("post"),
      member_id,
      org_id: org.org_id,
      topic,
      angle: angle ?? "",
      body: object.body,
      generated_body: object.body,
      status: "draft",
      voice_match: object.voice_match,
      created_at: new Date().toISOString(),
      edits: [],
    };
    await addPost(post);

    return NextResponse.json({
      post,
      why: object.why,
      antislop: { pass: passed, violations, attempts },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { updatePost, updateMember, getPosts } from "@/lib/store";
import type { Post } from "@/lib/types";

// Approve / reject / edit a post. Every edit or reject is appended to the member's corrections.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { action, body } = (await req.json()) as {
      action: "approve" | "reject" | "edit";
      body?: string;
    };

    const posts = await getPosts();
    const existing = posts.find((p) => p.id === id);
    if (!existing) return NextResponse.json({ error: "post not found" }, { status: 404 });

    const now = new Date().toISOString();
    let updated: Post | undefined;

    if (action === "edit" && typeof body === "string") {
      const before = existing.body;
      updated = await updatePost(id, (p) => ({
        ...p,
        body,
        edits: [...p.edits, { at: now, before, after: body }],
      }));
      // moat loop: diff vs generated -> correction
      if (body.trim() !== existing.generated_body.trim()) {
        await updateMember(existing.member_id, (m) => ({
          ...m,
          corrections: [
            ...m.corrections,
            { at: now, kind: "edit", topic: existing.topic, before: existing.generated_body, after: body },
          ],
        }));
      }
    } else if (action === "approve") {
      updated = await updatePost(id, (p) => ({ ...p, status: "approved" }));
    } else if (action === "reject") {
      updated = await updatePost(id, (p) => ({ ...p, status: "rejected" }));
      await updateMember(existing.member_id, (m) => ({
        ...m,
        corrections: [...m.corrections, { at: now, kind: "reject", topic: existing.topic }],
      }));
    } else {
      return NextResponse.json({ error: "invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true, post: updated });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "update failed" },
      { status: 500 }
    );
  }
}

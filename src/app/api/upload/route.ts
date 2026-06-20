// Upload an image asset (company logo, profile picture, or a per-generation reference). Session-gated,
// writes to public/uploads, and returns the relative URL. The URL is persisted onto the org/member
// (onboarding) or passed straight into a generation job (per-generation reference).
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/auth";
import { id } from "@/lib/store";

export const maxDuration = 60;

const EXT: Record<string, string> = {
  "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif",
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!(session?.user as { id?: string } | undefined)?.id) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "must be an image" }, { status: 400 });

    const ext = EXT[file.type] ?? "png";
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    const name = `${id("up")}.${ext}`;
    await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "upload failed" }, { status: 500 });
  }
}

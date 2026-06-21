// Upload an image asset (company logo, profile picture, or a per-generation reference). Session-gated.
// Returns the image as a base64 data URL — nothing is written to disk (the filesystem is read-only
// on Vercel). The URL is persisted onto the org/member (onboarding) or passed straight into a
// generation job (per-generation reference); generateImage forwards data URLs to the image model.
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const maxDuration = 60;

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

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    const url = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "upload failed" }, { status: 500 });
  }
}

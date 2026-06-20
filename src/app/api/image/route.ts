// Generate an image or infographic for a post (OpenRouter, gpt-5.4-image), save it under
// public/generated, and attach the URL to the post.
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { generateImage } from "@/lib/images";
import { buildImagePrompt, type ImageKind } from "@/lib/imagePrompt";
import { getOrg, getPosts, setPostImage } from "@/lib/store";

export const maxDuration = 300; // gpt-5.4-image can take 2+ minutes

export async function POST(req: Request) {
  try {
    const { post_id, kind = "image" } = (await req.json()) as { post_id?: string; kind?: ImageKind };
    if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

    const [org, posts] = await Promise.all([getOrg(), getPosts()]);
    const post = posts.find((p) => p.id === post_id);
    if (!org || !post) return NextResponse.json({ error: "post not found" }, { status: 404 });

    const buf = await generateImage(buildImagePrompt(post, org, kind));
    if (!buf) {
      return NextResponse.json(
        { error: "Image model returned no image. Check OPENROUTER_IMAGE_MODEL / API key." },
        { status: 502 }
      );
    }

    const dir = path.join(process.cwd(), "public", "generated");
    await fs.mkdir(dir, { recursive: true });
    const file = `${post_id}-${kind}-${Math.random().toString(36).slice(2, 8)}.png`;
    await fs.writeFile(path.join(dir, file), buf);
    const url = `/generated/${file}`;

    await setPostImage(post_id, url);
    return NextResponse.json({ url, kind });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "image generation failed" },
      { status: 500 }
    );
  }
}

// Generate a LinkedIn carousel for a post: plan 5 slides (hook / value x3 / cta) with an LLM,
// then render each slide image in parallel (build-spec 5-block method), and attach to the post.
import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { CarouselSchema } from "@/lib/schemas";
import { generateImage } from "@/lib/images";
import { buildCarouselSlidePrompt } from "@/lib/imagePrompt";
import { getOrg, getPosts, setPostCarousel } from "@/lib/store";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { post_id } = (await req.json()) as { post_id?: string };
    if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

    const [org, posts] = await Promise.all([getOrg(), getPosts()]);
    const post = posts.find((p) => p.id === post_id);
    if (!org || !post) return NextResponse.json({ error: "post not found" }, { status: 404 });

    // 1. Plan the slides.
    const { object } = await generateObject({
      model: model(EXTRACT_MODEL),
      schema: CarouselSchema,
      system:
        "Turn the post into a 5-slide LinkedIn carousel: slide 1 = hook (the scroll-stopping claim), " +
        "slides 2-4 = value (one point each), slide 5 = cta (a clear next step / question). " +
        "Short, punchy, on the same idea. No em-dashes, no buzzwords.",
      prompt: `${post.topic}\n\n${post.body}`,
    });
    const slides = object.slides.slice(0, 6);

    // 2. Render each slide image in parallel.
    const dir = path.join(process.cwd(), "public", "generated");
    await fs.mkdir(dir, { recursive: true });
    const rendered = await Promise.all(
      slides.map(async (s, i) => {
        try {
          const buf = await generateImage(buildCarouselSlidePrompt(s, org, i, slides.length));
          if (!buf) return { ...s, url: "" };
          const file = `${post_id}-slide${i + 1}-${Math.random().toString(36).slice(2, 7)}.png`;
          await fs.writeFile(path.join(dir, file), buf);
          return { ...s, url: `/generated/${file}` };
        } catch {
          return { ...s, url: "" };
        }
      })
    );

    const withImages = rendered.filter((s) => s.url);
    if (withImages.length === 0) {
      return NextResponse.json({ error: "Image model returned no slides. Check the image model / key." }, { status: 502 });
    }

    await setPostCarousel(post_id, rendered);
    return NextResponse.json({ slides: rendered });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "carousel generation failed" },
      { status: 500 }
    );
  }
}

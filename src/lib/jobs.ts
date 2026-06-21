// Background job runners — the heavy generation work that the /api/generate, /api/image and
// /api/carousel routes used to do synchronously. Each route now creates a job row, schedules the
// matching runner via after(), and returns a job id the client polls. Runners take explicitly
// resolved entities (no request session) and write their result onto the job row.
import { generateObject } from "ai";
import { model, DRAFT_MODEL, EXTRACT_MODEL } from "@/lib/ai";
import { GenerateSchema, CarouselSchema } from "@/lib/schemas";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/prompt";
import { sanitize, type SlopViolation } from "@/lib/antislop";
import { generateImage } from "@/lib/images";
import { buildImagePrompt, buildCarouselSlidePrompt, type ImageKind } from "@/lib/imagePrompt";
import { mockGenerate } from "@/lib/mockGen";
import { LOVRO_POST_BODY, LOVRO_POST_VOICE_MATCH, LOVRO_POST_WHY, LOVRO_INFOGRAPHIC_URL } from "@/lib/lovro";
import { addPost, setPostImage, setPostCarousel, updateJob, id } from "@/lib/store";
import type { Org, Member, Post } from "@/lib/types";

const MAX_TRIES = 3;
const MOCK = process.env.MOCK_GENERATION === "1";

// The hardcoded demo paths (Lovro) finish instantly, which gives the trick away. Hold them in
// "running" for a believable beat — roughly how long the real LLM / image model takes — so the
// client's polling spinner behaves like a normal generation. A little jitter keeps it natural.
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const demoDelay = (base: number, jitter: number) => sleep(base + Math.floor(Math.random() * jitter));
const DEMO_POST_DELAY = { base: 4000, jitter: 2500 }; // ~4-6.5s, like a draft coming back
const DEMO_IMAGE_DELAY = { base: 8000, jitter: 4000 }; // ~8-12s, like an image render

// Brand/reference images for a generation, in priority order: a per-generation override first,
// then the toggled-on brand assets. Built generically so harvested post visuals can be added later.
export function collectRefs(
  org: Org | null,
  member: Member | null | undefined,
  opts: { useLogo?: boolean; useProfile?: boolean; refUrl?: string | null }
): string[] {
  const refs: string[] = [];
  if (opts.refUrl) refs.push(opts.refUrl);
  if (opts.useLogo && org?.logo_url) refs.push(org.logo_url);
  if (opts.useProfile && member?.profile_picture_url) refs.push(member.profile_picture_url);
  return refs;
}

// ---- post ----
export async function runPostJob(
  jobId: string, org: Org, member: Member, topic: string, angle: string, lovro = false
): Promise<void> {
  try {
    await updateJob(jobId, { status: "running" });

    // Demo: Lovro's "Generate" always returns the one hand-written post, regardless of the idea
    // he typed. Skip the LLM entirely, but wait a beat so it feels like a real generation.
    if (lovro) {
      await demoDelay(DEMO_POST_DELAY.base, DEMO_POST_DELAY.jitter);
      const post: Post = {
        id: id("post"),
        member_id: member.member_id,
        org_id: org.org_id,
        topic,
        angle,
        body: LOVRO_POST_BODY,
        generated_body: LOVRO_POST_BODY,
        status: "draft",
        voice_match: LOVRO_POST_VOICE_MATCH,
        created_at: new Date().toISOString(),
        edits: [],
      };
      await addPost(post);
      await updateJob(jobId, {
        status: "done",
        post_id: post.id,
        result: { post, why: LOVRO_POST_WHY, antislop: { pass: true, violations: [], attempts: 1 }, mocked: false },
      });
      return;
    }

    const system = buildSystemPrompt(org, member);

    let violations: SlopViolation[] = [];
    let object: typeof GenerateSchema._type | null = null;
    let attempts = 0;
    let mocked = false;

    if (MOCK) {
      object = mockGenerate(org, member, topic);
      violations = sanitize(object.body).violations;
      attempts = 1;
      mocked = true;
    } else {
      try {
        for (let i = 0; i < MAX_TRIES; i++) {
          attempts++;
          const res = await generateObject({
            model: model(DRAFT_MODEL),
            schema: GenerateSchema,
            system,
            prompt: buildUserPrompt(topic, angle, violations),
          });
          object = res.object;
          const check = sanitize(object.body);
          violations = check.violations;
          if (check.pass) break; // anti-slop gate passed
        }
      } catch (genErr) {
        // Never dead-end the Create flow: fall back to a mock draft if the live LLM call fails.
        console.error("[generate] live LLM failed, using mock fallback:", genErr);
        object = mockGenerate(org, member, topic);
        violations = sanitize(object.body).violations;
        mocked = true;
      }
    }

    if (!object) {
      await updateJob(jobId, { status: "error", error: "generation failed" });
      return;
    }

    const passed = violations.length === 0;
    const post: Post = {
      id: id("post"),
      member_id: member.member_id,
      org_id: org.org_id,
      topic,
      angle,
      body: object.body,
      generated_body: object.body,
      status: "draft",
      voice_match: object.voice_match,
      created_at: new Date().toISOString(),
      edits: [],
    };
    await addPost(post);

    await updateJob(jobId, {
      status: "done",
      post_id: post.id,
      result: { post, why: object.why, antislop: { pass: passed, violations, attempts }, mocked },
    });
  } catch (e) {
    await updateJob(jobId, { status: "error", error: e instanceof Error ? e.message : "generation failed" });
  }
}

// ---- image / infographic ----
export async function runImageJob(
  jobId: string, org: Org, post: Post, kind: ImageKind, refs: string[], lovro = false
): Promise<void> {
  try {
    await updateJob(jobId, { status: "running" });

    // Demo: Lovro's infographic returns the static, committed overview image (no model call),
    // after a render-like pause so it feels generated.
    if (lovro && kind === "infographic") {
      await demoDelay(DEMO_IMAGE_DELAY.base, DEMO_IMAGE_DELAY.jitter);
      await setPostImage(post.id, LOVRO_INFOGRAPHIC_URL, org.org_id);
      await updateJob(jobId, { status: "done", result: { url: LOVRO_INFOGRAPHIC_URL, kind } });
      return;
    }

    const url = await generateImage(buildImagePrompt(post, org, kind), refs);
    if (!url) {
      await updateJob(jobId, { status: "error", error: "Image model returned no image. Check OPENROUTER_IMAGE_MODEL / API key." });
      return;
    }
    // No disk write (read-only filesystem on Vercel): the data URL is stored and rendered directly.
    await setPostImage(post.id, url, org.org_id);
    await updateJob(jobId, { status: "done", result: { url, kind } });
  } catch (e) {
    await updateJob(jobId, { status: "error", error: e instanceof Error ? e.message : "image generation failed" });
  }
}

// ---- carousel ----
export async function runCarouselJob(
  jobId: string, org: Org, post: Post, refs: string[]
): Promise<void> {
  try {
    await updateJob(jobId, { status: "running" });

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

    // 2. Render each slide image in parallel (same brand refs across the set). The model returns
    // each image as a data URL — stored and rendered directly, no disk write (read-only on Vercel).
    const rendered = await Promise.all(
      slides.map(async (s, i) => {
        try {
          const url = await generateImage(buildCarouselSlidePrompt(s, org, i, slides.length), refs);
          return { ...s, url: url ?? "" };
        } catch {
          return { ...s, url: "" };
        }
      })
    );

    if (rendered.every((s) => !s.url)) {
      await updateJob(jobId, { status: "error", error: "Image model returned no slides. Check the image model / key." });
      return;
    }

    await setPostCarousel(post.id, rendered, org.org_id);
    await updateJob(jobId, { status: "done", result: { slides: rendered } });
  } catch (e) {
    await updateJob(jobId, { status: "error", error: e instanceof Error ? e.message : "carousel generation failed" });
  }
}

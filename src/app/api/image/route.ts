// Kick off image / infographic generation as a background job (OpenRouter, openai/gpt-5.4-image-2,
// optional brand reference images), and return a job id the client polls. The actual render —
// which can take 2+ minutes — runs in after(), then attaches the saved URL to the post.
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getOrg, getPosts, getMember, createJob, currentUserEmail } from "@/lib/store";
import { runImageJob, collectRefs } from "@/lib/jobs";
import { isLovro } from "@/lib/lovro";
import type { ImageKind } from "@/lib/imagePrompt";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { post_id, kind = "image", use_logo, use_profile, ref_url } = (await req.json()) as {
      post_id?: string;
      kind?: ImageKind;
      use_logo?: boolean;
      use_profile?: boolean;
      ref_url?: string;
    };
    if (!post_id) return NextResponse.json({ error: "post_id required" }, { status: 400 });

    const [org, posts] = await Promise.all([getOrg(), getPosts()]);
    const post = posts.find((p) => p.id === post_id);
    if (!org || !post) return NextResponse.json({ error: "post not found" }, { status: 404 });

    const member = await getMember(post.member_id);
    const refs = collectRefs(org, member, { useLogo: use_logo, useProfile: use_profile, refUrl: ref_url });

    const jobId = await createJob("image", { kind, refs }, post_id);
    if (!jobId) return NextResponse.json({ error: "no workspace" }, { status: 401 });

    const lovro = isLovro(await currentUserEmail());
    after(() => runImageJob(jobId, org, post, kind, refs, lovro));
    return NextResponse.json({ job_id: jobId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "image generation failed" },
      { status: 500 }
    );
  }
}

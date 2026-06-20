// Kick off carousel generation as a background job: it plans 5 slides (hook / value x3 / cta) with
// an LLM, then renders each slide image (build-spec 5-block method, optional brand reference images).
// The work runs in after() and attaches the slides to the post; the client polls the returned job id.
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getOrg, getPosts, getMember, createJob } from "@/lib/store";
import { runCarouselJob, collectRefs } from "@/lib/jobs";

export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const { post_id, use_logo, use_profile, ref_url } = (await req.json()) as {
      post_id?: string;
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

    const jobId = await createJob("carousel", { refs }, post_id);
    if (!jobId) return NextResponse.json({ error: "no workspace" }, { status: 401 });

    after(() => runCarouselJob(jobId, org, post, refs));
    return NextResponse.json({ job_id: jobId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "carousel generation failed" },
      { status: 500 }
    );
  }
}

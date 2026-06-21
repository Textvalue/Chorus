// Kick off post generation as a background job: resolve org + member, create a job row, run the
// work after the response is sent (it can take a while + retries), and return a job id to poll.
import { NextResponse } from "next/server";
import { after } from "next/server";
import { getOrg, getMember, createJob, currentUserEmail } from "@/lib/store";
import { runPostJob } from "@/lib/jobs";
import { isLovro } from "@/lib/lovro";

export const maxDuration = 300;

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

    const jobId = await createJob("post", { member_id, topic, angle: angle ?? "" });
    if (!jobId) return NextResponse.json({ error: "no workspace" }, { status: 401 });

    const lovro = isLovro(await currentUserEmail());
    after(() => runPostJob(jobId, org, member, topic, angle ?? "", lovro));
    return NextResponse.json({ job_id: jobId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "generation failed" },
      { status: 500 }
    );
  }
}

// Poll a background generation job. The client calls this every couple seconds until status is
// done (read result) or error (read error). Scoped to the caller's org via getJob.
import { NextResponse } from "next/server";
import { getJob } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "job not found" }, { status: 404 });
  return NextResponse.json({ status: job.status, result: job.result, error: job.error, post_id: job.post_id });
}

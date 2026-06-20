// Add a voice to the current user's ensemble from a LinkedIn URL.
import { NextResponse } from "next/server";
import { captureMember } from "@/lib/captureMember";
import { getOrg, upsertMember, id } from "@/lib/store";
import type { Member } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const { linkedin_url } = (await req.json()) as { linkedin_url?: string };
    if (!linkedin_url) {
      return NextResponse.json({ error: "linkedin_url is required" }, { status: 400 });
    }
    const org = await getOrg();
    if (!org) {
      return NextResponse.json({ error: "Finish onboarding first." }, { status: 400 });
    }

    const { draft, mocked } = await captureMember(linkedin_url);
    const member: Member = {
      member_id: id("mem"),
      org_id: org.org_id,
      name: draft.name || "New member",
      headline: draft.headline ?? "",
      linkedin_url,
      voice_dna: draft.voice_dna,
      prose_samples: draft.prose_samples ?? [],
      expert_pov: { ...draft.expert_pov, status: "inferred" },
      corrections: [],
    };
    await upsertMember(member);
    return NextResponse.json({ ok: true, member, mocked });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "could not add member" },
      { status: 500 }
    );
  }
}

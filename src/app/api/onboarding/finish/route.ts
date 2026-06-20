// Commit a completed onboarding: save the verified Score + the captured member in one step.
import { NextResponse } from "next/server";
import { saveOrg, upsertMember, id } from "@/lib/store";
import type { Org, Member } from "@/lib/types";
import type { OrgExtract } from "@/lib/schemas";
import type { MemberDraft } from "@/lib/mockOnboard";

export async function POST(req: Request) {
  try {
    const { org: orgDraft, member: memberDraft, linkedin_url, logo_url, profile_picture_url } = (await req.json()) as {
      org: OrgExtract & { website?: string };
      member: MemberDraft;
      linkedin_url?: string;
      logo_url?: string | null;
      profile_picture_url?: string | null;
    };
    if (!orgDraft || !memberDraft) {
      return NextResponse.json({ error: "org and member are required" }, { status: 400 });
    }

    const orgId = id("org");
    const org: Org = {
      org_id: orgId,
      owner_member_id: null,
      name: orgDraft.name ?? "Your company",
      website: orgDraft.website ?? "",
      positioning: orgDraft.positioning ?? "",
      icp: orgDraft.icp ?? { personas: [], pains: [], anti_personas: [] },
      competitors: orgDraft.competitors ?? [],
      brand_dna: orgDraft.brand_dna ?? {
        voice_rules: [],
        narrative_atoms: { audience: "", problem: "", outcome: "", proof: "", offer: "" },
      },
      logo_url: logo_url ?? null,
    };
    await saveOrg(org);

    const member: Member = {
      member_id: id("mem"),
      org_id: orgId,
      name: memberDraft.name || "New member",
      headline: memberDraft.headline ?? "",
      linkedin_url: linkedin_url ?? "",
      voice_dna: memberDraft.voice_dna,
      prose_samples: memberDraft.prose_samples ?? [],
      expert_pov: { ...memberDraft.expert_pov, status: "inferred" },
      corrections: [],
      profile_picture_url: profile_picture_url ?? null,
    };
    await upsertMember(member); // first member becomes the org owner

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "could not finish onboarding" },
      { status: 500 }
    );
  }
}

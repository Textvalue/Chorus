import { NextResponse } from "next/server";
import { saveOrg, getOrg, id } from "@/lib/store";
import type { Org } from "@/lib/types";

export async function POST(req: Request) {
  try {
    const draft = (await req.json()) as Partial<Org>;
    const existing = await getOrg();
    const org: Org = {
      org_id: existing?.org_id ?? id("org"),
      owner_member_id: existing?.owner_member_id ?? null,
      name: draft.name ?? "Untitled",
      website: draft.website ?? "",
      positioning: draft.positioning ?? "",
      icp: draft.icp ?? { personas: [], pains: [], anti_personas: [] },
      competitors: draft.competitors ?? [],
      brand_dna: draft.brand_dna ?? {
        voice_rules: [],
        narrative_atoms: { audience: "", problem: "", outcome: "", proof: "", offer: "" },
      },
    };
    await saveOrg(org);
    return NextResponse.json({ ok: true, org });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "save failed" },
      { status: 500 }
    );
  }
}

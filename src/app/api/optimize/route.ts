// LinkedIn profile optimizer: scrape a member's profile, return a grounded, voice-matched makeover.
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { model, EXTRACT_MODEL } from "@/lib/ai";
import { ProfileMakeoverSchema } from "@/lib/schemas";
import { fetchProfileFull, type LinkedInProfile } from "@/lib/harvest";
import { buildProfilePrompt } from "@/lib/profilePrompt";
import { mockProfile, mockMakeover } from "@/lib/mockOptimize";
import { getOrg, getMember } from "@/lib/store";

export const maxDuration = 120;
const MOCK = process.env.MOCK_GENERATION === "1";

export async function POST(req: Request) {
  try {
    const { member_id, linkedin_url } = (await req.json()) as { member_id?: string; linkedin_url?: string };
    if (!member_id) return NextResponse.json({ error: "member_id required" }, { status: 400 });

    const org = await getOrg();
    const member = await getMember(member_id);
    if (!org || !member) return NextResponse.json({ error: "member not found" }, { status: 404 });

    const url = linkedin_url || member.linkedin_url;

    // 1. Scrape the profile (fall back to stored data if Harvest is unavailable).
    let profile: LinkedInProfile;
    let scraped = false;
    try {
      if (!url) throw new Error("no linkedin url on file");
      profile = await fetchProfileFull(url);
      scraped = true;
    } catch (e) {
      console.error("[optimize] profile scrape fell back to stored data:", e);
      profile = mockProfile(member);
    }

    // 2. Generate the makeover (fall back to a deterministic mock on LLM failure / MOCK flag).
    let makeover;
    let mocked = false;
    if (MOCK) {
      makeover = mockMakeover(org, member, profile);
      mocked = true;
    } else {
      try {
        const { object } = await generateObject({
          model: model(EXTRACT_MODEL),
          schema: ProfileMakeoverSchema,
          system: buildProfilePrompt(org, member, profile),
          prompt: `Audit and rewrite ${member.name}'s LinkedIn profile. Return the full makeover.`,
        });
        makeover = object;
      } catch (e) {
        console.error("[optimize] LLM fell back to mock:", e);
        makeover = mockMakeover(org, member, profile);
        mocked = true;
      }
    }

    return NextResponse.json({ profile, makeover, scraped, mocked });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "optimize failed" },
      { status: 500 }
    );
  }
}

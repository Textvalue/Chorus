import { Suspense } from "react";
import { promises as fs } from "fs";
import path from "path";
import { getMembers, getOrg } from "@/lib/store";
import { CreateView, type Template } from "@/components/CreateView";

export const dynamic = "force-dynamic";

// Infographic template library (curated originals from the megathon corpus). Used as reference
// images when generating infographics. Built by scripts/build-templates.ts; absent until then.
async function loadTemplates(): Promise<Template[]> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "templates", "manifest.json"), "utf8");
    return JSON.parse(raw) as Template[];
  } catch {
    return [];
  }
}

export default async function CreatePage() {
  const [members, org, templates] = await Promise.all([getMembers(), getOrg(), loadTemplates()]);
  const starters = (members[0]?.expert_pov.beliefs ?? []).slice(0, 3);
  return (
    <Suspense>
      <CreateView
        members={members.map((m) => ({ id: m.member_id, name: m.name, headline: m.headline, profile_picture_url: m.profile_picture_url ?? null }))}
        orgName={org?.name ?? ""}
        orgLogo={org?.logo_url ?? null}
        templates={templates}
        starters={starters}
      />
    </Suspense>
  );
}

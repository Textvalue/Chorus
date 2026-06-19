import { Suspense } from "react";
import { getMembers, getOrg } from "@/lib/store";
import { CreateView } from "@/components/CreateView";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const [members, org] = await Promise.all([getMembers(), getOrg()]);
  const starters = (members[0]?.expert_pov.beliefs ?? []).slice(0, 3);
  return (
    <Suspense>
      <CreateView
        members={members.map((m) => ({ id: m.member_id, name: m.name, headline: m.headline }))}
        orgName={org?.name ?? ""}
        starters={starters}
      />
    </Suspense>
  );
}

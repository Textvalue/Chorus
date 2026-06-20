import { getMembers } from "@/lib/store";
import { OptimizeView } from "@/components/OptimizeView";

export const dynamic = "force-dynamic";

export default async function OptimizePage() {
  const members = await getMembers();
  return (
    <OptimizeView
      members={members.map((m) => ({ id: m.member_id, name: m.name, headline: m.headline, url: m.linkedin_url }))}
    />
  );
}

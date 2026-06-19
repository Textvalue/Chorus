import { getMembers } from "@/lib/store";
import { IdeasView } from "@/components/IdeasView";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const members = await getMembers();
  return <IdeasView members={members.map((m) => ({ id: m.member_id, name: m.name }))} />;
}

import { getMembers } from "@/lib/store";
import { BrainDumpView } from "@/components/BrainDumpView";

export const dynamic = "force-dynamic";

export default async function BrainDumpPage() {
  const members = await getMembers();
  return <BrainDumpView members={members.map((m) => ({ id: m.member_id, name: m.name }))} />;
}

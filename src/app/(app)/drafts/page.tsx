import { getPosts, getMembers } from "@/lib/store";
import { DraftsView } from "@/components/DraftsView";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const [posts, members] = await Promise.all([getPosts(), getMembers()]);
  const nameById = Object.fromEntries(members.map((m) => [m.member_id, m.name]));
  return (
    <DraftsView
      posts={posts.map((p) => ({
        id: p.id,
        topic: p.topic,
        body: p.body,
        status: p.status,
        member: nameById[p.member_id] ?? "Unknown",
        angle: p.angle,
      }))}
    />
  );
}

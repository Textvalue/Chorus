import { redirect } from "next/navigation";
import { getOrg, getMembers } from "@/lib/store";
import { Rail } from "@/components/Rail";
import { ToastProvider } from "@/components/Toast";
import { initials } from "@/lib/avatar";

export const dynamic = "force-dynamic";

// Gate (plan.md §3c): dashboard locked until org exists AND a member has voice_dna + prose_samples.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const org = await getOrg();
  if (!org) redirect("/onboarding/org");

  const members = await getMembers();
  const ready = members.some(
    (m) => m.prose_samples.length > 0 && m.voice_dna.traits.length > 0
  );
  if (!ready) redirect("/onboarding/member");

  const owner =
    members.find((m) => m.member_id === org.owner_member_id) ?? members[0];

  return (
    <ToastProvider>
      <div className="app">
        <Rail ownerInitials={owner ? initials(owner.name) : "ME"} />
        <main className="main">{children}</main>
      </div>
    </ToastProvider>
  );
}

import { redirect } from "next/navigation";
import { getOrg, getMembers } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";
import { Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

// Gate (plan.md §3c): the app is locked until an org exists AND a member has a voice.
// Seed data ships a tuned demo team, so this passes out of the box.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const org = await getOrg();
  if (!org) redirect("/onboarding");

  const members = await getMembers();
  const ready = members.some((m) => m.prose_samples.length > 0);
  if (!ready) redirect("/onboarding");

  const owner = members.find((m) => m.member_id === org.owner_member_id) ?? members[0];

  return (
    <ToastProvider>
      <div className="app">
        <Sidebar
          user={{ name: owner?.name ?? "You", role: `Bandleader · ${org.name}`, instrument: "Conductor" }}
        />
        <main className="main">
          <div className="topstrip">
            <Icon.search size={19} />
            <Icon.bell size={19} />
            <span className="ws">{org.name} · Pro</span>
          </div>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}

import { redirect } from "next/navigation";
import { getOrg, getMembers } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const org = await getOrg();
  if (!org) redirect("/onboarding");
  const members = await getMembers();
  const ready = members.some((m) => m.prose_samples.length > 0);
  redirect(ready ? "/studio" : "/onboarding");
}

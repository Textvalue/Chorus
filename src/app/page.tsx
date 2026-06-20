import { redirect } from "next/navigation";
import { Instrument_Serif, Instrument_Sans } from "next/font/google";
import { auth } from "@/auth";
import { getOrg, getMembers } from "@/lib/store";
import { Landing } from "@/components/Landing";

export const dynamic = "force-dynamic";

// Instrument Serif / Sans — a thematic nod to the product's "give each person their instrument" idea.
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--lp-serif",
  display: "swap",
});
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--lp-sans", display: "swap" });

export default async function Home() {
  const session = await auth();
  if (session?.user) {
    const org = await getOrg();
    if (!org) redirect("/onboarding");
    const members = await getMembers();
    redirect(members.some((m) => m.prose_samples.length > 0) ? "/create" : "/onboarding");
  }
  return (
    <div className={`${serif.variable} ${sans.variable}`}>
      <Landing />
    </div>
  );
}

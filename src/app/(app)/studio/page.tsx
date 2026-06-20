// Studio — the daily home (PRD §5.0). Deliberately minimal: a greeting and the two
// jobs plus the daily habit. The richer progression / reach / team views live on their
// own screens (Achievements, Ensemble).
import Link from "next/link";
import { getOrg, getMembers, getPosts } from "@/lib/store";
import { Card, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

type Accent = "blue" | "teal" | "green";
const tint: Record<Accent, { bg: string; fg: string }> = {
  blue: { bg: "var(--blue-50)", fg: "var(--blue-600)" },
  teal: { bg: "var(--teal-50)", fg: "var(--teal-600)" },
  green: { bg: "var(--green-50)", fg: "var(--green-600)" },
};

function ActionCard({ href, eyebrow, title, body, icon, accent }: { href: string; eyebrow: string; title: string; body: string; icon: React.ReactNode; accent: Accent }) {
  const t = tint[accent];
  return (
    <Link href={href} style={{ display: "block" }}>
      <Card interactive style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 168 }}>
        <span style={{ width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: t.bg, color: t.fg }}>
          {icon}
        </span>
        <div>
          <div className="eyebrow" style={{ color: t.fg }}>{eyebrow}</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: "var(--text-strong)", margin: "5px 0 6px" }}>{title}</div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>{body}</p>
        </div>
      </Card>
    </Link>
  );
}

export default async function StudioPage() {
  const [org, members, posts] = await Promise.all([getOrg(), getMembers(), getPosts()]);
  const owner = members.find((m) => m.member_id === org?.owner_member_id) ?? members[0];
  const first = owner?.name.split(" ")[0] ?? "there";
  const waiting = posts.filter((p) => p.status === "draft").length;

  return (
    <div className="main-inner">
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, color: "var(--text-strong)" }}>
          Good to see you, {first}.
        </h1>
        <p style={{ fontSize: 16, color: "var(--text-muted)", margin: "8px 0 0" }}>
          Two ways in — or just tell me what you&apos;re seeing this week.
        </p>
      </div>

      <div className="grid3">
        <ActionCard
          href="/create"
          eyebrow="I have an idea"
          title="Create"
          body="Write a post in your real voice. We catch the off-brand notes before you see them."
          icon={<Icon.create size={20} />}
          accent="blue"
        />
        <ActionCard
          href="/ideas"
          eyebrow="I need inspiration"
          title="Ideas"
          body="On-brand angles, pulled from what you actually believe."
          icon={<Icon.ideas size={20} />}
          accent="teal"
        />
        <ActionCard
          href="/riff"
          eyebrow="Got 60 seconds"
          title="Record a note"
          body="The daily habit that keeps your voice in tune."
          icon={<Icon.riff size={20} />}
          accent="green"
        />
      </div>

      {waiting > 0 && (
        <Link
          href="/rehearsal"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28, fontSize: 14, fontWeight: 600, color: "var(--text-link)" }}
        >
          <Icon.rehearsal size={16} color="var(--blue-600)" />
          {waiting} {waiting === 1 ? "draft is" : "drafts are"} waiting for you in Rehearsal
          <Icon.chevronRight size={15} color="var(--blue-600)" />
        </Link>
      )}
    </div>
  );
}

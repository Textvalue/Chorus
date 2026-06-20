// Studio — the daily home. An editorial dashboard: a warm greeting, a quick read on
// where the workspace stands, the two ways to start, and what's waiting for you.
import Link from "next/link";
import { getOrg, getMembers, getPosts } from "@/lib/store";
import { Card, Icon, Avatar } from "@/components/ds";

export const dynamic = "force-dynamic";

type Accent = "brass" | "teal" | "green";
const tint: Record<Accent, { bg: string; fg: string }> = {
  brass: { bg: "var(--brass-50)", fg: "var(--brass-700)" },
  teal: { bg: "var(--teal-50)", fg: "var(--teal-600)" },
  green: { bg: "var(--green-50)", fg: "var(--green-600)" },
};

function ActionCard({ href, eyebrow, title, body, icon, accent }: { href: string; eyebrow: string; title: string; body: string; icon: React.ReactNode; accent: Accent }) {
  const t = tint[accent];
  return (
    <Link href={href} style={{ display: "block" }}>
      <Card interactive style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 184 }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center", background: t.bg, color: t.fg }}>
          {icon}
        </span>
        <div>
          <div className="eyebrow" style={{ color: t.fg }}>{eyebrow}</div>
          <div style={{ fontFamily: "var(--serif)", fontSize: 25, fontWeight: 400, letterSpacing: "-0.01em", color: "var(--text-strong)", margin: "4px 0 7px" }}>{title}</div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55 }}>{body}</p>
        </div>
      </Card>
    </Link>
  );
}

function StatCard({ value, label, accent }: { value: React.ReactNode; label: string; accent: Accent }) {
  const t = tint[accent];
  return (
    <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ width: 26, height: 4, borderRadius: 999, background: t.fg, marginBottom: 10 }} />
      <span style={{ fontFamily: "var(--serif)", fontSize: 36, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1, color: "var(--text-strong)" }}>{value}</span>
      <span style={{ fontSize: 13.5, color: "var(--text-muted)", marginTop: 6 }}>{label}</span>
    </Card>
  );
}

function SectionLabel({ children, href, linkLabel }: { children: React.ReactNode; href?: string; linkLabel?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, margin: "40px 0 16px", paddingBottom: 10, borderBottom: "1px solid var(--border-subtle)" }}>
      <span className="eyebrow muted">{children}</span>
      {href && (
        <Link href={href} style={{ fontSize: 13, fontWeight: 600, color: "var(--text-link)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          {linkLabel} <Icon.chevronRight size={14} color="var(--brass-600)" />
        </Link>
      )}
    </div>
  );
}

export default async function StudioPage() {
  const [org, members, posts] = await Promise.all([getOrg(), getMembers(), getPosts()]);
  const owner = members.find((m) => m.member_id === org?.owner_member_id) ?? members[0];
  const first = owner?.name.split(" ")[0] ?? "there";

  const waiting = posts.filter((p) => p.status === "draft").length;
  const approved = posts.filter((p) => p.status === "approved").length;
  const scored = posts.filter((p) => typeof p.voice_match === "number");
  const avgVoice = scored.length ? Math.round(scored.reduce((a, p) => a + p.voice_match, 0) / scored.length) : null;

  const nameOf = (id: string) => members.find((m) => m.member_id === id)?.name ?? "Someone";
  const recent = [...posts]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 5);

  const statusPill: Record<string, { cls: string; label: string }> = {
    draft: { cls: "pill need", label: "Needs you" },
    approved: { cls: "pill sched", label: "Approved" },
    rejected: { cls: "pill rejected", label: "Passed" },
  };

  return (
    <div className="main-inner">
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: 44, fontWeight: 400, letterSpacing: "-0.02em", margin: 0, color: "var(--text-strong)", lineHeight: 1.02 }}>
          Good to see you, {first}.
        </h1>
        <p style={{ fontSize: 16.5, color: "var(--text-muted)", margin: "10px 0 0", maxWidth: "52ch" }}>
          Here&apos;s where {org?.name ?? "your team"} stands today — and two quick ways to add to it.
        </p>
      </div>

      {/* Quick read on the workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 16 }}>
        <StatCard value={waiting} label={waiting === 1 ? "Draft needs you" : "Drafts need you"} accent="brass" />
        <StatCard value={approved} label="Approved & ready" accent="green" />
        <StatCard value={members.length} label={members.length === 1 ? "Teammate" : "Teammates"} accent="teal" />
        <StatCard value={avgVoice === null ? "—" : `${avgVoice}%`} label="Avg. sounds-like-you" accent="brass" />
      </div>

      {/* Two ways to start */}
      <SectionLabel>Start something</SectionLabel>
      <div className="grid3">
        <ActionCard
          href="/create"
          eyebrow="I have an idea"
          title="Create"
          body="Write a post in your real voice. We catch the off-brand notes before you ever see them."
          icon={<Icon.create size={21} />}
          accent="brass"
        />
        <ActionCard
          href="/ideas"
          eyebrow="I need inspiration"
          title="Ideas"
          body="On-brand angles, pulled from what you actually believe."
          icon={<Icon.ideas size={21} />}
          accent="teal"
        />
        <ActionCard
          href="/riff"
          eyebrow="Got 60 seconds"
          title="Jot a note"
          body="The quick daily habit that keeps your writing voice sharp."
          icon={<Icon.notes size={21} />}
          accent="green"
        />
      </div>

      {/* What's waiting */}
      {recent.length > 0 && (
        <>
          <SectionLabel href="/queue" linkLabel="All in queue">Recent work</SectionLabel>
          <Card style={{ padding: "6px 24px" }}>
            {recent.map((p) => {
              const pill = statusPill[p.status] ?? statusPill.draft;
              return (
                <Link key={p.id} href="/queue" className="qrow" style={{ textDecoration: "none" }}>
                  <Avatar name={nameOf(p.member_id)} lg />
                  <div className="qb">
                    <div className="qh">{p.topic || p.body.split("\n")[0].slice(0, 64)}</div>
                    <div className="qm">{nameOf(p.member_id)}{p.angle ? ` · ${p.angle}` : ""}</div>
                  </div>
                  {typeof p.voice_match === "number" && (
                    <span style={{ fontSize: 12.5, color: "var(--text-muted)", flex: "none" }}>{p.voice_match}% you</span>
                  )}
                  <span className={pill.cls}>{pill.label}</span>
                </Link>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}

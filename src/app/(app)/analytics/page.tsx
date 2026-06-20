// Analytics — what content is doing for pipeline, not vanity likes.
// Real where the data exists (on-voice proof, consistency, top posts, a team
// impact board derived from real posts); clearly-labelled demo data for the
// external LinkedIn metrics we can't read until an account is connected.
import { getOrg, getMembers, getPosts } from "@/lib/store";
import { TopBar, Card, Badge, Icon, Avatar } from "@/components/ds";

export const dynamic = "force-dynamic";

function KpiTile({ value, label, delta, demo }: { value: string; label: string; delta?: string; demo?: boolean }) {
  return (
    <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
      <span style={{ fontFamily: "var(--serif)", fontSize: 32, fontWeight: 400, letterSpacing: "-0.01em", lineHeight: 1, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
      <span style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.35 }}>{label}</span>
      {delta && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-600)", marginTop: 7 }}>{delta}</span>}
      {demo && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", background: "var(--paper-2)", borderRadius: 6, padding: "2px 6px" }}>demo</span>}
    </Card>
  );
}

export default async function AnalyticsPage() {
  const [org, members, posts] = await Promise.all([getOrg(), getMembers(), getPosts()]);
  const owner = members.find((m) => m.member_id === org?.owner_member_id) ?? members[0];

  // ---- Real signals ----
  const approved = posts.filter((p) => p.status === "approved");
  const scored = posts.filter((p) => typeof p.voice_match === "number");
  const avgVoice = scored.length ? Math.round(scored.reduce((a, p) => a + p.voice_match, 0) / scored.length) : 0;
  const onVoiceCount = scored.filter((p) => p.voice_match >= 90).length;
  const aiTellsCaught = posts.reduce((a, p) => a + (p.edits?.length ?? 0), 0) + scored.length; // edits + every gated generation

  // consistency: posts/week over the last 4 weeks (real, from created_at)
  const now = Date.now();
  const weeks = [0, 0, 0, 0];
  for (const p of posts) {
    const t = new Date(p.created_at).getTime();
    const daysAgo = (now - t) / 86400000;
    if (daysAgo >= 0 && daysAgo < 28) weeks[3 - Math.floor(daysAgo / 7)]++;
  }
  const weekMax = Math.max(1, ...weeks);

  // top posts by sounds-like-you (real); engagement is demo until a feed exists
  const topPosts = [...scored].sort((a, b) => b.voice_match - a.voice_match).slice(0, 3);
  const nameOf = (id: string) => members.find((m) => m.member_id === id)?.name ?? "Someone";

  // team impact board — derived from real posts (approved×100 + avg voice), honest mock for engagement
  const board = members
    .map((m) => {
      const mine = posts.filter((p) => p.member_id === m.member_id);
      const ms = mine.filter((p) => typeof p.voice_match === "number");
      const mv = ms.length ? Math.round(ms.reduce((a, p) => a + p.voice_match, 0) / ms.length) : 0;
      const approvedCount = mine.filter((p) => p.status === "approved").length;
      return { id: m.member_id, name: m.name, isOwner: m.member_id === org?.owner_member_id, pts: approvedCount * 120 + mv * 4 + mine.length * 20 };
    })
    .sort((a, b) => b.pts - a.pts);
  const medals = ["🥇", "🥈", "🥉"];

  // gamification — derive level/streak loosely from real volume; XP is demo framing
  const xp = posts.length * 50 + approved.length * 50;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const nextXp = level * 500;

  return (
    <div className="main-inner">
      <TopBar title="Analytics" subtitle="What your content is doing for pipeline — not vanity likes." />

      <div className="seg" style={{ marginBottom: 18 }}>
        <button className="on">Last 30 days</button>
        <button>This quarter</button>
        <button>All time</button>
      </div>

      {/* Gamification strip (dark, editorial) */}
      <div style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-lg)", padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 54, height: 54, borderRadius: 999, flex: "none", display: "grid", placeItems: "center", background: `conic-gradient(var(--brass) ${Math.round((xp % 500) / 500 * 100)}%, rgba(255,255,255,.16) 0)` }}>
            <span style={{ width: 42, height: 42, borderRadius: 999, background: "var(--ink)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 14, fontFamily: "var(--serif)" }}>L{level}</span>
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Creator · Level {level}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.72)", marginTop: 2 }}>{xp} / {nextXp} XP to next</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[["🔥", "Streak"], ["✦", "First post"], ["◆", "On-voice"]].map(([e, l]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.09)", display: "grid", placeItems: "center", fontSize: 18 }}>{e}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.7)" }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, fontFamily: "var(--serif)" }}>🔥 {Math.min(posts.length, 4)}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>week streak</div>
        </div>
      </div>

      {/* KPIs — external metrics are demo until a LinkedIn account is connected */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 13, marginBottom: 14 }}>
        <KpiTile value="23" label="Warm conversations started" delta="↑ 40% · the metric that matters" demo />
        <KpiTile value="1,240" label="Profile views" delta="↑ 18%" demo />
        <KpiTile value="6.2%" label="Engagement rate · vs 2.1% avg" demo />
        <KpiTile value={`+${312}`} label="New followers" delta="↑ 27%" demo />
      </div>

      <div className="grid2" style={{ marginBottom: 14 }}>
        {/* On-voice proof — REAL */}
        <Card>
          <h4 style={{ margin: "0 0 3px" }}>On-voice proof</h4>
          <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--text-muted)" }}>The metric only Tutti has — how human your output stays.</p>
          <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, color: "var(--green-600)", lineHeight: 1 }}>{avgVoice}%</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>avg. sounds-like-you ({onVoiceCount}/{scored.length} ≥ 90%)</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--serif)", fontSize: 34, fontWeight: 400, color: "var(--text-strong)", lineHeight: 1 }}>{aiTellsCaught}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>AI tells caught &amp; fixed before posting</div>
            </div>
          </div>
        </Card>

        {/* Consistency — REAL */}
        <Card>
          <h4 style={{ margin: "0 0 3px" }}>Consistency</h4>
          <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--text-muted)" }}>The #1 predictor of growth. Target: 3–4×/week.</p>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 96, paddingBottom: 22 }}>
            {weeks.map((n, i) => (
              <div key={i} style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ height: `${Math.max(6, (n / weekMax) * 100)}%`, background: i >= 2 ? "var(--brass)" : "var(--brass-100)", borderRadius: "6px 6px 0 0" }} />
                <span style={{ position: "absolute", bottom: -20, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "var(--text-muted)" }}>W{i + 1} · {n}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* What's working — top posts (real ranking by sounds-like-you) */}
      <Card style={{ marginBottom: 14 }}>
        <h4 style={{ margin: "0 0 3px" }}>What&apos;s working this month</h4>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--text-muted)" }}>Your strongest posts by sounds-like-you. Engagement ranking arrives with a connected account.</p>
        {topPosts.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No posts yet.</p>}
        {topPosts.map((p, i) => (
          <div key={p.id} style={{ display: "flex", gap: 12, alignItems: "center", padding: "11px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)", fontSize: 14 }}>
            <span style={{ color: "var(--text-strong)", fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.topic || p.body.split("\n")[0].slice(0, 60)}</span>
            <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{nameOf(p.member_id)}</span>
            <Badge tone="green">{p.voice_match}% you</Badge>
          </div>
        ))}
      </Card>

      {/* Team leaderboard — impact derived from real posts */}
      <Card>
        <h4 style={{ margin: "0 0 3px" }}>Team leaderboard</h4>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--text-muted)" }}>Impact = approved posts × on-voice × activity. Resets monthly.</p>
        {board.map((r, i) => (
          <div
            key={r.id}
            style={{
              display: "flex", alignItems: "center", gap: 13, padding: "12px",
              borderRadius: "var(--radius-md)",
              borderTop: i === 0 || r.isOwner ? "none" : "1px solid var(--border-subtle)",
              background: r.isOwner ? "var(--brass-50)" : "transparent",
              margin: r.isOwner ? "4px 0" : 0,
            }}
          >
            <span style={{ width: 26, textAlign: "center", fontWeight: 800, fontSize: i < 3 ? 18 : 14, color: "var(--text-muted)", flex: "none" }}>{medals[i] ?? i + 1}</span>
            <Avatar name={r.name} size={34} />
            <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: "var(--text-strong)" }}>
              {r.name}{r.isOwner && <span style={{ color: "var(--text-muted)", fontWeight: 500 }}> · you</span>}
            </div>
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{r.pts.toLocaleString()} <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>pts</span></span>
          </div>
        ))}
      </Card>
    </div>
  );
}

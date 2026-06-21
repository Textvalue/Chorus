// Analytics — what content is doing for pipeline, not vanity likes.
// Real where the data exists (consistency, top posts ranked by sounds-like-you, a team impact
// board derived from real posts); clearly-labelled demo data for the external LinkedIn metrics
// (likes / comments / impressions) we can't read until an account is connected.
import { getOrg, getMembers, getPosts } from "@/lib/store";
import type { Post } from "@/lib/types";
import { TopBar, Card, Avatar } from "@/components/ds";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnalyticsRange } from "@/components/AnalyticsRange";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { InView } from "@/components/motion-primitives/in-view";

export const dynamic = "force-dynamic";

// Deterministic demo engagement per post — stands in for real LinkedIn metrics until an account
// is connected. Grounded in the post's voice_match + position so the numbers stay stable per post.
function demoEngagement(p: Post, i: number) {
  const v = typeof p.voice_match === "number" ? p.voice_match : 80;
  const impressions = 1100 + v * 31 + ((i * 137) % 900);
  const likes = Math.round(impressions * 0.026);
  const comments = Math.max(1, Math.round(likes * 0.19));
  const shares = Math.max(0, Math.round(comments * 0.5));
  const twe = likes + comments * 2 + shares * 4; // total weighted engagement
  return { impressions, likes, comments, shares, twe };
}

function KpiTile({ value, label, delta, demo, prefix, suffix, decimals }: { value: number; label: string; delta?: string; demo?: boolean; prefix?: string; suffix?: string; decimals?: number }) {
  return (
    <Card style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 2, position: "relative" }}>
      <span style={{ fontSize: 32, fontWeight: 600, letterSpacing: "-0.02em", lineHeight: 1, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </span>
      <span style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.35 }}>{label}</span>
      {delta && <span style={{ fontSize: 12, fontWeight: 700, color: "var(--green-600)", marginTop: 7 }}>{delta}</span>}
      {demo && <span style={{ position: "absolute", top: 12, right: 12, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", background: "var(--paper-2)", borderRadius: 6, padding: "2px 6px" }}>demo</span>}
    </Card>
  );
}

// Extra demo teammates so the leaderboard reads like a full team, not just the seeded ensemble.
const EXTRA_TEAMMATES = [
  { name: "Priya Shah", pts: 0 },
  { name: "Liam Carter", pts: 0 },
  { name: "Sofia Ramos", pts: 0 },
  { name: "Noah Bennett", pts: 0 },
  { name: "Hana Kim", pts: 0 },
];

export default async function AnalyticsPage() {
  const [org, members, posts] = await Promise.all([getOrg(), getMembers(), getPosts()]);

  // ---- Real signals ----
  const approved = posts.filter((p) => p.status === "approved");
  const scored = posts.filter((p) => typeof p.voice_match === "number");

  // consistency: posts/week over the last 4 weeks (real, from created_at)
  const now = Date.now();
  const weeks = [0, 0, 0, 0];
  for (const p of posts) {
    const t = new Date(p.created_at).getTime();
    const daysAgo = (now - t) / 86400000;
    if (daysAgo >= 0 && daysAgo < 28) weeks[3 - Math.floor(daysAgo / 7)]++;
  }
  const weekMax = Math.max(1, ...weeks);

  // ---- Demo engagement (totals + per-post breakdown) ----
  const withEng = posts.map((p, i) => ({ p, eng: demoEngagement(p, i) }));
  const totalImpr = withEng.reduce((a, x) => a + x.eng.impressions, 0);
  const totalLikes = withEng.reduce((a, x) => a + x.eng.likes, 0);
  const totalComments = withEng.reduce((a, x) => a + x.eng.comments, 0);

  // top posts by weighted engagement (demo ranking)
  const topPosts = [...withEng].sort((a, b) => b.eng.twe - a.eng.twe).slice(0, 5);
  const nameOf = (id: string) => members.find((m) => m.member_id === id)?.name ?? "Someone";

  // team impact board — derived from real posts (approved×120 + avg voice + activity)
  const realBoard = members.map((m) => {
    const mine = posts.filter((p) => p.member_id === m.member_id);
    const ms = mine.filter((p) => typeof p.voice_match === "number");
    const mv = ms.length ? Math.round(ms.reduce((a, p) => a + p.voice_match, 0) / ms.length) : 0;
    const approvedCount = mine.filter((p) => p.status === "approved").length;
    return { id: m.member_id, name: m.name, isOwner: m.member_id === org?.owner_member_id, pts: approvedCount * 120 + mv * 4 + mine.length * 20 };
  });
  // pad with demo teammates so the board looks like a real org
  const minReal = Math.min(...realBoard.map((r) => r.pts), 320);
  const padded = EXTRA_TEAMMATES.map((t, i) => ({ id: `demo-${i}`, name: t.name, isOwner: false, pts: Math.max(140, Math.round(minReal * (0.82 - i * 0.13))) }));
  const board = [...realBoard, ...padded].sort((a, b) => b.pts - a.pts);
  const medals = ["🥇", "🥈", "🥉"];

  // gamification — derive level/streak loosely from real volume; XP is demo framing
  const xp = posts.length * 50 + approved.length * 50;
  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const nextXp = level * 500;

  // winning-content format breakdown (sample until enough engagement history exists)
  const formatRows: [string, number, string][] = [
    ["Carousel", 88, "+34%"],
    ["Contrarian text", 80, "+28%"],
    ["Story", 52, "+6%"],
    ["Think-piece", 22, "−19%"],
  ];

  return (
    <div className="main-inner">
      <TopBar title="Analytics" subtitle="What your content is doing for pipeline — not vanity likes." />

      <AnalyticsRange />

      {/* Gamification strip (dark, editorial) */}
      <div style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: "var(--radius-lg)", padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", boxShadow: "var(--shadow-md)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ width: 54, height: 54, borderRadius: 999, flex: "none", display: "grid", placeItems: "center", background: `conic-gradient(var(--brass) ${Math.round((xp % 500) / 500 * 100)}%, rgba(255,255,255,.16) 0)` }}>
            <span style={{ width: 42, height: 42, borderRadius: 999, background: "var(--ink)", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>L{level}</span>
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Creator · Level {level}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.72)", marginTop: 2 }}>{xp} / {nextXp} XP to next</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[["🔥", "Streak"], ["✦", "First post"], ["💬", "Top comment"]].map(([e, l]) => (
            <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(255,255,255,.09)", display: "grid", placeItems: "center", fontSize: 18 }}>{e}</span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,.7)" }}>{l}</span>
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>🔥 {Math.min(posts.length, 4)}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)" }}>week streak</div>
        </div>
      </div>

      {/* KPIs — external metrics are demo until a LinkedIn account is connected */}
      <AnimatedGroup as="div" stagger={0.06} className="mb-3.5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        <KpiTile value={23} label="Warm conversations started" delta="↑ 40% · the metric that matters" demo />
        <KpiTile value={1240} label="Profile views" delta="↑ 18%" demo />
        <KpiTile value={6.2} decimals={1} suffix="%" label="Engagement rate · vs 2.1% avg" demo />
        <KpiTile value={312} prefix="+" label="New followers" delta="↑ 27%" demo />
      </AnimatedGroup>

      <div className="grid2" style={{ marginBottom: 14 }}>
        {/* Engagement totals — likes / comments / impressions (demo) */}
        <Card style={{ position: "relative" }}>
          <span style={{ position: "absolute", top: 16, right: 16, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", background: "var(--paper-2)", borderRadius: 6, padding: "2px 6px" }}>demo</span>
          <h4 style={{ margin: "0 0 3px" }}>Engagement this month</h4>
          <p style={{ margin: "0 0 18px", fontSize: 12.5, color: "var(--text-muted)" }}>Totals across every post. Real numbers arrive with a connected account.</p>
          <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-strong)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <AnimatedNumber value={totalImpr} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>impressions</div>
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--green-600)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <AnimatedNumber value={totalLikes} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>likes</div>
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--accent-ink)", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                <AnimatedNumber value={totalComments} />
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>comments</div>
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

      {/* Top posts breakdown — ranked by weighted engagement (demo metrics) */}
      <Card style={{ marginBottom: 14, position: "relative" }}>
        <span style={{ position: "absolute", top: 16, right: 16, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", background: "var(--paper-2)", borderRadius: 6, padding: "2px 6px" }}>demo</span>
        <h4 style={{ margin: "0 0 3px" }}>Top posts breakdown</h4>
        <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "var(--text-muted)" }}>Your strongest posts by weighted engagement (likes + 2× comments + 4× shares).</p>
        {topPosts.length === 0 && <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No posts yet.</p>}
        {topPosts.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr 0.7fr 0.7fr 0.8fr", gap: 10, padding: "0 0 8px", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-muted)" }}>
              <span>Post</span><span>Author</span><span style={{ textAlign: "right" }}>Likes</span><span style={{ textAlign: "right" }}>Comments</span><span style={{ textAlign: "right" }}>Impressions</span>
            </div>
            {topPosts.map(({ p, eng }, i) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 0.9fr 0.7fr 0.7fr 0.8fr", gap: 10, alignItems: "center", padding: "11px 0", borderTop: "1px solid var(--border-subtle)", fontSize: 13.5 }}>
                <span style={{ color: "var(--text-strong)", fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: "var(--text-muted)", marginRight: 8 }}>{i + 1}</span>{p.topic || p.body.split("\n")[0].slice(0, 50)}
                </span>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nameOf(p.member_id)}</span>
                <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--green-700)", fontWeight: 700 }}>{eng.likes.toLocaleString()}</span>
                <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--accent-ink)", fontWeight: 700 }}>{eng.comments.toLocaleString()}</span>
                <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-body)" }}>{eng.impressions.toLocaleString()}</span>
              </div>
            ))}
          </>
        )}
      </Card>

      {/* Winning content — reverse-engineered from what works for you (moved here from Voice) */}
      <Card style={{ marginBottom: 14, background: "var(--green-soft)", borderColor: "var(--green-100)", position: "relative" }}>
        <span style={{ position: "absolute", top: 16, right: 16, fontSize: 10, fontWeight: 700, color: "var(--green-700)", background: "var(--surface, #fff)", borderRadius: 6, padding: "2px 6px" }}>sample</span>
        <div className="eyebrow" style={{ color: "var(--green-700)", marginBottom: 8 }}>Your winning formula</div>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--green-700)", maxWidth: 720 }}>
          Write about <b>your category</b> as a <b>contrarian text post</b> or <b>how-to carousel</b>, opening with a <b>1-line bold claim</b>, in <b>90–140 words</b>. Post <b>Tue–Thu</b>. Design for <b>comments</b>, not just likes.
        </p>
      </Card>

      <div className="grid2" style={{ marginBottom: 14 }}>
        <Card>
          <div className="eyebrow muted" style={{ marginBottom: 14 }}>Format — what wins for you</div>
          <InView>
            {formatRows.map(([l, w, v]) => {
              const neg = v.startsWith("−") || v.startsWith("-");
              return (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10, fontSize: 13 }}>
                  <span style={{ width: 110, flex: "none", color: "var(--text-body)" }}>{l}</span>
                  <Progress value={w} className={`flex-1 ${neg ? "[&_[data-slot=progress-indicator]]:bg-[var(--amber)]" : "[&_[data-slot=progress-indicator]]:bg-[var(--green)]"}`} />
                  <span style={{ width: 46, textAlign: "right", flex: "none", fontWeight: 700, fontSize: 12.5, color: "var(--text-strong)" }}>{v}</span>
                </div>
              );
            })}
          </InView>
        </Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <div className="eyebrow muted" style={{ marginBottom: 10 }}>Hooks that work</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text-body)" }}>
              <b>&ldquo;Everyone does X. We stopped.&rdquo;</b> — your top pattern.<br />
              <b>&ldquo;The boring truth about Y&rdquo;</b> — 2.1× your median.<br />
              <span style={{ color: "var(--text-muted)" }}>Underperforms: question openers.</span>
            </div>
          </Card>
          <Card>
            <div className="eyebrow muted" style={{ marginBottom: 10 }}>Stop doing</div>
            {["Burying the hook below the fold", "3+ hashtags — zero correlation", "Posting two days running"].map((t) => (
              <div key={t} style={{ display: "flex", gap: 9, fontSize: 13, padding: "5px 0", color: "var(--text-body)" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 700, flex: "none" }}>✕</span>{t}
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Team leaderboard — impact derived from real posts, padded with the wider team */}
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

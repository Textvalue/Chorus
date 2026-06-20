// Achievements — the progression layer (PRD §7). Reward what compounds: showing up,
// on-voice posts, real reach. Never raw output. Mock data for the not-yet-wired
// progression/reach surfaces.
import Image from "next/image";
import { TopBar, Card, Badge, Stat, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

type BadgeTile = {
  src: string;
  name: string;
  desc: string;
  state: "earned" | "next" | "locked";
};

const BADGES: BadgeTile[] = [
  {
    src: "/brand/badge-first-note.png",
    name: "First Note",
    desc: "You published your first post in your own voice.",
    state: "earned",
  },
  {
    src: "/brand/badge-on-key.png",
    name: "On Key",
    desc: "Five drafts in a row passed Sounds Flat first try.",
    state: "earned",
  },
  {
    src: "/brand/badge-rising-star.png",
    name: "Rising Star",
    desc: "Land 1M impressions in a single month. Almost there.",
    state: "next",
  },
  {
    src: "/brand/badge-encore.png",
    name: "Encore",
    desc: "A post hits 10M and the crowd asks for more.",
    state: "locked",
  },
];

const RUNGS: { name: string; reach: string; state: "passed" | "current" | "upcoming" }[] = [
  { name: "Practice Room", reach: "1K", state: "passed" },
  { name: "Coffee Shop", reach: "10K", state: "passed" },
  { name: "Theater", reach: "100K", state: "passed" },
  { name: "Arena", reach: "1M", state: "current" },
  { name: "Stadium", reach: "10M+", state: "upcoming" },
];

const XP_RULES: { label: string; value: string; icon: React.ReactNode }[] = [
  { label: "Completed tuning", value: "+200", icon: <Icon.tune size={16} color="var(--teal-600)" /> },
  { label: "An approved on-voice post", value: "+50", icon: <Icon.check size={16} color="var(--green-600)" /> },
  { label: "1,000 real impressions", value: "+10", icon: <Icon.eye size={16} color="var(--blue-600)" /> },
  { label: "A correction that improved the model", value: "+25", icon: <Icon.flat size={16} color="var(--teal-600)" /> },
];

function badgeMeta(state: BadgeTile["state"]) {
  if (state === "earned") return { tone: "green" as const, label: "Earned", opacity: 1, dim: false };
  if (state === "next") return { tone: "teal" as const, label: "150 XP to go", opacity: 1, dim: true };
  return { tone: "neutral" as const, label: "Locked", opacity: 0.45, dim: false };
}

export default function AchievementsPage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Achievements"
        subtitle="Reward what compounds — showing up, on-voice posts, real reach. Never raw output."
      />

      {/* Headline progression stats */}
      <div className="grid3" style={{ marginBottom: 24 }}>
        <Card>
          <Stat value="Level 12" label="Bandleader" />
        </Card>
        <Card>
          <Stat value="🔥 12 days" label="Current streak" />
        </Card>
        <Card>
          <Stat value="2,350" label="XP earned" delta="+150 this week" />
        </Card>
      </div>

      {/* Badges */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <div className="eyebrow">Badges</div>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>2 of 4 earned</span>
        </div>
        <div className="grid2" style={{ gap: 16 }}>
          {BADGES.map((b) => {
            const m = badgeMeta(b.state);
            return (
              <div
                key={b.name}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                  padding: 16,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  background: b.state === "locked" ? "var(--gray-50)" : "var(--surface-card)",
                }}
              >
                <Image
                  src={b.src}
                  alt={`${b.name} badge`}
                  width={72}
                  height={72}
                  style={{
                    width: 72,
                    height: 72,
                    flex: "none",
                    mixBlendMode: "multiply",
                    opacity: m.opacity,
                    filter: m.dim ? "saturate(0.7)" : undefined,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", marginBottom: 4 }}>{b.name}</div>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45 }}>{b.desc}</p>
                  <Badge tone={m.tone}>{m.label}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Fill the stadium */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div className="eyebrow muted">Fill the stadium</div>
          <Badge tone="green">↑ 78% this month</Badge>
        </div>

        <Image
          src="/brand/stadium.png"
          alt="A full stadium"
          width={960}
          height={300}
          style={{ width: "100%", height: "auto", borderRadius: "var(--radius-md)" }}
        />

        {/* Venue ladder rungs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0 16px" }}>
          {RUNGS.map((r) => {
            const passed = r.state === "passed";
            const current = r.state === "current";
            return (
              <div
                key={r.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  flex: "1 1 120px",
                  padding: "10px 12px",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${current ? "var(--teal-500)" : passed ? "var(--green-100)" : "var(--border-subtle)"}`,
                  background: current ? "var(--teal-50)" : passed ? "var(--green-50)" : "var(--gray-50)",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: current ? 800 : 600,
                    color: current ? "var(--teal-700)" : passed ? "var(--green-700)" : "var(--slate-600)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {passed && <Icon.check size={13} color="var(--green-600)" stroke={3} />}
                  {r.name}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    color: current ? "var(--teal-700)" : passed ? "var(--green-700)" : "var(--text-muted)",
                  }}
                >
                  {r.reach}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <Stat value="12.4M" label="impressions this month" />
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-body)", maxWidth: 320, textAlign: "right" }}>
            You&apos;re playing the Arena. Stadium next.
          </p>
        </div>
      </Card>

      {/* What earns XP */}
      <Card>
        <div className="eyebrow" style={{ marginBottom: 16 }}>What earns XP</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {XP_RULES.map((rule) => (
            <div
              key={rule.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  flex: "none",
                  borderRadius: "var(--radius-sm)",
                  display: "grid",
                  placeItems: "center",
                  background: "var(--gray-50)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {rule.icon}
              </span>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: "var(--text-strong)" }}>{rule.label}</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--text-success)", letterSpacing: "-0.01em" }}>{rule.value}</span>
            </div>
          ))}
        </div>

        <p style={{ margin: "16px 0 0", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          XP never moves on raw generation count. The stadium fills with quality, or it doesn&apos;t fill at all.
        </p>

        {/* Serious-buyer mode */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 18,
            padding: 16,
            borderRadius: "var(--radius-md)",
            background: "var(--gray-50)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-strong)", marginBottom: 2 }}>Serious-buyer mode</div>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
              Same data, no game framing. Levels and streaks become plain milestones and habit stats.
            </p>
          </div>
          {/* Faux switch (static, off) */}
          <span
            aria-hidden
            style={{
              width: 44,
              height: 26,
              flex: "none",
              borderRadius: "var(--radius-pill)",
              background: "var(--gray-300)",
              position: "relative",
              boxShadow: "inset 0 1px 2px rgba(11,24,51,0.12)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 3,
                left: 3,
                width: 20,
                height: 20,
                borderRadius: "var(--radius-pill)",
                background: "#fff",
                boxShadow: "var(--shadow-xs)",
              }}
            />
          </span>
        </div>
      </Card>
    </div>
  );
}

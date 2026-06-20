// Know your audience — weighted personas tied to real weekly pains (PRD §4.2, §5.9).
// "Your crowd." Static server component; mock persona + reach data.
import Image from "next/image";
import { TopBar, Card, Badge, Stat, Bar, Eyebrow, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

type Persona = {
  name: string;
  pct: number;
  blurb: string;
  pain: string;
  tone: "teal" | "blue" | "green";
};

const PERSONAS: Persona[] = [
  {
    name: "Innovators",
    pct: 28,
    blurb: "Early adopters who love new solutions.",
    pain: "Falling behind on what's new · Monday roundup",
    tone: "teal",
  },
  {
    name: "Decision Makers",
    pct: 42,
    blurb: "Evaluate value, need proof.",
    pain: "Justifying spend · quarterly review",
    tone: "blue",
  },
  {
    name: "Operators",
    pct: 30,
    blurb: "Need clarity, efficiency, trust.",
    pain: "Tool sprawl and unclear ROI · weekly standup",
    tone: "green",
  },
];

const REACH: { label: string; value: number; tone: "teal" | "blue" | "green" }[] = [
  { label: "Innovators", value: 22, tone: "teal" },
  { label: "Decision Makers", value: 58, tone: "blue" },
  { label: "Operators", value: 20, tone: "green" },
];

export default function AudiencePage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Know your audience"
        subtitle="Your crowd — modeled as weighted personas tied to real weekly pains."
      />

      {/* The room you're playing to */}
      <Card
        style={{
          background: "var(--gray-50)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Image
          src="/brand/personas-strip.png"
          alt="Your audience personas"
          width={520}
          height={150}
          style={{ width: "100%", maxWidth: 520, height: "auto", mixBlendMode: "multiply" }}
        />
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-muted)" }}>
          The room you&apos;re playing to.
        </div>
      </Card>

      {/* Weighted personas */}
      <div className="grid3" style={{ marginBottom: 20 }}>
        {PERSONAS.map((p) => (
          <Card key={p.name} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-strong)" }}>{p.name}</div>
              <span
                style={{
                  color:
                    p.tone === "blue"
                      ? "var(--blue-600)"
                      : p.tone === "green"
                      ? "var(--green-600)"
                      : "var(--teal-600)",
                }}
              >
                <Icon.audience size={18} />
              </span>
            </div>

            <Stat value={`${p.pct}%`} label="of your crowd" />

            <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>{p.blurb}</p>

            <Bar value={p.pct} tone={p.tone} showLabel />

            <div>
              <Eyebrow muted>Weekly pain</Eyebrow>
              <div style={{ marginTop: 8 }}>
                <Badge tone="neutral">{p.pain}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Which part of the room */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <Eyebrow>Which part of the room</Eyebrow>
          <Badge tone="teal">
            <Icon.eye size={12} /> Recent post
          </Badge>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20 }}>
          <span
            style={{
              width: 40,
              height: 40,
              flex: "none",
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: "var(--teal-50)",
              color: "var(--teal-600)",
            }}
          >
            <Icon.waveform size={20} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-strong)" }}>
              The blank page is a tuning problem
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Reach split by persona · last 7 days
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {REACH.map((r) => (
            <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ width: 130, flex: "none", fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>
                {r.label}
              </span>
              <Bar value={r.value} tone={r.tone} showLabel style={{ flex: 1 }} />
            </div>
          ))}
        </div>

        <p style={{ margin: "20px 0 0", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
          Over time, see which part of the room each post is actually reaching.
        </p>
      </Card>
    </div>
  );
}

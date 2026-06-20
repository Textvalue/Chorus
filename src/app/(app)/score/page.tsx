// The Score — the team's shared company strategy / brand DNA (PRD §5.2).
// One score per team, owned by the bandleader. Static server component; mock
// content stands in for the not-yet-wired strategy store.
import { TopBar, Card, Badge, Eyebrow, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

const PERSONAS = ["Founders", "Heads of Marketing", "Sales leaders / CROs"];

const PAINS: { pain: string; trigger: string; level: "high" | "medium" }[] = [
  { pain: "The team freezes at the blank page", trigger: "Monday content planning", level: "high" },
  { pain: "AI drafts all sound the same", trigger: "Every draft review", level: "high" },
  { pain: "One post pushed to everyone reads as spam", trigger: "Campaign launches", level: "medium" },
];

const VOICE_RULES = [
  "Warm, encouraging, direct — like a great bandleader.",
  "Sentence case. Short sentences. Real specifics.",
  "No AI tells: no em-dash pile-ups, no curly quotes, no press-release language.",
  "Off-key means not tuned yet, never that the writer is bad.",
];

const ATOMS: [string, string][] = [
  ["Audience", "Teams who want to show up on LinkedIn without sounding like a slop machine."],
  ["Problem", "Every employee's AI output sounds identical, so the brand sounds like noise."],
  ["Outcome", "A whole team sounds like one brand while every post still sounds human."],
  ["Proof", "We watched our own 40-person team go from an echo to a conversation."],
  ["Offer", "One shared score, every voice in tune."],
];

const COMPETITORS: [string, string][] = [
  ["Scripe", "Long-form repurposing. No shared team voice."],
  ["Taplio", "Solo creator scheduler. Built for one person, not an ensemble."],
  ["EveryoneSocial", "Advocacy reshares. Same post, every account — the spam problem."],
];

export default function ScorePage() {
  return (
    <div className="main-inner">
      <TopBar
        title="The Score"
        subtitle="Your shared company strategy. One score, every voice."
        action={<Badge tone="navy">Owned by the bandleader</Badge>}
      />

      {/* Positioning / concert pitch */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <Eyebrow>Concert pitch</Eyebrow>
          <Badge tone="teal">
            <Icon.check size={12} color="var(--teal-700)" stroke={2.6} /> Auto-researched · verified
          </Badge>
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>Positioning</div>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--text-body)" }}>
          The team content OS — harmony, not unison. A whole team sounds like one brand, every post still human.
        </p>
      </Card>

      {/* Ideal customer + validated pains */}
      <div className="grid2" style={{ marginBottom: 20 }}>
        <Card>
          <Eyebrow muted>Ideal customer</Eyebrow>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "14px 0 16px" }}>
            {PERSONAS.map((p) => (
              <span key={p} className="chip dot" style={{ color: "var(--teal-700)", background: "var(--teal-50)" }}>{p}</span>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
            <span style={{ fontWeight: 700, color: "var(--text-body)" }}>Not for:</span> solo creators, fully-automated posting.
          </p>
        </Card>

        <Card>
          <Eyebrow muted>Validated pains</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, margin: "14px 0 14px" }}>
            {PAINS.map(({ pain, trigger, level }) => (
              <div key={pain} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <span
                  style={{
                    width: 22, height: 22, flex: "none", borderRadius: 999, marginTop: 1,
                    display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--green-50)",
                  }}
                >
                  <Icon.check size={13} color="var(--green-600)" stroke={2.6} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.35 }}>{pain}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
                    <Badge tone="blue">{trigger}</Badge>
                    <span style={{ fontSize: 12, fontWeight: 600, color: level === "high" ? "var(--text-accent)" : "var(--text-muted)" }}>
                      {level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Pain Validation Gate: every pain names the weekly moment it hits a desk — and each one doubles as a content hook.
          </p>
        </Card>
      </div>

      {/* Brand voice rules */}
      <Card style={{ marginBottom: 20 }}>
        <Eyebrow muted>Brand voice rules</Eyebrow>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
          {VOICE_RULES.map((rule) => (
            <div key={rule} style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <span
                style={{
                  width: 24, height: 24, flex: "none", borderRadius: 8,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  background: "var(--teal-50)", color: "var(--teal-600)",
                }}
              >
                <Icon.check size={14} stroke={2.4} />
              </span>
              <span style={{ fontSize: 15, color: "var(--text-body)", lineHeight: 1.45 }}>{rule}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Narrative atoms */}
      <Card style={{ marginBottom: 20 }}>
        <Eyebrow muted>Narrative atoms</Eyebrow>
        <p style={{ margin: "4px 0 18px", fontSize: 13, color: "var(--text-muted)" }}>
          The five pieces every post stands on. Acme&apos;s, written once and reused everywhere.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {ATOMS.map(([label, value], i) => (
            <div
              key={label}
              style={{
                display: "grid", gridTemplateColumns: "110px 1fr", gap: 16, alignItems: "baseline",
                padding: "13px 0",
                borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
              }}
            >
              <div className="label" style={{ margin: 0 }}>{label}</div>
              <div style={{ fontSize: 14.5, color: "var(--text-body)", lineHeight: 1.55 }}>{value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Competitors (data only) */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <Eyebrow muted>Competitors (data only)</Eyebrow>
          <Badge tone="neutral">Reference, not direction</Badge>
        </div>
        <div className="grid3">
          {COMPETITORS.map(([name, note]) => (
            <div
              key={name}
              style={{
                padding: 16, borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)", background: "var(--gray-50)",
              }}
            >
              <span className="chip" style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", color: "var(--text-strong)" }}>{name}</span>
              <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{note}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

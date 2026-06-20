// Tuning — an in-app recap of onboarding (PRD §5.1). Step nav + Brand DNA verify
// card + an encouraging musician. Mirror of the onboarding tuning flow, but it
// never nags: you can finish calibrating each voice any time.
import Image from "next/image";
import { TopBar, Card, Badge, Button, Bar, Eyebrow, Icon } from "@/components/ds";
import { RestartOnboarding } from "@/components/RestartOnboarding";

export const dynamic = "force-dynamic";

type StepState = "done" | "current" | "upcoming";
const STEPS: [string, StepState][] = [
  ["About your company", "done"],
  ["Brand DNA", "current"],
  ["Audience", "upcoming"],
  ["Team", "upcoming"],
  ["Voice & tone", "upcoming"],
];

function StepRow({ label, state, index }: { label: string; state: StepState; index: number }) {
  const done = state === "done";
  const current = state === "current";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "9px 10px",
        borderRadius: "var(--radius-md)",
        background: current ? "var(--blue-50)" : "transparent",
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          flex: "none",
          borderRadius: 999,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          background: done ? "var(--green-500)" : current ? "var(--blue-500)" : "var(--surface-card)",
          color: done || current ? "#fff" : "var(--text-muted)",
          border: !done && !current ? "1.5px solid var(--border-strong)" : "none",
        }}
      >
        {done ? <Icon.check size={12} color="#fff" stroke={3.5} /> : index + 1}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: current ? 700 : 600,
          color: current ? "var(--text-strong)" : done ? "var(--text-body)" : "var(--text-muted)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em" }}>
        {label}
      </span>
      <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-strong)", lineHeight: 1.45 }}>{value}</span>
    </div>
  );
}

export default function TuningPage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Tuning"
        subtitle="Calibrating each voice before you play. Finish it any time — nothing here nags."
        action={
          <RestartOnboarding className="btn">
            <Icon.refresh size={16} /> Restart onboarding
          </RestartOnboarding>
        }
      />

      <div className="split-nav">
        {/* LEFT — step nav */}
        <Card>
          <Eyebrow>Onboarding · Tuning</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "12px 0 16px" }}>
            {STEPS.map(([label, state], i) => (
              <StepRow key={label} label={label} state={state} index={i} />
            ))}
          </div>
          <div style={{ padding: "0 2px" }}>
            <Bar value={32} tone="teal" showLabel />
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Step 2 of 5</div>
          </div>
        </Card>

        {/* RIGHT — verify card + musician */}
        <div className="split-side">
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 20 }}>Brand DNA</h3>
              <Badge tone="teal">Auto-researched</Badge>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "6px 0 0", lineHeight: 1.5 }}>
              We pulled this from your public surface. Verify in about 60 seconds — every fact carries a source.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 18 }}>
              <ReadRow label="Positioning" value="The team content OS — harmony, not unison." />
              <ReadRow label="One-line pitch" value="A whole team sounds like one brand, every post still human." />

              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 8 }}>Validated pains</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Badge tone="green">✓ Blank-page freeze · Monday</Badge>
                  <Badge tone="green">✓ Generic AI tells</Badge>
                  <Badge tone="neutral">+ Add a pain</Badge>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <Button variant="primary" iconLeft={<Icon.check size={16} color="#fff" />}>Looks right</Button>
              <Button variant="ghost" iconLeft={<Icon.edit size={16} />}>Edit details</Button>
            </div>
          </Card>

          <Card style={{ background: "var(--gray-50)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: -6,
                  right: -18,
                  zIndex: 2,
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "8px 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text-body)",
                  boxShadow: "var(--shadow-sm)",
                  whiteSpace: "nowrap",
                }}
              >
                This might squeak a bit.
              </div>
              <Image
                src="/brand/musician-unsure.png"
                alt="A musician tuning up, not quite confident yet"
                width={200}
                height={220}
                style={{ width: 200, height: "auto", mixBlendMode: "multiply" }}
              />
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0", maxWidth: 240, lineHeight: 1.5 }}>
              Off-key just means we haven&apos;t learned your voice yet. We&apos;ll get there.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

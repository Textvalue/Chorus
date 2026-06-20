// Ensemble — team roster, instruments, unison alarm (PRD §5.8). One brand DNA,
// many distinct voices. Mock roster for the not-yet-wired team surface.
import Link from "next/link";
import Image from "next/image";
import { TopBar, Card, Badge, Avatar, Bar, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

const TEAM: [string, string, string, number][] = [
  ["Alex Johnson", "Content Lead", "Conductor", 100],
  ["Maya Patel", "Copywriter", "Violin", 96],
  ["Jordan Lee", "Designer", "Cello", 92],
  ["Taylor Kim", "Social Manager", "Flute", 88],
  ["Casey Brown", "Analyst", "Timpani", 71],
];

export default function EnsemblePage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Your ensemble"
        subtitle="One brand DNA, many distinct voices, one workspace."
        action={
          <Link href="#" className="btn pri">
            <Icon.plus size={16} color="#fff" /> Invite member
          </Link>
        }
      />

      <div className="split-side">
        {/* Roster */}
        <Card>
          {TEAM.map(([name, role, inst, score], i) => (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 0",
                borderBottom: i < TEAM.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <Avatar name={name} instrument={inst} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>{name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{role}</div>
              </div>
              <Badge tone="teal">{inst}</Badge>
              <div style={{ width: 120, flex: "none" }}>
                <Bar value={score} tone={score >= 90 ? "green" : "teal"} showLabel />
              </div>
            </div>
          ))}
        </Card>

        {/* Side rail */}
        <div className="stack">
          <Card style={{ background: "var(--gray-50)", textAlign: "center" }}>
            <Image
              src="/brand/ensemble.png"
              alt="The ensemble, playing one score"
              width={220}
              height={150}
              style={{ width: "auto", height: 150, margin: "0 auto", mixBlendMode: "multiply" }}
            />
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", marginTop: 6 }}>
              5 players · 1 score
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              70% of invites have completed Tuning
            </div>
          </Card>

          <div className="callout teal">
            <span style={{ color: "var(--teal-600)", marginTop: 2 }}>
              <Icon.waveform size={22} />
            </span>
            <div>
              <div className="ct">Unison alarm</div>
              <p>
                Your string section is playing in unison this week — three drafts share the same
                hook. Spread out.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

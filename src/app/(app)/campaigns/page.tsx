// Tutti campaigns — the whole team on one theme, each in their own voice (PRD §5.11).
// One brief fans out into five on-brand drafts, one per member, straight into Rehearsal.
import Link from "next/link";
import { TopBar, Card, Badge, Eyebrow, Avatar, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

type Status = "Approved" | "Scheduled" | "Pending" | "Draft";

const PARTS: {
  name: string;
  instrument: string;
  score: number;
  status: Status;
  excerpt: string;
}[] = [
  {
    name: "Maya Patel",
    instrument: "Violin",
    score: 96,
    status: "Approved",
    excerpt:
      "Unison is five people saying the same sentence. Harmony is five people finishing the same thought from five seats. Our team picked the second one — and you can hear it.",
  },
  {
    name: "Jordan Lee",
    instrument: "Cello",
    score: 94,
    status: "Approved",
    excerpt:
      "A brand guide that flattens everyone into one voice isn't a guide, it's a gag order. The good ones set the key and let each player phrase it themselves.",
  },
  {
    name: "Alex Johnson",
    instrument: "Conductor",
    score: 95,
    status: "Scheduled",
    excerpt:
      "My job isn't to make the team sound like me. It's to make sure we're all in the same key, then get out of the way so each part carries.",
  },
  {
    name: "Taylor Kim",
    instrument: "Flute",
    score: 88,
    status: "Pending",
    excerpt:
      "Copy-pasting the company line to your own feed reads exactly like what it is. Same theme, your phrasing — that's the post people actually stop for.",
  },
  {
    name: "Casey Brown",
    instrument: "Timpani",
    score: 71,
    status: "Draft",
    excerpt:
      "I ran the numbers on unison posts vs. team-voiced ones on the same theme. Harmony won on reach and saves. Still tuning my draft, but the data already sings.",
  },
];

const PILL: Record<Status, string> = {
  Approved: "pill sched",
  Scheduled: "pill sched",
  Pending: "pill need",
  Draft: "pill draft",
};

const PAST = [
  "From first note to full stadium",
  "One score, every voice",
  "The blank page",
];

export default function CampaignsPage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Tutti campaigns"
        subtitle="The whole team on one theme — each in their own voice."
        action={
          <Link href="/campaigns" className="btn accent">
            <Icon.campaign size={16} color="#fff" /> Start a Tutti campaign
          </Link>
        }
      />

      {/* Current live campaign */}
      <Card style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Eyebrow>Live campaign</Eyebrow>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text-strong)",
                margin: "6px 0 6px",
              }}
            >
              Harmony, not unison
            </div>
            <div style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
              Launched Mon · 5 parts · 4 in tune
            </div>
          </div>
          <Badge tone="green">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: "var(--green-500)",
                display: "inline-block",
              }}
            />
            Live
          </Badge>
        </div>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-body)",
          }}
        >
          One theme produced 5 on-brand drafts, one per member, straight into
          Rehearsal.
        </p>
      </Card>

      {/* Per-member draft cards */}
      <div className="grid2" style={{ marginBottom: 20 }}>
        {PARTS.map((p) => (
          <Card key={p.name}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <Avatar name={p.name} instrument={p.instrument} size={40} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text-strong)",
                    lineHeight: 1.2,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {p.instrument} · their part
                </div>
              </div>
              <Badge tone="green">{p.score}% in tune</Badge>
            </div>

            <div
              style={{
                background: "var(--gray-50)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--text-body)",
              }}
            >
              {p.excerpt}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginTop: 16,
              }}
            >
              <span className={PILL[p.status]}>{p.status}</span>
              <Link href="/rehearsal" className="btn ghost sm">
                Open <Icon.chevronRight size={15} />
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Cross-amplification footnote */}
      <Card
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ color: "var(--teal-600)", flex: "none" }}>
          <Icon.growth size={20} />
        </span>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            lineHeight: 1.6,
            color: "var(--text-muted)",
          }}
        >
          <b style={{ color: "var(--text-strong)", fontWeight: 700 }}>
            Cross-amplification:
          </b>{" "}
          when the team posts in harmony, the company page lifts too — the
          cobrand half single-creator tools can&apos;t model.
        </p>
      </Card>

      {/* Past campaigns */}
      <div>
        <Eyebrow muted>Past campaigns</Eyebrow>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {PAST.map((c) => (
            <Link key={c} href="/campaigns" className="chip">
              <Icon.campaign size={13} color="var(--slate-600)" />
              {c}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

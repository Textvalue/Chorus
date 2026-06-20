// Engage — the warm feed, second act (PRD §5.12). A cookie-free read feed of marked
// people; Tutti drafts the comment in your voice; sends are human-clicked only.
import { TopBar, Card, Badge, Button, Avatar, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

const MARKED: { name: string; role: string; ago: string; post: string }[] = [
  {
    name: "Dana Reed",
    role: "VP Marketing, Northwind",
    ago: "2h ago",
    post: "We cut our content calendar in half and posted more. Counterintuitive, but it worked.",
  },
  {
    name: "Marcus Hale",
    role: "CRO, Beacon",
    ago: "5h ago",
    post: "Our reps all sound the same on LinkedIn. Is that a tooling problem or a people problem?",
  },
  {
    name: "Priya Nair",
    role: "Founder, Loop",
    ago: "1d ago",
    post: "AI writes my posts now. Engagement fell off a cliff. Anyone else?",
  },
];

export default function EngagePage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Engage"
        subtitle="Warm your target accounts. Tutti drafts the comment in your voice — you read it, you post it."
        action={<Badge tone="teal">Cookie-free feed</Badge>}
      />

      {/* Compliance moat (§5.12) */}
      <div className="callout blue" style={{ marginBottom: 20, alignItems: "flex-start" }}>
        <span style={{ color: "var(--blue-600)" }}><Icon.check size={22} /></span>
        <div style={{ flex: 1 }}>
          <div className="ct">Nothing sends itself</div>
          <p>
            The feed is built from cookie-free data — never your logged-in session. Every comment is a
            deliberate, human click. That&apos;s the compliance moat.
          </p>
        </div>
      </div>

      <div className="split-side">
        {/* LEFT — marked people, freshest first */}
        <Card>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <div className="eyebrow muted">Marked people · freshest first</div>
            <Badge tone="neutral">{MARKED.length} new</Badge>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {MARKED.map((p, i) => (
              <div
                key={p.name}
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "18px 0",
                  borderBottom: i < MARKED.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <Avatar name={p.name} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-strong)" }}>{p.name}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{p.role}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)" }}>· {p.ago}</span>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      background: "var(--gray-50)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px 14px",
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: "var(--text-body)",
                    }}
                  >
                    &ldquo;{p.post}&rdquo;
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <Button size="sm" variant="secondary" iconLeft={<Icon.edit size={14} />}>
                      Draft a comment
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* RIGHT — drafted comment + why it works */}
        <div className="stack">
          <Card>
            <div className="eyebrow" style={{ marginBottom: 4 }}>Drafted in your voice</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <Avatar name="Maya Patel" size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)" }}>Maya Patel</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Replying to Marcus Hale · CRO, Beacon</div>
              </div>
              <Badge tone="teal">96% sounds like you</Badge>
            </div>

            <div
              style={{
                background: "var(--gray-50)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "14px 16px",
                fontSize: 14.5,
                lineHeight: 1.65,
                color: "var(--text-body)",
              }}
            >
              It&apos;s a people problem wearing a tooling costume. When everyone runs the same script, the feed
              turns into an echo. Give reps a real point of view and the tool stops mattering — they just sound like
              themselves. That&apos;s the part that travels.
            </div>

            {/* Sounds Flat gate passed */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 14,
                padding: "10px 14px",
                background: "var(--green-50)",
                border: "1px solid var(--green-100)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <Icon.check size={16} color="var(--green-600)" stroke={2.4} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--green-700)" }}>
                Sounds Flat passed — no AI tells.
              </span>
            </div>

            <div style={{ display: "flex", gap: 9, marginTop: 18, flexWrap: "wrap" }}>
              <Button variant="success" size="sm" iconLeft={<Icon.copy size={14} />}>
                Copy comment
              </Button>
              <Button variant="ghost" size="sm" iconLeft={<Icon.eye size={14} />}>
                Open post
              </Button>
            </div>
          </Card>

          <Card>
            <div className="eyebrow muted" style={{ marginBottom: 8 }}>Why this works</div>
            <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.55 }}>
              AI-sounding comments get algorithm-penalized. Yours passes the same Sounds Flat gate your posts do.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

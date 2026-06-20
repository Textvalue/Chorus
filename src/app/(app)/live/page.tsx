// Live — publish & measure (PRD §5.10). No auto-publish: export is always a
// deliberate, human-confirmed click. Mock numbers for the not-yet-wired
// scheduling + reach surfaces.
import Link from "next/link";
import Image from "next/image";
import { TopBar, Card, Eyebrow, Stat, Icon } from "@/components/ds";

export const dynamic = "force-dynamic";

const SCHEDULED: { when: string; author: string; topic: string }[] = [
  { when: "Tue 9:10am", author: "Maya Patel", topic: "Why unison kills your brand" },
  { when: "Wed 8:30am", author: "Alex Johnson", topic: "We stopped measuring posts by volume" },
  { when: "Thu 9:00am", author: "Jordan Lee", topic: "Count conversations, not shares" },
];

const RECENT: { title: string; author: string; impressions: string }[] = [
  { title: "The blank page is a tuning problem", author: "Maya", impressions: "412K impressions" },
  { title: "We stopped measuring posts by volume", author: "Alex", impressions: "1.1M impressions" },
];

export default function LivePage() {
  return (
    <div className="main-inner">
      <TopBar
        title="Live"
        subtitle="Publish with confidence, then measure real impact."
        action={
          <Link href="/live" className="btn pri">
            <Icon.copy size={16} color="#fff" /> Export to LinkedIn
          </Link>
        }
      />

      {/* Human-in-the-loop reassurance — no auto-posting, ever (§5.10) */}
      <div className="callout blue" style={{ marginBottom: 20, alignItems: "center" }}>
        <span style={{ color: "var(--teal-600)" }}>
          <Icon.check size={22} />
        </span>
        <div style={{ flex: 1 }}>
          <div className="ct">Human in the loop</div>
          <p>
            Tutti never auto-posts. We generate, you export — a deliberate,
            human-confirmed click. No surprises on your feed.
          </p>
        </div>
      </div>

      <div className="split-side">
        {/* LEFT — the auto-slotted schedule */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-strong)" }}>Scheduled</div>
          </div>
          <Eyebrow muted>Auto-slotted Tue–Thu mornings</Eyebrow>

          <div style={{ marginTop: 10 }}>
            {SCHEDULED.map((s) => (
              <div key={s.when} className="qrow">
                <span
                  style={{
                    width: 38, height: 38, flex: "none", borderRadius: 12, display: "grid", placeItems: "center",
                    background: "var(--blue-50)", color: "var(--blue-600)",
                  }}
                >
                  <Icon.calendar size={18} />
                </span>
                <div className="qb">
                  <div className="qh">{s.topic}</div>
                  <div className="qm">
                    {s.when} · {s.author}
                  </div>
                </div>
                <Link href="/live" className="btn ghost sm">
                  <Icon.copy size={14} /> Copy
                </Link>
              </div>
            ))}
          </div>

          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Blocks posts under 24h apart. Caps at 3–4 per week. You stay in control.
          </p>
        </Card>

        {/* RIGHT — reach + what just shipped */}
        <div className="stack">
          <Card>
            <Eyebrow muted>Reach</Eyebrow>
            <div style={{ marginTop: 8 }}>
              <Stat value="12.4M" label="Total impressions · last 30 days" delta="↑ 78%" />
            </div>
            <Image
              src="/brand/venue-ladder.png"
              alt="Practice Room to Stadium progression"
              width={420}
              height={110}
              style={{ width: "100%", height: "auto", marginTop: 16, mixBlendMode: "multiply" }}
            />
            <p style={{ margin: "12px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
              Climbing toward Arena (1M).
            </p>
          </Card>

          <Card>
            <Eyebrow muted>Recently live</Eyebrow>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 14 }}>
              {RECENT.map((r) => (
                <div key={r.title} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                  <span
                    style={{
                      width: 28, height: 28, flex: "none", borderRadius: 999, display: "grid", placeItems: "center",
                      background: "var(--green-50)", color: "var(--green-600)", marginTop: 1,
                    }}
                  >
                    <Icon.growth size={15} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 650, color: "var(--text-strong)", lineHeight: 1.35 }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                      {r.author} · <span style={{ color: "var(--green-600)", fontWeight: 600 }}>{r.impressions}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

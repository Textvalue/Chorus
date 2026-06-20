// Team — the roster, each person's confirmed voice, and an overlap check.
// Wired to the real workspace: members + their posts drive names, roles and voice
// scores; the overlap check is computed from shared post openings.
import { TopBar, Card, Badge, Avatar, Bar, Icon } from "@/components/ds";
import { getMembers, getPosts, getOrg } from "@/lib/store";
import { InviteMember } from "@/components/InviteMember";

export const dynamic = "force-dynamic";

// "How well it sounds like them" = the average voice-match of a member's own posts, or null if none yet.
function avgVoiceMatch(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

const hookOf = (body: string) => body.trim().split("\n")[0].toLowerCase().replace(/[^a-z0-9 ]/g, "").slice(0, 48);

export default async function TeamPage() {
  const [members, posts, org] = await Promise.all([getMembers(), getPosts(), getOrg()]);
  const ownerId = org?.owner_member_id ?? null;

  // posts per member → voice scores
  const scoresByMember = new Map<string, number[]>();
  for (const p of posts) {
    const list = scoresByMember.get(p.member_id) ?? [];
    list.push(p.voice_match);
    scoresByMember.set(p.member_id, list);
  }

  // Owner first, then the rest.
  const ordered = [...members].sort((a, b) => {
    if (a.member_id === ownerId) return -1;
    if (b.member_id === ownerId) return 1;
    return 0;
  });

  const roster = ordered.map((m) => ({
    id: m.member_id,
    name: m.name,
    role: m.headline || "Member",
    isOwner: m.member_id === ownerId,
    score: avgVoiceMatch(scoresByMember.get(m.member_id) ?? []),
  }));

  // Overlap check: two+ members opening posts with the same hook this workspace.
  const hookMembers = new Map<string, Set<string>>();
  for (const p of posts) {
    if (!p.body.trim()) continue;
    const h = hookOf(p.body);
    const set = hookMembers.get(h) ?? new Set<string>();
    set.add(p.member_id);
    hookMembers.set(h, set);
  }
  const overlapCount = [...hookMembers.values()].filter((s) => s.size >= 2).length;

  const tuned = members.filter((m) => m.expert_pov.status === "confirmed").length;
  const tunedPct = members.length ? Math.round((tuned / members.length) * 100) : 0;

  return (
    <div className="main-inner">
      <TopBar
        title="Your team"
        subtitle="One brand, many distinct voices."
        action={<InviteMember />}
      />

      <div className="split-side">
        {/* Roster */}
        <Card style={{ padding: "6px 24px" }}>
          {roster.length === 0 && (
            <div style={{ padding: "28px 0", textAlign: "center", color: "var(--text-muted)" }}>
              No teammates yet. Add your first voice in onboarding.
            </div>
          )}
          {roster.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "15px 0",
                borderBottom: i < roster.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <Avatar name={r.name} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>{r.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.role}</div>
              </div>
              {r.isOwner && <Badge tone="navy">Owner</Badge>}
              <div style={{ width: 120, flex: "none" }}>
                {r.score === null ? (
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>No posts yet</span>
                ) : (
                  <Bar value={r.score} tone={r.score >= 90 ? "green" : "teal"} showLabel />
                )}
              </div>
            </div>
          ))}
        </Card>

        {/* Side rail */}
        <div className="stack">
          <Card>
            <div className="eyebrow muted" style={{ marginBottom: 8 }}>The team</div>
            <div style={{ fontFamily: "var(--serif)", fontSize: 46, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.01em", color: "var(--text-strong)" }}>
              {members.length} {members.length === 1 ? "voice" : "voices"}
            </div>
            <div style={{ margin: "16px 0 8px" }}>
              <Bar value={tunedPct} tone={tunedPct >= 100 ? "green" : "teal"} showLabel />
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              {tuned} of {members.length} with a confirmed voice
            </div>
          </Card>

          <div className="callout teal">
            <span style={{ color: "var(--teal-600)", marginTop: 2 }}>
              <Icon.sparkles size={20} />
            </span>
            <div>
              <div className="ct">Overlap check</div>
              <p>
                {overlapCount > 0
                  ? `${overlapCount} opening${overlapCount > 1 ? "s are" : " is"} shared by more than one teammate this week. Vary your hooks so you don't all sound alike.`
                  : "Nicely varied — no two teammates are sharing an opening right now."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

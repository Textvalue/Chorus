// Ensemble — team roster, instruments, unison check. Wired to the real workspace:
// members + their posts drive names, roles, voice scores; the unison alarm is computed from
// shared post hooks. One brand DNA, many distinct voices.
import Image from "next/image";
import { TopBar, Card, Badge, Avatar, Bar, Icon } from "@/components/ds";
import { getMembers, getPosts, getOrg } from "@/lib/store";
import { InviteMember } from "@/components/InviteMember";

export const dynamic = "force-dynamic";

const INSTRUMENTS = ["Violin", "Cello", "Flute", "Timpani", "Viola", "Oboe", "Horn", "Clarinet", "Bass", "Harp"];

// Deterministic instrument per member: the org owner conducts, everyone else gets a stable seat.
function instrumentFor(memberId: string, ownerId: string | null, seatIndex: number): string {
  if (ownerId && memberId === ownerId) return "Conductor";
  return INSTRUMENTS[seatIndex % INSTRUMENTS.length];
}

// "How in tune" = the average voice-match of a member's own posts (real signal), or null if none yet.
function avgVoiceMatch(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

const hookOf = (body: string) => body.trim().split("\n")[0].toLowerCase().replace(/[^a-z0-9 ]/g, "").slice(0, 48);

export default async function EnsemblePage() {
  const [members, posts, org] = await Promise.all([getMembers(), getPosts(), getOrg()]);
  const ownerId = org?.owner_member_id ?? null;

  // posts per member → voice scores
  const scoresByMember = new Map<string, number[]>();
  for (const p of posts) {
    const list = scoresByMember.get(p.member_id) ?? [];
    list.push(p.voice_match);
    scoresByMember.set(p.member_id, list);
  }

  // Owner first, then the rest — so the conductor sits at the top of the roster.
  const ordered = [...members].sort((a, b) => {
    if (a.member_id === ownerId) return -1;
    if (b.member_id === ownerId) return 1;
    return 0;
  });

  let seat = 0;
  const roster = ordered.map((m) => {
    const instrument = instrumentFor(m.member_id, ownerId, seat);
    if (m.member_id !== ownerId) seat++;
    return {
      id: m.member_id,
      name: m.name,
      role: m.headline || "Member",
      instrument,
      score: avgVoiceMatch(scoresByMember.get(m.member_id) ?? []),
    };
  });

  // Real unison check: two+ members opening posts with the same hook this workspace.
  const hookMembers = new Map<string, Set<string>>();
  for (const p of posts) {
    if (!p.body.trim()) continue;
    const h = hookOf(p.body);
    const set = hookMembers.get(h) ?? new Set<string>();
    set.add(p.member_id);
    hookMembers.set(h, set);
  }
  const unisonCount = [...hookMembers.values()].filter((s) => s.size >= 2).length;

  const tuned = members.filter((m) => m.expert_pov.status === "confirmed").length;
  const tunedPct = members.length ? Math.round((tuned / members.length) * 100) : 0;

  return (
    <div className="main-inner">
      <TopBar
        title="Your ensemble"
        subtitle="One brand DNA, many distinct voices, one workspace."
        action={<InviteMember />}
      />

      <div className="split-side">
        {/* Roster */}
        <Card>
          {roster.length === 0 && (
            <div style={{ padding: "28px 0", textAlign: "center", color: "var(--text-muted)" }}>
              No players yet. Capture your first voice in onboarding.
            </div>
          )}
          {roster.map((r, i) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 0",
                borderBottom: i < roster.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}
            >
              <Avatar name={r.name} instrument={r.instrument} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>{r.name}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{r.role}</div>
              </div>
              <Badge tone={r.instrument === "Conductor" ? "navy" : "teal"}>{r.instrument}</Badge>
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
          <Card style={{ background: "var(--gray-50)", textAlign: "center" }}>
            <Image
              src="/brand/ensemble.png"
              alt="The ensemble, playing one score"
              width={220}
              height={150}
              style={{ width: "auto", height: 150, margin: "0 auto", mixBlendMode: "multiply" }}
            />
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)", marginTop: 6 }}>
              {members.length} {members.length === 1 ? "player" : "players"} · 1 score
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {tunedPct}% have a confirmed voice
            </div>
          </Card>

          <div className="callout teal">
            <span style={{ color: "var(--teal-600)", marginTop: 2 }}>
              <Icon.waveform size={22} />
            </span>
            <div>
              <div className="ct">Unison alarm</div>
              <p>
                {unisonCount > 0
                  ? `${unisonCount} hook${unisonCount > 1 ? "s are" : " is"} shared by more than one player this week. Spread out so the section doesn't play in unison.`
                  : "Nicely varied — no two players are sharing a hook right now."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

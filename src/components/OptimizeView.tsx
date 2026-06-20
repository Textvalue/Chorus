"use client";
import { useState } from "react";
import { TopBar, Card, Badge, Bar, Avatar } from "@/components/ds";
import { useToast } from "./Toast";
import { LoadingMessage, PROFILE_MESSAGES } from "./LoadingMessage";
import type { ProfileMakeover } from "@/lib/schemas";

type Mem = { id: string; name: string; headline: string; url: string };
type Profile = {
  name: string; headline: string; about: string; photo: string;
  location: string; followers: number; experience: { company: string; position: string }[];
};
type Result = { profile: Profile; makeover: ProfileMakeover; scraped: boolean; mocked: boolean };

function scoreTone(n: number): "green" | "teal" | "blue" {
  return n >= 80 ? "green" : n >= 60 ? "teal" : "blue";
}

// Photo with graceful fallback to initials (LinkedIn CDN images often block hotlinking).
function Photo({ src, name }: { src: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) return <Avatar name={name} size={88} />;
  /* eslint-disable-next-line @next/next/no-img-element */
  return (
    <img
      src={src}
      alt={name}
      onError={() => setBroken(true)}
      style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", display: "block" }}
    />
  );
}

// A LinkedIn-style profile card (banner + photo + headline + About).
function ProfileCard({
  variant, profile, headline, about,
}: {
  variant: "current" | "suggested";
  profile: Profile;
  headline: string;
  about: string;
}) {
  const suggested = variant === "suggested";
  const banner = suggested
    ? "linear-gradient(120deg, var(--teal-500, #1f9d8a), var(--blue-500, #2f6df6))"
    : "linear-gradient(120deg, #c9d2dd, #aab6c4)";
  return (
    <div style={{ border: `1px solid ${suggested ? "var(--teal-500, #1f9d8a)" : "var(--border-subtle, #e6e8ec)"}`, borderRadius: 16, overflow: "hidden", background: "var(--surface-card, #fff)", boxShadow: "var(--shadow-sm, 0 1px 2px rgba(20,30,50,.06))" }}>
      <div style={{ height: 72, background: banner, position: "relative" }}>
        <span style={{ position: "absolute", top: 12, right: 12 }}>
          <Badge tone={suggested ? "green" : "neutral"}>{suggested ? "Suggested" : "Current"}</Badge>
        </span>
      </div>
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{ marginTop: -44, marginBottom: 10, width: 92, height: 92, borderRadius: "50%", border: "3px solid var(--surface-card, #fff)", background: "var(--surface-card,#fff)", overflow: "hidden" }}>
          <Photo src={profile.photo} name={profile.name} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-0.01em" }}>
          {profile.name}
        </div>
        <div
          style={{
            fontSize: 14.5, lineHeight: 1.45, marginTop: 4, color: "var(--text-body)",
            ...(suggested ? { background: "var(--teal-50, #e8f7f3)", borderRadius: 8, padding: "6px 10px", display: "inline-block" } : {}),
          }}
        >
          {headline || <span style={{ color: "var(--text-muted)" }}>(no headline)</span>}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>
          {[profile.location, profile.followers ? `${profile.followers.toLocaleString()} followers` : ""].filter(Boolean).join(" · ")}
        </div>

        <div style={{ marginTop: 16, borderTop: "1px solid var(--border-subtle, #eee)", paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>About</div>
          <div
            style={{
              whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, color: "var(--text-body)",
              ...(suggested ? { background: "var(--teal-50, #e8f7f3)", borderRadius: 10, padding: 14 } : {}),
            }}
          >
            {about || <span style={{ color: "var(--text-muted)" }}>This profile has no About section — the most valuable space on the page is blank.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OptimizeView({ members }: { members: Mem[] }) {
  const toast = useToast();
  const [id, setId] = useState(members[0]?.id ?? "");
  const [url, setUrl] = useState(members[0]?.url ?? "");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [picked, setPicked] = useState(0); // which headline option drives the preview

  const member = members.find((m) => m.id === id);

  function pick(mid: string) {
    setId(mid);
    setUrl(members.find((m) => m.id === mid)?.url ?? "");
    setRes(null);
  }

  async function run() {
    if (!id) return;
    setErr("");
    setLoading(true);
    setRes(null);
    setPicked(0);
    try {
      const r = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: id, linkedin_url: url }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "optimize failed");
      setRes(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }

  const copy = (t: string) => { navigator.clipboard.writeText(t); toast("Copied"); };
  const suggestedHeadline = res?.makeover.headline.options[picked]?.text ?? "";

  return (
    <div className="main-inner">
      <TopBar
        title="Profile optimizer"
        subtitle="A full LinkedIn makeover — see your profile now, then the revised version, grounded in your company and your voice."
      />

      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Optimize</span>
          <div className="seg">
            {members.map((m) => (
              <button key={m.id} className={m.id === id ? "on" : ""} onClick={() => pick(m.id)}>
                <Avatar name={m.name} size={22} /> {m.name.split(" ")[0]}
              </button>
            ))}
          </div>
          <input className="field" style={{ flex: 1, minWidth: 220 }} placeholder="LinkedIn profile URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button className="btn pri" onClick={run} disabled={loading || !id}>
            {loading ? <><span className="spinner" /> Analyzing…</> : "Optimize profile"}
          </button>
        </div>
        {err && <p style={{ color: "var(--amber-500)", fontSize: 13, marginTop: 12 }}>{err}</p>}
      </Card>

      {loading && (
        <Card style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <LoadingMessage messages={[`Reading ${member?.name ?? "the"}'s profile…`, ...PROFILE_MESSAGES]} />
        </Card>
      )}

      {res && (
        <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* score + verdict */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ flex: "none", textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>{res.makeover.overall_score}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/ 100</div>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <Bar value={res.makeover.overall_score} tone={scoreTone(res.makeover.overall_score)} height={10} />
                <p style={{ margin: "12px 0 0", fontSize: 15.5, color: "var(--text-strong)", fontWeight: 600 }}>{res.makeover.verdict}</p>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <Badge tone={res.scraped ? "green" : "amber"}>{res.scraped ? "Live profile" : "From saved data"}</Badge>
                  {res.mocked && <Badge tone="neutral">sample makeover</Badge>}
                </div>
              </div>
            </div>
          </Card>

          {/* BEFORE / AFTER profile preview */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <ProfileCard variant="current" profile={res.profile} headline={res.profile.headline} about={res.profile.about} />
            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 22, lineHeight: 1, margin: "2px 0" }}>↓</div>
            <ProfileCard variant="suggested" profile={res.profile} headline={suggestedHeadline} about={res.makeover.about.rewrite} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
              <button className="btn ghost sm" onClick={() => copy(suggestedHeadline)}>Copy headline</button>
              <button className="btn ghost sm" onClick={() => copy(res.makeover.about.rewrite)}>Copy About</button>
            </div>
          </div>

          {/* headline options — click to preview above */}
          <Card>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Headline options</h3>
            <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--text-muted)" }}>Tap one to preview it in the card above.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {res.makeover.headline.options.map((o, i) => {
                const on = i === picked;
                return (
                  <button
                    key={i}
                    onClick={() => setPicked(i)}
                    style={{
                      textAlign: "left", border: `1px solid ${on ? "var(--teal-500, #1f9d8a)" : "var(--border-subtle, #e6e8ec)"}`,
                      background: on ? "var(--teal-50, #e8f7f3)" : "var(--surface-card,#fff)", borderRadius: 12, padding: 14, cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>{o.text}</div>
                      <span className="btn ghost sm" onClick={(e) => { e.stopPropagation(); copy(o.text); }}>Copy</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>
                      <Badge tone="teal">{o.formula}</Badge> &nbsp;{o.why}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* section audit */}
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 18 }}>Section audit</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {res.makeover.sections.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 84, flex: "none" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, textTransform: "capitalize", color: "var(--text-strong)" }}>{s.name}</div>
                    <Bar value={s.score} tone={scoreTone(s.score)} height={6} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: "var(--text-body)" }}><b>Issue:</b> {s.issue}</div>
                    <div style={{ fontSize: 14, color: "var(--green-600, #0E9F6E)", marginTop: 2 }}><b>Fix:</b> {s.fix}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* priorities */}
          <Card>
            <h3 style={{ margin: "0 0 14px", fontSize: 18 }}>Do these first</h3>
            <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {res.makeover.priorities.map((p, i) => (
                <li key={i} style={{ fontSize: 14.5 }}>
                  <span style={{ fontWeight: 600, color: "var(--text-strong)" }}>{p.change}</span>{" "}
                  <Badge tone="neutral">{p.effort}</Badge>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{p.why}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}

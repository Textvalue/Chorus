"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrgExtract } from "@/lib/schemas";
import { IconSpark, IconCheck } from "@/components/Icons";

type Draft = OrgExtract & { website: string };

export default function OrgOnboarding() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "verify">("input");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function research() {
    setErr("");
    setPhase("loading");
    try {
      const res = await fetch("/api/onboarding/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "research failed");
      setDraft(data.draft);
      setPhase("verify");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
      setPhase("input");
    }
  }

  async function confirm() {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/onboarding/org/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push("/onboarding/member");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "save failed");
      setSaving(false);
    }
  }

  const up = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  if (phase === "verify" && draft) {
    return (
      <div className="center-stage">
        <div className="ob-card fade" style={{ maxWidth: 620 }}>
          <div className="ob-steps">
            <i className="on" /> <span>Company</span> <i /> <span>You</span>
          </div>
          <div className="vhead" style={{ textAlign: "center" }}>
            <h1>We researched {draft.name}. Confirm what's right.</h1>
            <p>Pre-filled from your site and the web — edit anything, then confirm.</p>
          </div>

          <div className="card" style={{ padding: 22, marginBottom: 14 }}>
            <label className="label">Company</label>
            <input className="field verify-field" value={draft.name} onChange={(e) => up({ name: e.target.value })} />
            <label className="label">Positioning</label>
            <textarea
              className="field"
              rows={3}
              value={draft.positioning}
              onChange={(e) => up({ positioning: e.target.value })}
            />
          </div>

          <div className="card" style={{ padding: 22, marginBottom: 14 }}>
            <label className="label">ICP — top pains (each with its weekly trigger)</label>
            {draft.icp.pains.map((p, i) => (
              <div key={i} className="verify-field" style={{ borderLeft: "3px solid var(--coral)", paddingLeft: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.pain}</div>
                <div style={{ fontSize: 13, color: "var(--ink2)" }}>
                  <b>Weekly trigger:</b> {p.weekly_trigger} · <span className="chip">{p.severity}</span>
                </div>
              </div>
            ))}
            <label className="label" style={{ marginTop: 12 }}>Personas</label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {draft.icp.personas.map((p, i) => (
                <span className="chip" key={i}>{p}</span>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22, marginBottom: 14 }}>
            <label className="label">Competitors (data only)</label>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {draft.competitors.map((c, i) => (
                <span className="chip" key={i} title={c.note}>{c.name}</span>
              ))}
            </div>
          </div>

          {err && <p style={{ color: "var(--coral-d)", fontSize: 13 }}>{err}</p>}
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button className="btn pri lg" onClick={confirm} disabled={saving}>
              {saving ? <span className="spinner" /> : <IconCheck />} Looks right — continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="center-stage">
      <div className="ob-card fade">
        <div className="ob-steps">
          <i className="on" /> <span>Company</span> <i /> <span>You</span>
        </div>
        <div className="rmark" style={{ margin: "0 auto 18px" }}>🎙</div>
        <div className="vhead" style={{ textAlign: "center" }}>
          <h1>Set up your company once.</h1>
          <p>One URL. Chorus researches your ICP, pains, positioning and competitors.</p>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <label className="label">Company website</label>
          <input
            className="field"
            placeholder="acme.com"
            value={website}
            disabled={phase === "loading"}
            onChange={(e) => setWebsite(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && website && research()}
          />
          {err && <p style={{ color: "var(--coral-d)", fontSize: 13, marginTop: 10 }}>{err}</p>}
          <button
            className="btn pri lg"
            style={{ width: "100%", marginTop: 14 }}
            onClick={research}
            disabled={!website || phase === "loading"}
          >
            {phase === "loading" ? (
              <>
                <span className="spinner" /> Researching your company…
              </>
            ) : (
              <>
                <IconSpark /> Research my company
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

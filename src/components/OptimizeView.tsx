"use client";
import { useState } from "react";
import { TopBar, Card, Badge, Bar, Avatar } from "@/components/ds";
import { useToast } from "./Toast";
import type { ProfileMakeover } from "@/lib/schemas";

type Mem = { id: string; name: string; headline: string; url: string };
type Result = {
  profile: { name: string; headline: string; about: string; followers: number };
  makeover: ProfileMakeover;
  scraped: boolean;
  mocked: boolean;
};

function scoreTone(n: number): "green" | "teal" | "blue" {
  return n >= 80 ? "green" : n >= 60 ? "teal" : "blue";
}

export function OptimizeView({ members }: { members: Mem[] }) {
  const toast = useToast();
  const [id, setId] = useState(members[0]?.id ?? "");
  const [url, setUrl] = useState(members[0]?.url ?? "");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");

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

  return (
    <div className="main-inner">
      <TopBar
        title="Profile optimizer"
        subtitle="A full LinkedIn makeover — your headline, About, and the changes that matter, grounded in your company and your voice."
      />

      {/* controls */}
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
          <input
            className="field"
            style={{ flex: 1, minWidth: 220 }}
            placeholder="LinkedIn profile URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button className="btn pri" onClick={run} disabled={loading || !id}>
            {loading ? <><span className="spinner" /> Analyzing…</> : "Optimize profile"}
          </button>
        </div>
        {err && <p style={{ color: "var(--amber-500)", fontSize: 13, marginTop: 12 }}>{err}</p>}
      </Card>

      {loading && (
        <Card style={{ textAlign: "center", padding: 48, color: "var(--text-muted)" }}>
          <span className="spinner" /> Reading {member?.name}&apos;s profile and writing the makeover…
        </Card>
      )}

      {res && (
        <div className="fade" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* score + verdict */}
          <Card>
            <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <div style={{ flex: "none", textAlign: "center" }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: "var(--text-strong)", lineHeight: 1 }}>
                  {res.makeover.overall_score}
                </div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>/ 100</div>
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <Bar value={res.makeover.overall_score} tone={scoreTone(res.makeover.overall_score)} height={10} />
                <p style={{ margin: "12px 0 0", fontSize: 15.5, color: "var(--text-strong)", fontWeight: 600 }}>
                  {res.makeover.verdict}
                </p>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <Badge tone={res.scraped ? "green" : "amber"}>{res.scraped ? "Live profile" : "From saved data"}</Badge>
                  {res.mocked && <Badge tone="neutral">sample makeover</Badge>}
                </div>
              </div>
            </div>
          </Card>

          {/* headline rewrites */}
          <Card>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>Headline</h3>
            <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--text-muted)" }}>
              Current: <span style={{ color: "var(--text-body)" }}>{res.makeover.headline.current || "(empty)"}</span>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {res.makeover.headline.options.map((o, i) => (
                <div key={i} style={{ border: "1px solid var(--border-subtle)", borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-strong)" }}>{o.text}</div>
                    <button className="btn ghost sm" onClick={() => copy(o.text)}>Copy</button>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>
                    <Badge tone="teal">{o.formula}</Badge> &nbsp;{o.why}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* about rewrite */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>About — rewritten</h3>
              <button className="btn ghost sm" onClick={() => copy(res.makeover.about.rewrite)}>Copy</button>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "6px 0 12px" }}>{res.makeover.about.current_read}</p>
            <div style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.6, color: "var(--text-body)", background: "var(--gray-50)", borderRadius: 12, padding: 16 }}>
              {res.makeover.about.rewrite}
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

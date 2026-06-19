"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Member } from "@/lib/types";
import { IconSpark, IconCheck } from "@/components/Icons";
import { Avatar } from "@/components/Avatar";

export default function MemberOnboarding() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "loading" | "done">("input");
  const [member, setMember] = useState<Member | null>(null);
  const [err, setErr] = useState("");

  async function run() {
    setErr("");
    setPhase("loading");
    try {
      const res = await fetch("/api/onboarding/member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedin_url: url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setMember(data.member);
      setPhase("done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
      setPhase("input");
    }
  }

  if (phase === "done" && member) {
    return (
      <div className="center-stage">
        <div className="ob-card fade" style={{ maxWidth: 600 }}>
          <div className="ob-steps">
            <i className="done" /> <span>Company</span> <i className="on" /> <span>You</span>
          </div>
          <div style={{ textAlign: "center", marginBottom: 22 }}>
            <span className="chip" style={{ color: "var(--green)", borderColor: "#bfe7d4", background: "var(--green-soft)" }}>
              <IconCheck className="" /> Voice ready
            </span>
            <h1 style={{ fontSize: 27, fontWeight: 750, letterSpacing: "-.03em", margin: "16px 0 6px" }}>
              {member.name}&apos;s voice, captured.
            </h1>
            <p style={{ color: "var(--ink3)", maxWidth: 440, margin: "0 auto" }}>
              Grounded in {member.prose_samples.length} of your real posts — not a template.
            </p>
          </div>

          <div className="card" style={{ padding: 22, marginBottom: 14 }}>
            <div className="label">How you sound</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {member.voice_dna.traits.map((t, i) => (
                <span className="chip" key={i}>{t}</span>
              ))}
            </div>
            {member.voice_dna.signature_terms.length > 0 && (
              <div style={{ fontSize: 13, color: "var(--ink2)", marginTop: 13 }}>
                <b style={{ color: "var(--ink)" }}>Signature:</b>{" "}
                {member.voice_dna.signature_terms.slice(0, 4).map((s) => `"${s}"`).join(" · ")}
                {member.voice_dna.phrases_to_avoid.length > 0 && (
                  <>
                    {" "}&nbsp;·&nbsp; <b style={{ color: "var(--ink)" }}>Never:</b>{" "}
                    {member.voice_dna.phrases_to_avoid.slice(0, 3).join(", ")}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 22 }}>
            <div className="label">
              What you believe <span style={{ textTransform: "none", color: "var(--coral)" }}>· we guessed this — fix anything wrong</span>
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
              {member.expert_pov.beliefs.map((b, i) => (
                <div key={i}>◆ {b}</div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 26, display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="btn lg" onClick={() => { setPhase("input"); setUrl(""); setMember(null); }}>
              + Add a teammate
            </button>
            <button className="btn pri lg" onClick={() => router.push("/create")}>
              Write my first post →
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
          <i className="done" /> <span>Company</span> <i className="on" /> <span>You</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Avatar name="New You" lg />
        </div>
        <div className="vhead" style={{ textAlign: "center" }}>
          <h1>Now your voice. Just your LinkedIn URL.</h1>
          <p>Chorus reads your real posts to learn how you write and what you believe.</p>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <label className="label">Your LinkedIn profile URL</label>
          <input
            className="field"
            placeholder="https://www.linkedin.com/in/yourname"
            value={url}
            disabled={phase === "loading"}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && url && run()}
          />
          {err && <p style={{ color: "var(--coral-d)", fontSize: 13, marginTop: 10 }}>{err}</p>}
          <button className="btn pri lg" style={{ width: "100%", marginTop: 14 }} onClick={run} disabled={!url || phase === "loading"}>
            {phase === "loading" ? (
              <>
                <span className="spinner" /> Reading your posts &amp; learning your voice…
              </>
            ) : (
              <>
                <IconSpark /> Capture my voice
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

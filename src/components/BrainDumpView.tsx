"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { MicButton } from "./MicButton";
import { useToast } from "./Toast";
import { LoadingMessage, THINKING_MESSAGES } from "./LoadingMessage";
import { IconSpark, IconCheck } from "./Icons";

type Mem = { id: string; name: string };
type Idea = { title: string; angle: string; tag: string };
type Pov = { beliefs: string[]; topics: string[]; hot_takes: string[]; status: string };

export function BrainDumpView({ members }: { members: Mem[] }) {
  const router = useRouter();
  const toast = useToast();
  const [authorId, setAuthorId] = useState(members[0]?.id ?? "");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [pov, setPov] = useState<Pov | null>(null);
  const [err, setErr] = useState("");

  async function process() {
    if (!text.trim()) return;
    setErr("");
    setLoading(true);
    setIdeas([]);
    setPov(null);
    try {
      const res = await fetch("/api/brain-dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: authorId, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setIdeas(data.ideas);
      setPov(data.pov);
      toast(`Captured — ${data.ideas.length} ideas, POV updated`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pad narrow">
      <div className="auth-row">
        <span className="al">Writing as</span>
        <div className="seg">
          {members.map((m) => (
            <button key={m.id} className={m.id === authorId ? "on" : ""} onClick={() => setAuthorId(m.id)}>
              <Avatar name={m.name} /> {m.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <h1 className="ch">What are you seeing this week?</h1>
      <div className="composer">
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What did you just learn, argue, or change your mind about? Talk freely — Penkala turns it into ideas and sharpens what you believe."
        />
        <div className="composer-foot">
          <span className="hint">This both spawns post ideas and corrects your POV — the part that gets smarter over time.</span>
          <MicButton value={text} onChange={setText} />
          <button className="btn pri" onClick={process} disabled={!text.trim() || loading}>
            {loading ? <><span className="spinner" /> Processing…</> : <><IconSpark /> Process</>}
          </button>
        </div>
      </div>

      {err && <p style={{ color: "var(--coral-d)", marginTop: 14 }}>{err}</p>}

      {loading && (
        <div style={{ marginTop: 20, color: "var(--text-muted)" }}>
          <LoadingMessage messages={THINKING_MESSAGES} />
        </div>
      )}

      {pov && (
        <div className="card fade" style={{ padding: 20, marginTop: 24 }}>
          <div className="label">
            <IconCheck className="" /> POV updated
            {pov.status === "confirmed" && <span style={{ color: "var(--green)", textTransform: "none" }}> · now confirmed</span>}
          </div>
          <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
            {pov.beliefs.slice(-3).map((b, i) => <div key={i}>◆ {b}</div>)}
          </div>
        </div>
      )}

      {ideas.length > 0 && (
        <div className="card fade" style={{ padding: "6px 24px", marginTop: 16 }}>
          {ideas.map((idea, i) => (
            <div className="idea" key={i}>
              <div className="iic">💡</div>
              <div className="ib">
                <div className="ih">{idea.title}</div>
                <div className="ia">{idea.angle}</div>
                <div className="im"><span className="chip">{idea.tag}</span></div>
              </div>
              <button className="btn sm pri" onClick={() => router.push(`/create?topic=${encodeURIComponent(idea.title)}`)}>
                Write
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

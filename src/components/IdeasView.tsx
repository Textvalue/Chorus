"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { IconRefresh } from "./Icons";

type Mem = { id: string; name: string };
type Idea = { title: string; angle: string; source: string; tag: string };

const ICONS = ["💡", "⚡", "🎯", "📺", "📰", "🔥", "🧭", "✦"];

export function IdeasView({ members }: { members: Mem[] }) {
  const router = useRouter();
  const [authorId, setAuthorId] = useState(members[0]?.id ?? "");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async (id: string) => {
    if (!id) return;
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setIdeas(data.ideas);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // No auto-trigger — ideas are generated only when the member asks for them.
  const author = members.find((m) => m.id === authorId);
  const who = author ? `${author.name.split(" ")[0]}'s` : "your";

  return (
    <div className="pad">
      <div className="vhead" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1>Ideas</h1>
          <p>Pulled from what you believe and the gaps your company can own.</p>
        </div>
        <div className="seg">
          {members.map((m) => (
            <button
              key={m.id}
              className={m.id === authorId ? "on" : ""}
              onClick={() => { setAuthorId(m.id); setIdeas([]); setErr(""); }}
            >
              <Avatar name={m.name} /> {m.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="srcrow" style={{ marginBottom: 18 }}>
        <span className="chip dot" style={{ color: "var(--teal-600)" }}>Your beliefs</span>
        <span className="chip dot" style={{ color: "var(--blue-600)" }}>Company pains</span>
        {ideas.length > 0 && (
          <button className="btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => load(authorId)} disabled={loading}>
            <IconRefresh /> {loading ? "Finding…" : "Refresh"}
          </button>
        )}
      </div>

      {err && <p style={{ color: "var(--amber-500)" }}>{err}</p>}

      {loading && ideas.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
          <span className="spinner" /> Finding ideas from {who} beliefs…
        </div>
      ) : ideas.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-strong)", marginBottom: 6 }}>Ready when you are.</div>
          <p style={{ color: "var(--text-muted)", maxWidth: 380, margin: "0 auto 20px", lineHeight: 1.5 }}>
            Pull fresh angles from {who} beliefs and the gaps your company can own.
          </p>
          <button className="btn pri" onClick={() => load(authorId)} disabled={loading}>
            <IconRefresh /> Find ideas
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: "6px 24px" }}>
          {ideas.map((idea, i) => (
            <div className="idea" key={i}>
              <div className="iic">{ICONS[i % ICONS.length]}</div>
              <div className="ib">
                <div className="ih">{idea.title}</div>
                <div className="ia">{idea.angle}</div>
                <div className="im">
                  <span className="chip dot" style={{ color: "var(--teal-600)" }}>{idea.source}</span>
                  <span className="chip">{idea.tag}</span>
                </div>
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

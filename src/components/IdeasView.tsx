"use client";
import { useCallback, useEffect, useState } from "react";
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

  useEffect(() => {
    load(authorId);
  }, [authorId, load]);

  return (
    <div className="pad">
      <div className="vhead" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1>Ideas</h1>
          <p>Pulled from what you believe and the gaps your company can own.</p>
        </div>
        <div className="seg">
          {members.map((m) => (
            <button key={m.id} className={m.id === authorId ? "on" : ""} onClick={() => setAuthorId(m.id)}>
              <Avatar name={m.name} /> {m.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="srcrow" style={{ marginBottom: 18 }}>
        <span className="chip dot" style={{ color: "#7C3AED" }}>Your beliefs</span>
        <span className="chip dot" style={{ color: "var(--coral)" }}>Company pains</span>
        <button className="btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => load(authorId)} disabled={loading}>
          <IconRefresh /> {loading ? "Generating…" : "Refresh"}
        </button>
      </div>

      {err && <p style={{ color: "var(--coral-d)" }}>{err}</p>}

      {loading && ideas.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink3)" }}>
          <span className="spinner" /> Generating ideas from your POV…
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
                  <span className="chip dot" style={{ color: "#7C3AED" }}>{idea.source}</span>
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

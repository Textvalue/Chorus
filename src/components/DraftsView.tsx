"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { useToast } from "./Toast";
import { IconCheck, IconX, IconEdit } from "./Icons";

type Row = {
  id: string;
  topic: string;
  body: string;
  status: "draft" | "approved" | "rejected";
  member: string;
  angle: string;
  image_url?: string | null;
};

const FILTERS = ["All", "Needs approval", "Approved"] as const;

export function DraftsView({ posts }: { posts: Row[] }) {
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [body, setBody] = useState("");

  const shown = posts.filter((p) =>
    filter === "All" ? true : filter === "Needs approval" ? p.status === "draft" : p.status === "approved"
  );

  async function act(id: string, action: "approve" | "reject" | "edit", b?: string) {
    const res = await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, body: b }),
    });
    if (!res.ok) return toast("Something went wrong");
    if (action === "approve") toast("Approved");
    if (action === "reject") toast("Rejected — logged as a correction");
    if (action === "edit") toast("Saved — your edit trains your voice");
    setEditId(null);
    router.refresh();
  }

  return (
    <div className="pad">
      <div className="vhead" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1>Queue</h1>
          <p>Your approved posts, ready to copy &amp; post. Nothing publishes automatically.</p>
        </div>
        <div className="seg">
          {FILTERS.map((f) => (
            <button key={f} className={f === filter ? "on" : ""} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--ink3)" }}>
          Nothing here yet. Write one from <b>Create</b>.
        </div>
      ) : (
        <div className="card" style={{ padding: "8px 24px" }}>
          {shown.map((p) => (
            <div key={p.id}>
              <div className="qrow">
                <Avatar name={p.member} lg />
                <div className="qb">
                  <div className="qh">{p.topic}</div>
                  <div className="qm">{p.member}{p.angle ? ` · ${p.angle}` : ""}</div>
                </div>
                {p.status === "draft" && <span className="pill need">Needs you</span>}
                {p.status === "approved" && <span className="pill sched">Approved</span>}
                {p.status === "rejected" && <span className="pill rejected">Passed</span>}
                {p.status === "approved" && (
                  <button
                    className="btn ghost sm"
                    onClick={() => { navigator.clipboard.writeText(p.body); toast("Copied — open LinkedIn to post"); }}
                  >
                    Copy
                  </button>
                )}
                <button
                  className="btn ghost sm"
                  onClick={() => { setOpenId(openId === p.id ? null : p.id); setEditId(null); }}
                >
                  {openId === p.id ? "Close" : "Review"}
                </button>
              </div>

              {openId === p.id && (
                <div className="fade" style={{ padding: "4px 0 18px" }}>
                  {editId === p.id ? (
                    <textarea
                      className="field"
                      style={{ minHeight: 200, lineHeight: 1.6 }}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                  ) : (
                    <div style={{ whiteSpace: "pre-wrap", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: 16, fontSize: 14.5, lineHeight: 1.6 }}>
                      {p.body}
                    </div>
                  )}
                  {p.image_url && editId !== p.id && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={p.image_url} alt="Post visual" style={{ width: "100%", maxWidth: 420, borderRadius: 12, marginTop: 12, border: "1px solid var(--line)" }} />
                  )}
                  <div className="actions">
                    {editId === p.id ? (
                      <>
                        <button className="btn pri" onClick={() => act(p.id, "edit", body)}><IconCheck /> Save edit</button>
                        <button className="btn ghost" onClick={() => setEditId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="btn pri" onClick={() => act(p.id, "approve")}><IconCheck /> Approve</button>
                        <button className="btn" onClick={() => { setEditId(p.id); setBody(p.body); }}><IconEdit /> Edit</button>
                        <button className="btn ghost" onClick={() => act(p.id, "reject")}><IconX /> Reject</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

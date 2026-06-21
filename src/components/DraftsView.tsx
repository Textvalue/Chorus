"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { useToast } from "./Toast";
import { IconCheck, IconX, IconEdit, IconSpark, IconCopy } from "./Icons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

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

function StatusBadge({ status }: { status: Row["status"] }) {
  if (status === "draft") return <Badge variant="default"><IconSpark /> Needs you</Badge>;
  if (status === "approved") return <Badge variant="success"><IconCheck /> Approved</Badge>;
  return <Badge variant="secondary"><IconX /> Passed</Badge>;
}

export function DraftsView({ posts }: { posts: Row[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const shown = posts.filter((p) =>
    filter === "All" ? true : filter === "Needs approval" ? p.status === "draft" : p.status === "approved"
  );

  return (
    <div className="pad">
      <div className="vhead" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h1>Queue</h1>
          <p>Your approved posts, ready to copy &amp; post. Nothing publishes automatically.</p>
        </div>
        <SegmentedControl
          tone="accent"
          size="md"
          aria-label="Filter"
          value={filter}
          onValueChange={(v) => setFilter(v as (typeof FILTERS)[number])}
          options={FILTERS.map((f) => ({ value: f, label: f }))}
        />
      </div>

      {shown.length === 0 ? (
        <Empty className="border border-[var(--line)]">
          <EmptyHeader>
            <EmptyMedia variant="icon"><IconSpark /></EmptyMedia>
            <EmptyTitle>Nothing here yet</EmptyTitle>
            <EmptyDescription>
              Write one from <b>Create</b> and it&apos;ll land in your queue.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <AnimatedGroup className="flex flex-col gap-3">
          {shown.map((p) => (
            <Card key={p.id} size="sm">
              <Item>
                <ItemMedia>
                  <Avatar name={p.member} lg />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{p.topic}</ItemTitle>
                  <ItemDescription>{p.member}{p.angle ? ` · ${p.angle}` : ""}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <StatusBadge status={p.status} />
                  <button
                    className="btn ghost sm"
                    onClick={() => setOpenId(openId === p.id ? null : p.id)}
                  >
                    {openId === p.id ? "Close" : "Review"}
                  </button>
                </ItemActions>
              </Item>

              {openId === p.id && <DraftReview key={p.id} row={p} onClose={() => setOpenId(null)} />}
            </Card>
          ))}
        </AnimatedGroup>
      )}
    </div>
  );
}

type ChatMsg = { role: "you" | "penkala"; text: string };

const QUICK_EDITS = ["Make it shorter", "Punchier hook", "Add a concrete number", "Warmer tone", "Stronger CTA"];

function DraftReview({ row, onClose }: { row: Row; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [body, setBody] = useState(row.body);
  const [manualEditing, setManualEditing] = useState(false);
  const [manualDraft, setManualDraft] = useState(row.body);
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject", b?: string) {
    const res = await fetch(`/api/posts/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, body: b }),
    });
    if (!res.ok) return toast("Something went wrong");
    if (action === "approve") toast("Approved");
    if (action === "reject") toast("Rejected — logged as a correction");
    onClose();
    router.refresh();
  }

  async function saveManual() {
    const res = await fetch(`/api/posts/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", body: manualDraft }),
    });
    if (!res.ok) return toast("Something went wrong");
    setBody(manualDraft);
    setManualEditing(false);
    toast("Saved — your edit trains your voice");
    router.refresh();
  }

  async function sendFeedback(instruction: string) {
    const text = instruction.trim();
    if (!text || busy) return;
    setInput("");
    setChat((c) => [...c, { role: "you", text }]);
    setBusy(true);
    try {
      const res = await fetch(`/api/posts/${row.id}/revise`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "revise failed");
      setBody(data.body);
      setManualDraft(data.body);
      setChat((c) => [...c, { role: "penkala", text: "Done — rewritten in your voice and saved to your memory for next time." }]);
      router.refresh();
    } catch (e) {
      setChat((c) => [...c, { role: "penkala", text: `Couldn't apply that: ${e instanceof Error ? e.message : "failed"}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fade" style={{ padding: "0 12px 6px" }}>
      {/* Post body / manual editor */}
      {manualEditing ? (
        <textarea
          className="field"
          style={{ minHeight: 200, lineHeight: 1.6 }}
          value={manualDraft}
          onChange={(e) => setManualDraft(e.target.value)}
        />
      ) : (
        <div style={{ whiteSpace: "pre-wrap", background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 14, padding: 16, fontSize: 14.5, lineHeight: 1.6 }}>
          {body}
        </div>
      )}
      {row.image_url && !manualEditing && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={row.image_url} alt="Post visual" style={{ width: "100%", maxWidth: 420, borderRadius: 12, marginTop: 12, border: "1px solid var(--line)" }} />
      )}

      {/* AI chat-edit — feedback rewrites the post AND is remembered */}
      {!manualEditing && (
        <div style={{ marginTop: 14, border: "1px solid var(--line)", borderRadius: 14, padding: 14, background: "var(--surface, #fff)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ display: "inline-flex", color: "var(--accent-ink)" }}><IconSpark /></span>
            <span style={{ fontWeight: 700, fontSize: 13 }}>Refine with AI</span>
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--ink3, #9b9ba3)" }}>Feedback is saved to your voice memory</span>
          </div>

          {chat.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
              {chat.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === "you" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    fontSize: 13,
                    lineHeight: 1.5,
                    padding: "8px 12px",
                    borderRadius: 12,
                    background: m.role === "you" ? "var(--accent-soft, #efeaff)" : "var(--paper-2, #f4f4f5)",
                    color: m.role === "you" ? "var(--accent-ink, #4b2fbf)" : "var(--text-body, #45454d)",
                  }}
                >
                  {m.text}
                </div>
              ))}
              {busy && (
                <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink3, #9b9ba3)", padding: "4px 2px" }}>
                  <span className="spinner" style={{ width: 13, height: 13 }} /> Rewriting in your voice…
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
            {QUICK_EDITS.map((q) => (
              <button key={q} className="chip" disabled={busy} onClick={() => sendFeedback(q)} style={{ cursor: busy ? "default" : "pointer" }}>
                {q}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              className="field"
              rows={1}
              placeholder="Tell Penkala what to change — e.g. “cut the intro, lead with the number”…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendFeedback(input); }
              }}
              style={{ flex: 1, resize: "none", minHeight: 42 }}
              disabled={busy}
            />
            <button className="btn pri" onClick={() => sendFeedback(input)} disabled={busy || !input.trim()}>
              {busy ? <span className="spinner" /> : <IconSpark />} Send
            </button>
          </div>
        </div>
      )}

      {/* Primary actions */}
      <div className="actions">
        {manualEditing ? (
          <>
            <button className="btn pri" onClick={saveManual}><IconCheck /> Save edit</button>
            <button className="btn ghost" onClick={() => { setManualEditing(false); setManualDraft(body); }}>Cancel</button>
          </>
        ) : (
          <>
            <button className="btn pri" onClick={() => act("approve")}><IconCheck /> Approve</button>
            <button className="btn" onClick={() => { navigator.clipboard.writeText(body); toast("Copied — open LinkedIn to post"); }}><IconCopy /> Copy</button>
            <button className="btn ghost" onClick={() => { setManualEditing(true); setManualDraft(body); }}><IconEdit /> Edit by hand</button>
            <button className="btn ghost" onClick={() => act("reject")}><IconX /> Reject</button>
          </>
        )}
      </div>
    </div>
  );
}

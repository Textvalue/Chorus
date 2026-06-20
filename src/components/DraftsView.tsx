"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { useToast } from "./Toast";
import { IconCheck, IconX, IconEdit, IconSpark } from "./Icons";
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
                </ItemActions>
              </Item>

              {openId === p.id && (
                <div className="fade" style={{ padding: "0 12px 6px" }}>
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
            </Card>
          ))}
        </AnimatedGroup>
      )}
    </div>
  );
}

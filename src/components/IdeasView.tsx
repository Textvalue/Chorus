"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { IconRefresh, IconIdeas, IconSpark } from "./Icons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";

type Mem = { id: string; name: string };
type Idea = { title: string; angle: string; source_type: "belief" | "pain"; source: string; tag: string };
type Mode = "foryou" | "discover" | "repurpose";

const ICONS = ["💡", "⚡", "🎯", "📺", "📰", "🔥", "🧭", "✦"];

export function IdeasView({ members }: { members: Mem[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("foryou");
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
          <p>Pulled from what you believe — discover what&apos;s working on any topic, or reuse something you already made. All turned into posts in your voice.</p>
        </div>
        <SegmentedControl
          tone="surface"
          aria-label="Author"
          value={authorId}
          onValueChange={(id) => { setAuthorId(id); setIdeas([]); setErr(""); }}
          options={members.map((m) => ({
            value: m.id,
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Avatar name={m.name} /> {m.name.split(" ")[0]}
              </span>
            ),
          }))}
        />
      </div>

      {/* Mode switch */}
      <div style={{ marginBottom: 22 }}>
        <SegmentedControl
          tone="accent"
          size="md"
          aria-label="Idea mode"
          value={mode}
          onValueChange={(v) => setMode(v as Mode)}
          options={[
            { value: "foryou", label: (<span className="inline-flex items-center gap-1.5"><IconIdeas className="fill-none stroke-current [stroke-width:1.8]" /> For you</span>) },
            { value: "discover", label: (<span className="inline-flex items-center gap-1.5"><IconSpark className="fill-none stroke-current [stroke-width:1.8]" /> Discover</span>) },
            { value: "repurpose", label: (<span className="inline-flex items-center gap-1.5"><IconRefresh className="fill-none stroke-current [stroke-width:1.8]" /> Repurpose</span>) },
          ]}
        />
      </div>

      {/* ---------- FOR YOU ---------- */}
      {mode === "foryou" && (
        <div className="fade">
          <div className="srcrow" style={{ marginBottom: 18 }}>
            <Badge variant="success">Your beliefs</Badge>
            <Badge variant="default">Company pains</Badge>
            {ideas.length > 0 && (
              <button className="btn ghost sm" style={{ marginLeft: "auto" }} onClick={() => load(authorId)} disabled={loading}>
                <IconRefresh /> {loading ? "Finding…" : "Refresh"}
              </button>
            )}
          </div>

          {err && <p style={{ color: "var(--amber)" }}>{err}</p>}

          {loading && ideas.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <span className="spinner" /> Finding ideas from {who} beliefs…
            </div>
          ) : ideas.length === 0 ? (
            <Empty style={{ padding: 48 }}>
              <EmptyHeader>
                <EmptyTitle style={{ fontSize: 17, color: "var(--text-strong)" }}>Ready when you are.</EmptyTitle>
                <EmptyDescription>
                  Pull fresh angles from {who} beliefs and the gaps your company can own.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <button className="btn pri" onClick={() => load(authorId)} disabled={loading}>
                  <IconRefresh /> Find ideas
                </button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="card" style={{ padding: "6px 24px" }}>
              <AnimatedGroup as="div" className="divide-y divide-[var(--line)]">
                {ideas.map((idea, i) => (
                  <Item key={i} className="gap-[15px] rounded-none px-0 py-[18px]">
                    <ItemMedia className="iic">{ICONS[i % ICONS.length]}</ItemMedia>
                    <ItemContent>
                      <ItemTitle className="text-[15.5px] font-bold text-[var(--text-strong)]">{idea.title}</ItemTitle>
                      <ItemDescription className="text-[13.5px] text-[var(--text-body)]">{idea.angle}</ItemDescription>
                      <div className="im">
                        <Badge variant={idea.source_type === "pain" ? "default" : "success"}>{idea.source}</Badge>
                        <Badge variant="secondary">{idea.tag}</Badge>
                      </div>
                    </ItemContent>
                    <ItemActions>
                      <button className="btn sm ghost" onClick={() => router.push(`/create?topic=${encodeURIComponent(idea.title)}`)}>
                        Write →
                      </button>
                    </ItemActions>
                  </Item>
                ))}
              </AnimatedGroup>
            </div>
          )}
        </div>
      )}

      {/* ---------- DISCOVER ---------- */}
      {mode === "discover" && (
        <div className="fade">
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input className="field" style={{ flex: 1, minWidth: 220 }} placeholder="Analyze what's working for any topic…" disabled />
              <button className="btn pri" disabled>Analyze</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {["Last 30 days", "Min 200 likes", "5k+ followers", "All formats"].map((f) => (
                <span key={f} className="chip">{f}</span>
              ))}
            </div>
          </div>
          <Empty style={{ padding: 48 }}>
            <EmptyHeader>
              <EmptyTitle style={{ fontSize: 17, color: "var(--text-strong)" }}>Discover what&apos;s trending</EmptyTitle>
              <EmptyDescription style={{ maxWidth: 460 }}>
                Type any topic and Tutti studies the top-performing LinkedIn posts, tells you what&apos;s actually winning, and turns the patterns into ideas grounded in your context — with the right format and hook.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Badge variant="secondary">Coming soon</Badge>
            </EmptyContent>
          </Empty>
        </div>
      )}

      {/* ---------- REPURPOSE ---------- */}
      {mode === "repurpose" && (
        <div className="fade">
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input className="field" style={{ flex: 1, minWidth: 220 }} placeholder="Paste a blog post, podcast, YouTube, or webinar URL…" disabled />
              <button className="btn pri" disabled>Repurpose</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {["Blog post", "Podcast", "YouTube", "Webinar", "Past post"].map((f, i) => (
                <span key={f} className={`chip${i === 0 ? " dot" : ""}`} style={i === 0 ? { color: "var(--brass-600)" } : undefined}>{f}</span>
              ))}
            </div>
          </div>
          <Empty style={{ padding: 48 }}>
            <EmptyHeader>
              <EmptyTitle style={{ fontSize: 17, color: "var(--text-strong)" }}>Turn one thing into many</EmptyTitle>
              <EmptyDescription style={{ maxWidth: 460 }}>
                Drop in something you already made — a blog post, podcast, webinar, or an old top post. Tutti breaks it into reusable pieces and the highest-leverage ways to turn it into posts, in your voice.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Badge variant="secondary">Coming soon</Badge>
            </EmptyContent>
          </Empty>
        </div>
      )}
    </div>
  );
}

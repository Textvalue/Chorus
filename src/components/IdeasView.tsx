"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "./Avatar";
import { IconRefresh, IconIdeas, IconSpark, IconEdit, IconCheck, IconX } from "./Icons";
import { useToast } from "./Toast";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { LoadingMessage, IDEAS_MESSAGES } from "./LoadingMessage";

type Mem = { id: string; name: string };
type Idea = { title: string; angle: string; source_type: "belief" | "pain"; source: string; tag: string };
type Mode = "foryou" | "discover" | "repurpose";

const ICONS = ["💡", "⚡", "🎯", "📺", "📰", "🔥", "🧭", "✦"];

// Demo ideas so the section is populated out of the box (like the rest of the app).
// Replaced the moment the member hits "Find ideas" / Refresh.
const MOCK_IDEAS: Idea[] = [
  { title: "The advocacy playbook is quietly killing your reach", angle: "Open with the 40-cellos-one-note image, then reframe: the algorithm reads sameness as spam.", source_type: "belief", source: "Your beliefs", tag: "Contrarian" },
  { title: "“On-brand” should never mean “identical”", angle: "Separate brand DNA (shared) from voice (personal). Make the case for harmony, not unison.", source_type: "belief", source: "Your beliefs", tag: "POV" },
  { title: "We measured what employee advocacy actually returns", angle: "Lead with the reach-vs-pipeline gap; measured, data-led tone.", source_type: "pain", source: "Company pains", tag: "Data" },
  { title: "The correction loop is the moat nobody talks about", angle: "Every edit teaches the model who you are — compounding and un-copyable.", source_type: "belief", source: "Your beliefs", tag: "Insight" },
  { title: "Your reps all sound the same — here’s the fix", angle: "Name the tooling-vs-people tension, land on “give them a POV, not a script.”", source_type: "pain", source: "Company pains", tag: "How-to" },
  { title: "Stop scheduling. Start sounding human.", angle: "Short and punchy: distinct voices on one strategy beat identical voices every time.", source_type: "belief", source: "Your beliefs", tag: "Punchy" },
];

type DiscoverIdea = { title: string; angle: string; pillar: string; format: string; hook_type: string; tag: string };
type DiscoverResult = {
  topic: string;
  maturity: "emerging" | "hot" | "saturated";
  trend: string;
  summary: string;
  formats: { label: string; strength: "highest" | "high" | "baseline" | "declining" | "penalized"; multiplier: string; note: string }[];
  hooks: { text: string; type: string; why: string }[];
  winning_structure: { framework: string; rhythm: string; length: string };
  avoid: { what: string; why: string }[];
  algorithm: { best_time: string; cadence: string; cta: string };
  ideas: DiscoverIdea[];
};
type RepurposeResult = { ways: number; pieces: number; weeks: string; atoms: string[]; assets: { title: string; lift: string }[] };

// Maturity → badge tone. "hot" = crowded-but-proven, "emerging" = open lane, "saturated" = caution.
const MATURITY_TONE: Record<DiscoverResult["maturity"], "success" | "warning" | "secondary"> = {
  emerging: "success",
  hot: "warning",
  saturated: "secondary",
};
// Format strength → badge tone.
const STRENGTH_TONE: Record<DiscoverResult["formats"][number]["strength"], "success" | "default" | "secondary" | "warning"> = {
  highest: "success",
  high: "default",
  baseline: "secondary",
  declining: "warning",
  penalized: "warning",
};

// Mock "Repurpose" breakdown for any source URL/transcript.
function mockRepurpose(): RepurposeResult {
  return {
    ways: 9,
    pieces: 6,
    weeks: "4–6",
    atoms: [
      "A contrarian one-liner that opens a post",
      "A 3-step framework you can teach",
      "A surprising stat worth its own post",
      "A short personal story / lesson learned",
      "A myth-vs-reality comparison",
      "A checklist readers can save",
    ],
    assets: [
      { title: "Carousel: the 3-step framework", lift: "3× reach" },
      { title: "Hook post: the contrarian opener", lift: "2× saves" },
      { title: "Data post: the surprising stat", lift: "Strong fit" },
    ],
  };
}

export function IdeasView({ members }: { members: Mem[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("foryou");
  const [authorId, setAuthorId] = useState(members[0]?.id ?? "");
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const toast = useToast();
  // Inline edit (in-session) of an idea's title/angle before you write it.
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftAngle, setDraftAngle] = useState("");

  function startEdit(i: number, idea: Idea) {
    setEditIdx(i);
    setDraftTitle(idea.title);
    setDraftAngle(idea.angle);
  }
  function saveEdit(i: number) {
    setIdeas((prev) => prev.map((it, j) => (j === i ? { ...it, title: draftTitle.trim() || it.title, angle: draftAngle.trim() || it.angle } : it)));
    setEditIdx(null);
    toast("Idea updated");
  }

  // Discover — a real trending-content analysis for the topic, grounded in our LinkedIn
  // frameworks + the company/author context (POST /api/discover).
  const [dq, setDq] = useState("");
  const [dBusy, setDBusy] = useState(false);
  const [dErr, setDErr] = useState("");
  const [discover, setDiscover] = useState<DiscoverResult | null>(null);
  async function runDiscover() {
    if (!dq.trim() || dBusy) return;
    setDBusy(true);
    setDErr("");
    setDiscover(null);
    try {
      const res = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: dq.trim(), member_id: authorId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "analysis failed");
      setDiscover(data as DiscoverResult);
    } catch (e) {
      setDErr(e instanceof Error ? e.message : "analysis failed");
    } finally {
      setDBusy(false);
    }
  }

  // Repurpose — break down any source (mock results, in-session).
  const [rq, setRq] = useState("");
  const [rBusy, setRBusy] = useState(false);
  const [repurpose, setRepurpose] = useState<RepurposeResult | null>(null);
  function runRepurpose() {
    if (!rq.trim() || rBusy) return;
    setRBusy(true);
    setRepurpose(null);
    window.setTimeout(() => { setRepurpose(mockRepurpose()); setRBusy(false); }, 1100);
  }

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
              <LoadingMessage messages={[`Reading ${who} beliefs…`, ...IDEAS_MESSAGES]} />
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
                    {editIdx === i ? (
                      <ItemContent>
                        <input
                          className="field"
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          autoFocus
                          style={{ fontWeight: 700, marginBottom: 8 }}
                        />
                        <textarea
                          className="field"
                          value={draftAngle}
                          onChange={(e) => setDraftAngle(e.target.value)}
                          rows={2}
                          style={{ resize: "vertical" }}
                        />
                        <div className="im" style={{ marginTop: 10 }}>
                          <button className="btn sm pri" onClick={() => saveEdit(i)}><IconCheck /> Save</button>
                          <button className="btn sm ghost" onClick={() => setEditIdx(null)}><IconX /> Cancel</button>
                        </div>
                      </ItemContent>
                    ) : (
                      <ItemContent>
                        <ItemTitle className="text-[15.5px] font-bold text-[var(--text-strong)]">{idea.title}</ItemTitle>
                        <ItemDescription className="text-[13.5px] text-[var(--text-body)]">{idea.angle}</ItemDescription>
                        <div className="im">
                          <Badge variant={idea.source_type === "pain" ? "default" : "success"}>{idea.source}</Badge>
                          <Badge variant="secondary">{idea.tag}</Badge>
                        </div>
                      </ItemContent>
                    )}
                    {editIdx !== i && (
                      <ItemActions>
                        <button className="btn sm ghost" title="Edit idea" onClick={() => startEdit(i, idea)}>
                          <IconEdit />
                        </button>
                        <button className="btn sm ghost" onClick={() => router.push(`/create?topic=${encodeURIComponent(idea.title)}`)}>
                          Write →
                        </button>
                      </ItemActions>
                    )}
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
              <input
                className="field"
                style={{ flex: 1, minWidth: 220 }}
                placeholder="Analyze a topic — e.g. codex, cold email, RAG…"
                value={dq}
                onChange={(e) => setDq(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runDiscover()}
              />
              <button className="btn pri" onClick={runDiscover} disabled={dBusy || !dq.trim()}>
                {dBusy ? <span className="spinner" /> : null} Analyze
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {["Your company context", "12 hook types", "13 frameworks", "Algorithm rules"].map((f) => (
                <span key={f} className="chip">{f}</span>
              ))}
            </div>
          </div>

          {dErr && (
            <div className="card" style={{ padding: 16, marginBottom: 14, color: "var(--amber)" }}>{dErr}</div>
          )}

          {dBusy && (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <LoadingMessage messages={["Analyzing what wins for this topic…", ...IDEAS_MESSAGES]} />
            </div>
          )}

          {!dBusy && discover && (
            <>
              {/* Trend read + topic maturity */}
              <div className="card" style={{ padding: 20, marginBottom: 14, borderLeft: "3px solid var(--accent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
                  <div className="eyebrow" style={{ margin: 0 }}>Trend</div>
                  <Badge variant={MATURITY_TONE[discover.maturity]}>{discover.maturity}</Badge>
                  <Badge variant="secondary">AI analysis · LinkedIn frameworks</Badge>
                </div>
                <h4 style={{ margin: "0 0 8px" }}>{discover.trend}</h4>
                <div style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.6 }}>{discover.summary}</div>
              </div>

              {/* What's winning by format — real algorithm multipliers */}
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div className="eyebrow muted" style={{ marginBottom: 6 }}>What&apos;s winning by format</div>
                {discover.formats.map((f) => (
                  <div key={f.label} style={{ display: "flex", alignItems: "baseline", gap: 11, padding: "9px 0", borderTop: "1px solid var(--line)", fontSize: 13.5, flexWrap: "wrap" }}>
                    <span style={{ width: 150, flex: "none", fontWeight: 600, color: "var(--text-strong)" }}>{f.label}</span>
                    <Badge variant={STRENGTH_TONE[f.strength]}>{f.strength}</Badge>
                    <span style={{ flex: "none", fontVariantNumeric: "tabular-nums", fontWeight: 700, color: "var(--accent-ink)" }}>{f.multiplier}</span>
                    <span style={{ flex: 1, minWidth: 120, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{f.note}</span>
                  </div>
                ))}
              </div>

              {/* The winning structure — recommended framework */}
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                  <div className="eyebrow muted" style={{ margin: 0 }}>The winning structure</div>
                  <Badge variant="default">{discover.winning_structure.framework}</Badge>
                </div>
                <div style={{ fontSize: 14, color: "var(--text-body)", lineHeight: 1.6, marginBottom: 8 }}>{discover.winning_structure.rhythm}</div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{discover.winning_structure.length}</div>
              </div>

              {/* Hook angles that fit + what to avoid */}
              <div className="grid2" style={{ marginBottom: 14 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div className="eyebrow muted" style={{ marginBottom: 10 }}>Hook angles that fit</div>
                  {discover.hooks.map((h, i) => (
                    <div key={i} style={{ padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span style={{ color: "var(--green)", fontWeight: 700, flex: "none" }}>↑</span>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.45 }}>{h.text}</span>
                        <Badge variant="secondary">{h.type.replace(/_/g, " ")}</Badge>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, paddingLeft: 17, lineHeight: 1.45 }}>{h.why}</div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <div className="eyebrow muted" style={{ marginBottom: 10 }}>Saturated / kills reach — avoid</div>
                  {discover.avoid.map((a, i) => (
                    <div key={i} style={{ padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                        <span style={{ color: "var(--text-muted)", fontWeight: 700, flex: "none" }}>✕</span>
                        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.45 }}>{a.what}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, paddingLeft: 17, lineHeight: 1.45 }}>{a.why}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Algorithm cheat-sheet — grounded in the real rules */}
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Algorithm cheat-sheet</div>
                <div className="grid3" style={{ gap: 14 }}>
                  {[
                    { k: "Best time", v: discover.algorithm.best_time },
                    { k: "Cadence", v: discover.algorithm.cadence },
                    { k: "CTA", v: discover.algorithm.cta },
                  ].map((it) => (
                    <div key={it.k}>
                      <div className="label" style={{ marginBottom: 4 }}>{it.k}</div>
                      <div style={{ fontSize: 13, color: "var(--text-body)", lineHeight: 1.5 }}>{it.v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ideas grounded in the analysis + the company/author context */}
              <div className="label" style={{ marginBottom: 6 }}>Ideas grounded in this analysis</div>
              <div className="card" style={{ padding: "6px 24px" }}>
                <AnimatedGroup as="div" className="divide-y divide-[var(--line)]">
                  {discover.ideas.map((idea, i) => (
                    <Item key={i} className="gap-[15px] rounded-none px-0 py-[18px]">
                      <ItemMedia className="iic">{ICONS[i % ICONS.length]}</ItemMedia>
                      <ItemContent>
                        <ItemTitle className="text-[15.5px] font-bold text-[var(--text-strong)]">{idea.title}</ItemTitle>
                        <ItemDescription className="text-[13.5px] text-[var(--text-body)]">{idea.angle}</ItemDescription>
                        <div className="im">
                          <Badge variant="success">{idea.pillar}</Badge>
                          <Badge variant="default">{idea.format}</Badge>
                          <Badge variant="secondary">{idea.hook_type.replace(/_/g, " ")}</Badge>
                        </div>
                      </ItemContent>
                      <ItemActions>
                        <button className="btn sm ghost" onClick={() => router.push(`/create?topic=${encodeURIComponent(idea.title)}`)}>Write →</button>
                      </ItemActions>
                    </Item>
                  ))}
                </AnimatedGroup>
              </div>
            </>
          )}

          {!dBusy && !discover && (
            <Empty style={{ padding: 48 }}>
              <EmptyHeader>
                <EmptyTitle style={{ fontSize: 17, color: "var(--text-strong)" }}>Discover what&apos;s trending</EmptyTitle>
                <EmptyDescription style={{ maxWidth: 460 }}>
                  Type any topic above and Penkala analyzes what&apos;s actually winning for it on LinkedIn, using proven hook, format, and algorithm frameworks plus your company context, then turns the patterns into ideas in your voice.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      )}

      {/* ---------- REPURPOSE ---------- */}
      {mode === "repurpose" && (
        <div className="fade">
          <div className="card" style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input
                className="field"
                style={{ flex: 1, minWidth: 220 }}
                placeholder="Paste a blog post, podcast, YouTube, or webinar URL…"
                value={rq}
                onChange={(e) => setRq(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runRepurpose()}
              />
              <button className="btn pri" onClick={runRepurpose} disabled={rBusy || !rq.trim()}>
                {rBusy ? <span className="spinner" /> : null} Repurpose
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {["Blog post", "Podcast", "YouTube", "Webinar", "Past post"].map((f, i) => (
                <span key={f} className={`chip${i === 0 ? " dot" : ""}`} style={i === 0 ? { color: "var(--accent-ink)" } : undefined}>{f}</span>
              ))}
            </div>
          </div>

          {rBusy && (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <LoadingMessage messages={["Breaking this down…", ...IDEAS_MESSAGES]} />
            </div>
          )}

          {!rBusy && repurpose && (
            <>
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "var(--accent-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}><AnimatedNumber value={repurpose.ways} /></div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>ways to reuse it</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}><AnimatedNumber value={repurpose.pieces} /></div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>ready-to-write pieces</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "var(--text-strong)", lineHeight: 1 }}>{repurpose.weeks}</div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 6 }}>weeks of content</div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: "6px 24px", marginBottom: 14 }}>
                <div className="label" style={{ paddingTop: 14 }}>What&apos;s reusable</div>
                <AnimatedGroup as="div" className="divide-y divide-[var(--line)]">
                  {repurpose.atoms.map((a, i) => (
                    <Item key={i} className="gap-[12px] rounded-none px-0 py-[14px]">
                      <ItemContent>
                        <ItemTitle className="text-[14px] font-semibold text-[var(--text-strong)]">{a}</ItemTitle>
                      </ItemContent>
                      <ItemActions>
                        <button className="btn sm ghost" onClick={() => router.push(`/create?topic=${encodeURIComponent(a)}`)}>Write →</button>
                      </ItemActions>
                    </Item>
                  ))}
                </AnimatedGroup>
              </div>

              <div className="card" style={{ padding: "6px 24px" }}>
                <div className="label" style={{ paddingTop: 14 }}>Suggested assets</div>
                {repurpose.assets.map((asset, i) => (
                  <div key={i} className="im" style={{ justifyContent: "space-between", padding: "14px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{asset.title}</span>
                    <Badge variant="success">{asset.lift}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}

          {!rBusy && !repurpose && (
            <Empty style={{ padding: 48 }}>
              <EmptyHeader>
                <EmptyTitle style={{ fontSize: 17, color: "var(--text-strong)" }}>Turn one thing into many</EmptyTitle>
                <EmptyDescription style={{ maxWidth: 460 }}>
                  Drop in something you already made — a blog post, podcast, webinar, or an old top post. Penkala breaks it into reusable pieces and the highest-leverage ways to turn it into posts, in your voice.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      )}
    </div>
  );
}

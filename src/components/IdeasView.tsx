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

type DiscoverResult = {
  trend: string;
  lift: number;
  sampled: number;
  summary: string;
  winning: string;
  formats: { label: string; pct: number; note: string }[];
  hooks: string[];
  avoid: string[];
  ideas: Idea[];
};
type RepurposeResult = { ways: number; pieces: number; weeks: string; atoms: string[]; assets: { title: string; lift: string }[] };

// Deterministic-ish pseudo metric so each topic gets stable, believable numbers.
function topicSeed(t: string): number {
  let h = 0;
  for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0;
  return h;
}

// Mock "Discover" analysis for any topic — stands in for the live top-post study. Richer than a
// flat idea list: a trend read, what's actually winning by format, hook patterns, what's saturated,
// then ideas grounded in the analysis.
function mockDiscover(topic: string): DiscoverResult {
  const t = topic.replace(/\.$/, "").trim();
  const seed = topicSeed(t.toLowerCase());
  const lift = +(2.4 + (seed % 22) / 10).toFixed(1); // 2.4–4.5×
  const sampled = 180 + (seed % 9) * 40; // 180–500 posts "studied"
  const carousel = 70 + (seed % 22); // 70–91
  const contrarian = 60 + (seed % 28); // 60–87
  const story = 40 + (seed % 24);
  const teardown = 30 + (seed % 30);

  return {
    trend: `Contrarian, specific takes on “${t}” are outrunning generic explainers`,
    lift,
    sampled,
    summary: `Across ${sampled} high-reach posts on “${t}” in the last 30 days, the winners aren't the broad overviews — they're sharp, first-person takes that pick a side and back it with one concrete number or example.`,
    winning: `A 1-line opinionated hook, then a short story or a single hard number, then a takeaway. Under 130 words, no link in the body, posted Tue–Thu morning.`,
    formats: [
      { label: "How-to carousel", pct: carousel, note: "saves + dwell time" },
      { label: "Contrarian text", pct: contrarian, note: "comments engine" },
      { label: "Personal story", pct: story, note: "reach, fewer saves" },
      { label: "Tool/teardown", pct: teardown, note: "niche but loyal" },
    ],
    hooks: [
      `“Everyone’s wrong about ${t}. Here’s what actually moved the needle.”`,
      `“I changed my mind on ${t}. The reason is uncomfortable.”`,
      `“We tried ${t} for 90 days. The data wasn’t what we expected.”`,
    ],
    avoid: [
      `“What is ${t}?” explainers — saturated, near-zero saves`,
      "Listicles over 7 points — drop-off after the fold",
      "Hype with no number or example — read as AI filler",
    ],
    ideas: [
      { title: `The “${t}” advice everyone repeats is wrong`, angle: "Open against the consensus, then show the counter-example with a number.", source_type: "belief", source: "Trend", tag: "Contrarian" },
      { title: `What nobody tells you about ${t}`, angle: "Insider POV; one specific story from your own work, one lesson.", source_type: "belief", source: "Trend", tag: "Story" },
      { title: `We tried ${t} for 90 days — here's the data`, angle: "Measured, data-led; lead with the result, not the setup.", source_type: "belief", source: "Trend", tag: "Data" },
      { title: `A 5-step ${t} playbook (carousel)`, angle: "Turn it into a how-to carousel — the top-saving format for this topic.", source_type: "belief", source: "Trend", tag: "Carousel" },
      { title: `${t}, but make it human`, angle: "Short, punchy reframe; end on a one-line principle.", source_type: "belief", source: "Trend", tag: "Punchy" },
    ],
  };
}

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

  // Discover — analyze any topic (mock results, in-session).
  const [dq, setDq] = useState("");
  const [dBusy, setDBusy] = useState(false);
  const [discover, setDiscover] = useState<DiscoverResult | null>(null);
  function runDiscover() {
    if (!dq.trim() || dBusy) return;
    setDBusy(true);
    setDiscover(null);
    window.setTimeout(() => { setDiscover(mockDiscover(dq.trim())); setDBusy(false); }, 1100);
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
                placeholder="Analyze what's working for any topic…"
                value={dq}
                onChange={(e) => setDq(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runDiscover()}
              />
              <button className="btn pri" onClick={runDiscover} disabled={dBusy || !dq.trim()}>
                {dBusy ? <span className="spinner" /> : null} Analyze
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {["Last 30 days", "Min 200 likes", "5k+ followers", "All formats"].map((f) => (
                <span key={f} className="chip">{f}</span>
              ))}
            </div>
          </div>

          {dBusy && (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              <LoadingMessage messages={["Studying top posts…", ...IDEAS_MESSAGES]} />
            </div>
          )}

          {!dBusy && discover && (
            <>
              <div className="card" style={{ padding: 20, marginBottom: 14, borderLeft: "3px solid var(--accent)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div className="eyebrow" style={{ margin: 0 }}>Trend</div>
                  <Badge variant="secondary">{discover.sampled} posts studied · last 30 days</Badge>
                </div>
                <h4 style={{ margin: "6px 0 10px" }}>{discover.trend}</h4>
                <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "var(--accent-ink)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1, flex: "none" }}>
                    <AnimatedNumber value={discover.lift} decimals={1} suffix="× vs median" />
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--text-body)", maxWidth: 460, lineHeight: 1.55 }}>
                    {discover.summary}
                  </div>
                </div>
              </div>

              {/* What's winning — format breakdown + the winning structure */}
              <div className="card" style={{ padding: 20, marginBottom: 14 }}>
                <div className="eyebrow muted" style={{ marginBottom: 14 }}>What&apos;s winning by format</div>
                {discover.formats.map((f) => (
                  <div key={f.label} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10, fontSize: 13 }}>
                    <span style={{ width: 130, flex: "none", color: "var(--text-body)" }}>{f.label}</span>
                    <span style={{ flex: 1, height: 8, borderRadius: 999, background: "var(--line)", overflow: "hidden" }}>
                      <span style={{ display: "block", height: "100%", width: `${f.pct}%`, background: "var(--accent)", borderRadius: 999 }} />
                    </span>
                    <span style={{ width: 36, textAlign: "right", flex: "none", fontWeight: 700, fontSize: 12.5, color: "var(--text-strong)" }}>{f.pct}</span>
                    <span style={{ width: 116, flex: "none", fontSize: 11.5, color: "var(--text-muted)" }}>{f.note}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: "var(--accent-soft, #efeaff)", fontSize: 13.5, lineHeight: 1.55, color: "var(--accent-ink, #4b2fbf)" }}>
                  <b>The winning structure:</b> {discover.winning}
                </div>
              </div>

              {/* Hooks that work + what's saturated */}
              <div className="grid2" style={{ marginBottom: 14 }}>
                <div className="card" style={{ padding: 20 }}>
                  <div className="eyebrow muted" style={{ marginBottom: 10 }}>Hook patterns that work</div>
                  {discover.hooks.map((h, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, padding: "7px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)", color: "var(--text-body)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--green)", fontWeight: 700, flex: "none" }}>↑</span>{h}
                    </div>
                  ))}
                </div>
                <div className="card" style={{ padding: 20 }}>
                  <div className="eyebrow muted" style={{ marginBottom: 10 }}>Saturated — skip these</div>
                  {discover.avoid.map((a, i) => (
                    <div key={i} style={{ display: "flex", gap: 9, fontSize: 13.5, padding: "7px 0", borderTop: i === 0 ? "none" : "1px solid var(--line)", color: "var(--text-body)", lineHeight: 1.5 }}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 700, flex: "none" }}>✕</span>{a}
                    </div>
                  ))}
                </div>
              </div>

              <div className="label" style={{ marginBottom: 6 }}>Ideas grounded in this analysis</div>
              <div className="card" style={{ padding: "6px 24px" }}>
                <AnimatedGroup as="div" className="divide-y divide-[var(--line)]">
                  {discover.ideas.map((idea, i) => (
                    <Item key={i} className="gap-[15px] rounded-none px-0 py-[18px]">
                      <ItemMedia className="iic">{ICONS[i % ICONS.length]}</ItemMedia>
                      <ItemContent>
                        <ItemTitle className="text-[15.5px] font-bold text-[var(--text-strong)]">{idea.title}</ItemTitle>
                        <ItemDescription className="text-[13.5px] text-[var(--text-body)]">{idea.angle}</ItemDescription>
                        <div className="im"><Badge variant="secondary">{idea.tag}</Badge></div>
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
                  Type any topic above and Penkala studies the top-performing LinkedIn posts, tells you what&apos;s actually winning, and turns the patterns into ideas grounded in your context.
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

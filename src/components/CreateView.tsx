"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar } from "./Avatar";
import { MicButton } from "./MicButton";
import { useToast } from "./Toast";
import { IconSpark, IconCheck, IconRefresh, IconEdit, IconX, IconCopy } from "./Icons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { useRotatingMessage } from "@/lib/useRotatingMessage";
import { WRITING_MESSAGES, IMAGE_MESSAGES, CAROUSEL_MESSAGES } from "./LoadingMessage";

type Mem = { id: string; name: string; headline: string; profile_picture_url?: string | null };
export type Template = { id: string; src: string; category: string; family: string; label: string; score: number };

// Brand kit palette (electric-violet) — shown as swatches and baked into every visual prompt.
const BRAND_SWATCHES = ["#761FFF", "#5A0BCC", "#18181B", "#EBE6FF"];
type Why = { belief: string; hook: string; your_words: string; rhythm: string };
type GenResult = {
  post: { id: string; body: string; voice_match: number; topic: string };
  why: Why;
  antislop: { pass: boolean; violations: { rule: string; detail: string }[]; attempts: number };
  mocked?: boolean;
};

// Poll a background generation job until it finishes (done -> result, error -> throw).
async function pollJob<T>(jobId: string): Promise<T> {
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`/api/jobs/${jobId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "job failed");
    if (data.status === "done") return data.result as T;
    if (data.status === "error") throw new Error(data.error || "job failed");
  }
  throw new Error("timed out");
}

export function CreateView({ members, orgName, orgLogo, templates = [], starters }: { members: Mem[]; orgName: string; orgLogo?: string | null; templates?: Template[]; starters: string[] }) {
  const toast = useToast();
  const params = useSearchParams();
  const [authorId, setAuthorId] = useState(members[0]?.id ?? "");
  const [brief, setBrief] = useState("");
  const [phase, setPhase] = useState<"idle" | "result">("idle");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);
  const [showWhy, setShowWhy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftBody, setDraftBody] = useState("");
  const [err, setErr] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imgKind, setImgKind] = useState<"image" | "infographic" | null>(null);
  const [carousel, setCarousel] = useState<{ url: string; title: string; body: string; kind: string }[] | null>(null);
  const [carouselLoading, setCarouselLoading] = useState(false);
  // Brand / reference images fed into visual generation.
  const [useLogo, setUseLogo] = useState(true);
  const [useProfile, setUseProfile] = useState(true);
  const [refUrl, setRefUrl] = useState<string | null>(null);
  const [refBusy, setRefBusy] = useState(false);
  // Infographic template: the selected original infographic is sent as a structure reference.
  const [templateSrc, setTemplateSrc] = useState<string | null>(null);

  useEffect(() => {
    const t = params.get("topic");
    if (t) setBrief(t);
  }, [params]);

  const author = members.find((m) => m.id === authorId) ?? members[0];
  const generating = imgKind !== null || carouselLoading;
  const firstName = author?.name?.split(" ")[0] ?? "your";
  const genMsg = useRotatingMessage([`Writing in ${firstName}'s voice…`, ...WRITING_MESSAGES], loading);
  const visualMsg = useRotatingMessage(
    carouselLoading ? CAROUSEL_MESSAGES : IMAGE_MESSAGES,
    carouselLoading || imgKind !== null,
  );

  async function generate() {
    if (!brief.trim() || !author) return;
    setErr("");
    setPhase("result");
    setEditing(false);
    setShowWhy(false);
    setResult(null);
    setImage(null);
    setCarousel(null);
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: author.id, topic: brief, angle: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generation failed");
      const out = await pollJob<GenResult>(data.job_id);
      setResult(out);
      setDraftBody(out.post.body);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }

  async function patch(action: "approve" | "reject" | "edit", body?: string) {
    if (!result) return;
    const res = await fetch(`/api/posts/${result.post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, body }),
    });
    if (!res.ok) return toast("Something went wrong");
    if (action === "approve") toast("Approved — moved to Drafts");
    if (action === "reject") toast("Rejected — logged as a correction");
    if (action === "edit") toast("Saved — your edit trains your voice");
  }

  function saveEdit() {
    setEditing(false);
    if (result) setResult({ ...result, post: { ...result.post, body: draftBody } });
    patch("edit", draftBody);
  }

  function startOver() {
    setPhase("idle");
    setResult(null);
    setImage(null);
    setCarousel(null);
    setRefUrl(null);
    setTemplateSrc(null);
  }

  // Reference images sent with every visual generation (resolved server-side from the toggles).
  function visualBody(extra: Record<string, unknown>) {
    return JSON.stringify({ use_logo: useLogo, use_profile: useProfile, ref_url: refUrl, ...extra });
  }

  async function genCarousel() {
    if (!result || carouselLoading) return;
    setCarouselLoading(true);
    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: visualBody({ post_id: result.post.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "carousel failed");
      const out = await pollJob<{ slides: { url: string; title: string; body: string; kind: string }[] }>(data.job_id);
      setCarousel(out.slides.filter((s) => s.url));
      toast("Carousel added");
    } catch (e) {
      toast(e instanceof Error ? e.message : "carousel failed");
    } finally {
      setCarouselLoading(false);
    }
  }

  async function genImage(kind: "image" | "infographic", tplOverride?: string | null) {
    if (!result || imgKind) return;
    setImgKind(kind);
    try {
      // Infographics use the selected template (an original infographic) as a structure reference.
      // tplOverride lets a one-click "use this template" pass the src before state settles.
      const tpl = tplOverride ?? templateSrc;
      const ref = kind === "infographic" && tpl ? tpl : refUrl;
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: visualBody({ post_id: result.post.id, kind, ref_url: ref }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "image failed");
      const out = await pollJob<{ url: string; kind: string }>(data.job_id);
      setImage(out.url);
      toast(kind === "infographic" ? "Infographic added" : "Image added");
    } catch (e) {
      toast(e instanceof Error ? e.message : "image failed");
    } finally {
      setImgKind(null);
    }
  }

  async function pickRef(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRefBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      setRefUrl(data.url);
      toast("Reference image added");
    } catch (e) {
      toast(e instanceof Error ? e.message : "upload failed");
    } finally {
      setRefBusy(false);
    }
  }

  if (!author) {
    return <div className="pad narrow"><p>No members yet.</p></div>;
  }

  return (
    <div className="pad narrow">
      <div className="auth-row">
        <span className="al">Writing as</span>
        <SegmentedControl
          tone="surface"
          aria-label="Writing as"
          value={authorId}
          onValueChange={setAuthorId}
          options={members.map((m) => ({
            value: m.id,
            label: (
              <span className="inline-flex items-center gap-1.5">
                <Avatar name={m.name} src={m.profile_picture_url} /> {m.name.split(" ")[0]}
              </span>
            ),
          }))}
        />
      </div>

      {phase === "idle" && (
        <div className="fade">
          <h1 className="ch">What do you want to post about?</h1>
          <div className="composer">
            <textarea
              rows={2}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="A topic, a take, or a rough thought…"
            />
            <div className="composer-foot">
              <span className="hint">Penkala writes it in your voice, then catches the off-brand notes before you see it.</span>
              <MicButton value={brief} onChange={setBrief} />
              <button className="btn pri" onClick={() => generate()} disabled={!brief.trim()}>
                <IconSpark /> Write in my voice
              </button>
            </div>
          </div>
          {starters.length > 0 && (
            <div className="starters">
              <div className="sl">Starters from your beliefs</div>
              <div className="chips">
                {starters.map((s, i) => (
                  <button key={i} className="starter" onClick={() => setBrief(s)}>
                    {s.length > 48 ? s.slice(0, 48) + "…" : s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "result" && (
        <div className="fade">
          <div className="briefbar">
            <span className="bt">{brief}</span>
            <button className="btn ghost sm" onClick={startOver}>Start over</button>
          </div>

          {loading && (
            <div className="shim">
              <div className="slabel">
                <span className="wv">
                  {[0, 0.1, 0.2, 0.05].map((d, i) => (
                    <i key={i} style={{ animationDelay: `${d}s` }} />
                  ))}
                </span>{" "}
                <span key={genMsg} className="fade">{genMsg}</span>
              </div>
              <div className="row" style={{ width: "50%" }} />
              <div className="row" />
              <div className="row" style={{ width: "90%" }} />
              <div className="row" style={{ width: "68%" }} />
            </div>
          )}

          {err && <p style={{ color: "var(--coral-d)" }}>{err}</p>}

          {result && !loading && (
            <>
              <div className="postcard">
                <div className="ph">
                  <Avatar name={author.name} lg src={author.profile_picture_url} />
                  <div>
                    <div className="pn">{author.name}</div>
                    <div className="pr">{author.headline || orgName} · now</div>
                  </div>
                </div>
                {editing ? (
                  <textarea value={draftBody} onChange={(e) => setDraftBody(e.target.value)} />
                ) : (
                  <TextEffect as="div" className="pbody" per="word" preset="fade-in-blur">
                    {result.post.body}
                  </TextEffect>
                )}
                {image && !editing && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={image} alt="Generated visual" style={{ width: "100%", borderRadius: 14, marginTop: 14, border: "1px solid var(--line, #e5e5e5)" }} />
                )}
              </div>

              <Collapsible open={showWhy} onOpenChange={setShowWhy}>
                <div className="confidence">
                  {result.antislop.pass ? (
                    <Badge variant="success"><IconCheck /> No AI tells</Badge>
                  ) : (
                    <Badge variant="warning"><IconX /> {result.antislop.violations.length} AI tell(s) remain</Badge>
                  )}
                  <span className="cf-sep">·</span>
                  <span className="cf">
                    <b><AnimatedNumber value={result.post.voice_match} format={(n) => `${Math.round(n)}`} />%</b>
                    &nbsp;sounds like you
                  </span>
                  {result.mocked && (
                    <>
                      <span className="cf-sep">·</span>
                      <Badge variant="secondary">mock draft</Badge>
                    </>
                  )}
                  {result.antislop.attempts > 1 && (
                    <>
                      <span className="cf-sep">·</span>
                      <span style={{ color: "var(--ink3)", fontSize: 12 }}>
                        sanitizer regenerated {result.antislop.attempts - 1}×
                      </span>
                    </>
                  )}
                  <CollapsibleTrigger className="cf-why">why?</CollapsibleTrigger>
                </div>
                <CollapsibleContent>
                  <div className="whyp">
                    <div className="wr"><div className="wk">Belief</div><div className="wvv">{result.why.belief}</div></div>
                    <div className="wr"><div className="wk">Hook</div><div className="wvv">{result.why.hook}</div></div>
                    <div className="wr"><div className="wk">Your words</div><div className="wvv">{result.why.your_words}</div></div>
                    <div className="wr"><div className="wk">Rhythm</div><div className="wvv">{result.why.rhythm}</div></div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Primary actions */}
              <div className="actions">
                {editing ? (
                  <>
                    <button className="btn pri" onClick={saveEdit}><IconCheck /> Save edit</button>
                    <button className="btn ghost" onClick={() => { setEditing(false); setDraftBody(result.post.body); }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="btn pri" onClick={() => patch("approve")}><IconCheck /> Approve</button>
                    <button className="btn" onClick={() => generate()}><IconRefresh /> Regenerate</button>
                    <button className="btn ghost" onClick={() => { setEditing(true); setDraftBody(result.post.body); }}><IconEdit /> Edit</button>
                    <button className="btn ghost" onClick={() => { navigator.clipboard.writeText(result.post.body); toast("Copied to clipboard"); }}><IconCopy /> Copy</button>
                  </>
                )}
              </div>

              {/* Add a visual — one organized panel: type → brand kit → suggested templates */}
              {!editing && (
                <div style={{ marginTop: 16, border: "1px solid var(--line, #e5e5e5)", borderRadius: 16, padding: 16, background: "var(--surface, #fff)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ display: "inline-flex", color: "var(--accent-ink)" }}><IconSpark /></span>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "var(--text-strong)" }}>Add a visual</span>
                    {generating && (
                      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink3, #9b9ba3)" }}>
                        <span className="spinner" style={{ width: 12, height: 12 }} />
                        <span key={visualMsg} className="fade">{visualMsg}</span>
                      </span>
                    )}
                  </div>

                  {/* type — these generate on click */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <button className="btn" onClick={() => genImage("image")} disabled={generating}>
                      {imgKind === "image" ? <span className="spinner" /> : <IconSpark />} Image
                    </button>
                    <button className="btn" onClick={() => genImage("infographic")} disabled={generating}>
                      {imgKind === "infographic" ? <span className="spinner" /> : <IconSpark />} Infographic
                    </button>
                    <button className="btn" onClick={genCarousel} disabled={generating}>
                      {carouselLoading ? <span className="spinner" /> : <IconSpark />} Carousel
                    </button>
                  </div>

                  {/* brand kit — auto-extracted, applied to every visual */}
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line, #e5e5e5)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", fontSize: 11, color: "var(--ink3, #9b9ba3)" }}>Brand kit</span>
                      <span style={{ display: "inline-flex", gap: 4 }}>
                        {BRAND_SWATCHES.map((c) => (
                          <span key={c} title={c} style={{ width: 16, height: 16, borderRadius: 5, background: c, border: "1px solid rgba(0,0,0,.08)" }} />
                        ))}
                      </span>
                      {orgLogo && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={orgLogo} alt="Brand logo" style={{ height: 18, maxWidth: 70, objectFit: "contain" }} />
                      )}
                      <span style={{ fontSize: 11.5, color: "var(--ink3, #9b9ba3)" }}>auto-applied to every visual</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 10, fontSize: 13, color: "var(--ink2, #6b6b73)" }}>
                      {orgLogo && (
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={useLogo} onChange={(e) => setUseLogo(e.target.checked)} /> Include logo
                        </label>
                      )}
                      {author.profile_picture_url && (
                        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                          <input type="checkbox" checked={useProfile} onChange={(e) => setUseProfile(e.target.checked)} /> Profile picture
                        </label>
                      )}
                      <label className="btn ghost sm" style={{ cursor: "pointer" }}>
                        {refBusy ? <span className="spinner" /> : <IconSpark />} {refUrl ? "Replace reference" : "Add reference"}
                        <input type="file" accept="image/*" onChange={pickRef} disabled={refBusy} style={{ display: "none" }} />
                      </label>
                      {refUrl && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={refUrl} alt="" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 6, border: "1px solid var(--line, #e5e5e5)" }} />
                          <button className="cf-why" onClick={() => setRefUrl(null)}>remove</button>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* suggested templates — shown inline; click one to generate an infographic */}
                  {templates.length > 0 && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line, #e5e5e5)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", fontSize: 11, color: "var(--ink3, #9b9ba3)" }}>Suggested templates</span>
                        <span style={{ fontSize: 11.5, color: "var(--ink3, #9b9ba3)" }}>click one to generate an infographic in your brand kit</span>
                        {templateSrc && (
                          <button className="cf-why" style={{ marginLeft: "auto" }} onClick={() => setTemplateSrc(null)}>clear selection</button>
                        )}
                      </div>
                      <div data-lenis-prevent style={{ maxHeight: 320, overflowY: "auto", overscrollBehavior: "contain", paddingRight: 4 }}>
                        {Object.entries(
                          templates.reduce((acc, t) => { (acc[t.family] ??= []).push(t); return acc; }, {} as Record<string, Template[]>)
                        ).map(([family, items]) => (
                          <div key={family} style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: "var(--ink3, #9b9ba3)", marginBottom: 6 }}>{family}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
                              {items.map((t) => (
                                <button
                                  key={t.id}
                                  title={`${t.label} — click to generate`}
                                  disabled={generating}
                                  onClick={() => { setTemplateSrc(t.src); genImage("infographic", t.src); }}
                                  style={{ position: "relative", padding: 0, border: templateSrc === t.src ? "2px solid var(--accent)" : "1px solid var(--line, #e5e5e5)", borderRadius: 8, overflow: "hidden", cursor: generating ? "default" : "pointer", background: "none" }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={t.src} alt={t.label} style={{ width: "100%", height: 72, objectFit: "cover", display: "block" }} />
                                  <div style={{ fontSize: 10, padding: "3px 4px", color: "var(--ink2,#6b6b73)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {carousel && carousel.length > 0 && !editing && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3, #9b9ba3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
                    Carousel · {carousel.length} slides
                  </div>
                  <div data-lenis-prevent style={{ display: "flex", gap: 10, overflowX: "auto", overscrollBehavior: "contain", paddingBottom: 8 }}>
                    {carousel.map((s, i) => (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img key={i} src={s.url} alt={s.title} title={s.title} style={{ height: 320, borderRadius: 12, border: "1px solid var(--line, #e5e5e5)", flex: "none" }} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

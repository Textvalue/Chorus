"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar } from "./Avatar";
import { MicButton } from "./MicButton";
import { useToast } from "./Toast";
import { IconSpark, IconCheck, IconRefresh, IconEdit, IconX, IconCopy } from "./Icons";

type Mem = { id: string; name: string; headline: string; profile_picture_url?: string | null };
export type Template = { id: string; src: string; category: string; family: string; label: string; score: number };
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
  const [showTpl, setShowTpl] = useState(false);

  useEffect(() => {
    const t = params.get("topic");
    if (t) setBrief(t);
  }, [params]);

  const author = members.find((m) => m.id === authorId) ?? members[0];

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

  async function genImage(kind: "image" | "infographic") {
    if (!result || imgKind) return;
    setImgKind(kind);
    try {
      // Infographics use the selected template (an original infographic) as a structure reference.
      const ref = kind === "infographic" && templateSrc ? templateSrc : refUrl;
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
        <div className="seg">
          {members.map((m) => (
            <button key={m.id} className={m.id === authorId ? "on" : ""} onClick={() => setAuthorId(m.id)}>
              <Avatar name={m.name} src={m.profile_picture_url} /> {m.name.split(" ")[0]}
            </button>
          ))}
        </div>
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
              <span className="hint">Tutti writes it in your voice, then catches the off-brand notes before you see it.</span>
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
                Writing in {author.name.split(" ")[0]}&apos;s voice…
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
                  <div className="pbody">{result.post.body}</div>
                )}
                {image && !editing && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={image} alt="Generated visual" style={{ width: "100%", borderRadius: 14, marginTop: 14, border: "1px solid var(--line, #e5e5e5)" }} />
                )}
              </div>

              <div className="confidence">
                {result.antislop.pass ? (
                  <span className="cf ok"><IconCheck /> No AI tells</span>
                ) : (
                  <span className="cf warn"><IconX /> {result.antislop.violations.length} AI tell(s) remain</span>
                )}
                <span className="cf-sep">·</span>
                <span className="cf"><b>{result.post.voice_match}%</b>&nbsp;sounds like you</span>
                {result.mocked && (
                  <>
                    <span className="cf-sep">·</span>
                    <span className="chip" style={{ color: "var(--ink3)" }}>mock draft</span>
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
                <button className="cf-why" onClick={() => setShowWhy((v) => !v)}>why?</button>
              </div>

              {showWhy && (
                <div className="whyp fade">
                  <div className="wr"><div className="wk">Belief</div><div className="wvv">{result.why.belief}</div></div>
                  <div className="wr"><div className="wk">Hook</div><div className="wvv">{result.why.hook}</div></div>
                  <div className="wr"><div className="wk">Your words</div><div className="wvv">{result.why.your_words}</div></div>
                  <div className="wr"><div className="wk">Rhythm</div><div className="wvv">{result.why.rhythm}</div></div>
                </div>
              )}

              {!editing && (
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 14, fontSize: 13, color: "var(--ink2, #6b6b73)" }}>
                  <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", fontSize: 11, color: "var(--ink3, #9b9ba3)" }}>Visual refs</span>
                  {orgLogo && (
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input type="checkbox" checked={useLogo} onChange={(e) => setUseLogo(e.target.checked)} /> Logo
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
              )}

              {!editing && templates.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, fontSize: 13, color: "var(--ink2, #6b6b73)" }}>
                    <span style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", fontSize: 11, color: "var(--ink3, #9b9ba3)" }}>Infographic template</span>
                    <button className="btn ghost sm" onClick={() => setShowTpl((v) => !v)}>
                      {templateSrc ? "Change template" : "Choose template"}
                    </button>
                    {templateSrc && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={templateSrc} alt="" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 6, border: "2px solid var(--teal-600, #1F9D8A)" }} />
                        <span style={{ color: "var(--ink3,#9b9ba3)" }}>
                          {templates.find((t) => t.src === templateSrc)?.label} · reference for Infographic
                        </span>
                        <button className="cf-why" onClick={() => setTemplateSrc(null)}>clear</button>
                      </span>
                    )}
                  </div>

                  {showTpl && (
                    <div style={{ marginTop: 10, border: "1px solid var(--line, #e5e5e5)", borderRadius: 12, padding: 12, maxHeight: 340, overflowY: "auto" }}>
                      {Object.entries(
                        templates.reduce((acc, t) => { (acc[t.family] ??= []).push(t); return acc; }, {} as Record<string, Template[]>)
                      ).map(([family, items]) => (
                        <div key={family} style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink3, #9b9ba3)", marginBottom: 6 }}>{family}</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
                            {items.map((t) => (
                              <button
                                key={t.id}
                                title={`${t.label} · score ${t.score}`}
                                onClick={() => { setTemplateSrc(t.src); setShowTpl(false); }}
                                style={{ padding: 0, border: templateSrc === t.src ? "2px solid var(--teal-600, #1F9D8A)" : "1px solid var(--line, #e5e5e5)", borderRadius: 8, overflow: "hidden", cursor: "pointer", background: "none" }}
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
                  )}
                </div>
              )}

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
                    <button className="btn ghost" onClick={() => genImage("image")} disabled={imgKind !== null}>
                      {imgKind === "image" ? <span className="spinner" /> : <IconSpark />} Image
                    </button>
                    <button className="btn ghost" onClick={() => genImage("infographic")} disabled={imgKind !== null}>
                      {imgKind === "infographic" ? <span className="spinner" /> : <IconSpark />} Infographic
                    </button>
                    <button className="btn ghost" onClick={genCarousel} disabled={carouselLoading || imgKind !== null}>
                      {carouselLoading ? <span className="spinner" /> : <IconSpark />} Carousel
                    </button>
                    <button className="btn ghost" onClick={() => { setEditing(true); setDraftBody(result.post.body); }}><IconEdit /> Edit</button>
                    <button className="btn ghost" onClick={() => { navigator.clipboard.writeText(result.post.body); toast("Copied to clipboard"); }}><IconCopy /> Copy</button>
                  </>
                )}
              </div>
              {(imgKind || carouselLoading) && (
                <p style={{ fontSize: 12.5, color: "var(--ink3, #9b9ba3)", marginTop: 10 }}>
                  <span className="spinner" style={{ width: 12, height: 12, verticalAlign: "-2px", marginRight: 6 }} />
                  {carouselLoading ? "Building your 5-slide carousel… this takes a minute." : `Generating your ${imgKind}… this can take a minute.`}
                </p>
              )}

              {carousel && carousel.length > 0 && !editing && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink3, #9b9ba3)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>
                    Carousel · {carousel.length} slides
                  </div>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
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

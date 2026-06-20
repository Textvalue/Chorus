"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Avatar } from "./Avatar";
import { MicButton } from "./MicButton";
import { useToast } from "./Toast";
import { IconSpark, IconCheck, IconRefresh, IconEdit, IconX, IconCopy } from "./Icons";

type Mem = { id: string; name: string; headline: string };
type Why = { belief: string; hook: string; your_words: string; rhythm: string };
type GenResult = {
  post: { id: string; body: string; voice_match: number; topic: string };
  why: Why;
  antislop: { pass: boolean; violations: { rule: string; detail: string }[]; attempts: number };
  mocked?: boolean;
};

export function CreateView({ members, orgName, starters }: { members: Mem[]; orgName: string; starters: string[] }) {
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
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: author.id, topic: brief, angle: "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "generation failed");
      setResult(data);
      setDraftBody(data.post.body);
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
    if (action === "approve") toast("Approved — moved to Rehearsal");
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
  }

  async function genImage(kind: "image" | "infographic") {
    if (!result || imgKind) return;
    setImgKind(kind);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: result.post.id, kind }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "image failed");
      setImage(data.url);
      toast(kind === "infographic" ? "Infographic added" : "Image added");
    } catch (e) {
      toast(e instanceof Error ? e.message : "image failed");
    } finally {
      setImgKind(null);
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
              <Avatar name={m.name} /> {m.name.split(" ")[0]}
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
                  <Avatar name={author.name} lg />
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
                    <button className="btn ghost" onClick={() => { setEditing(true); setDraftBody(result.post.body); }}><IconEdit /> Edit</button>
                    <button className="btn ghost" onClick={() => { navigator.clipboard.writeText(result.post.body); toast("Copied to clipboard"); }}><IconCopy /> Copy</button>
                  </>
                )}
              </div>
              {imgKind && (
                <p style={{ fontSize: 12.5, color: "var(--ink3, #9b9ba3)", marginTop: 10 }}>
                  <span className="spinner" style={{ width: 12, height: 12, verticalAlign: "-2px", marginRight: 6 }} />
                  Generating your {imgKind}…
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "@/components/ds";
import type { OrgExtract } from "@/lib/schemas";
import type { MemberDraft } from "@/lib/mockOnboard";

type OrgDraft = OrgExtract & { website: string };

const STEPS = ["About you", "Brand DNA", "Audience", "Team", "Voice & tone"];

function Stepper({ step }: { step: number }) {
  return (
    <div className="ob-stepper">
      {STEPS.map((label, i) => {
        const state = i < step ? "done" : i === step ? "cur" : "";
        return (
          <div key={label} className={`ob-step ${state}`}>
            <span className="num">{i < step ? <Icon.check size={13} color="#fff" stroke={3} /> : i + 1}</span>
            <span className="lbl">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel, busy }: { onBack: () => void; onNext: () => void; nextLabel: string; busy?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
      <button className="btn" onClick={onBack} disabled={busy}>Back</button>
      <button className="btn pri" style={{ marginLeft: "auto" }} onClick={onNext} disabled={busy}>
        {busy ? <span className="spinner" /> : null} {nextLabel}
      </button>
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [processing, setProcessing] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [err, setErr] = useState("");
  const [org, setOrg] = useState<OrgDraft | null>(null);
  const [member, setMember] = useState<MemberDraft | null>(null);
  const [mocked, setMocked] = useState(false);
  const [team, setTeam] = useState(["", ""]);

  const updOrg = (patch: Partial<OrgDraft>) => setOrg((o) => (o ? { ...o, ...patch } : o));

  async function start() {
    if (!website.trim() || !linkedin.trim()) return;
    setErr("");
    setProcessing(true);
    try {
      const res = await fetch("/api/onboarding/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website, linkedin_url: linkedin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not tune");
      setOrg(data.org);
      setMember(data.member);
      setMocked(!!data.mocked);
      setStep(1);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "something went off-key");
    } finally {
      setProcessing(false);
    }
  }

  async function finish() {
    if (!org || !member) return;
    setFinishing(true);
    setErr("");
    try {
      const res = await fetch("/api/onboarding/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org, member, linkedin_url: linkedin }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "could not finish");
      router.push("/studio");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "could not finish");
      setFinishing(false);
    }
  }

  return (
    <div className="ob-shell">
      <div className="ob-brand">
        <Image src="/brand/spark.png" alt="" width={28} height={28} style={{ height: 28, width: "auto", mixBlendMode: "multiply" }} />
        <span className="wm" style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--navy)" }}>tutti</span>
      </div>

      <Stepper step={step} />

      <div className="ob-body">
        {/* Step 1 — About you (process website + linkedin together) */}
        {step === 0 && (
          <div className="fade">
            <div className="eyebrow" style={{ textAlign: "center", marginBottom: 8 }}>Onboarding · Tuning</div>
            <h2 style={{ textAlign: "center", fontSize: 28, margin: "0 0 6px" }}>Let&apos;s get you in tune.</h2>
            <p style={{ textAlign: "center", color: "var(--text-muted)", margin: "0 0 22px" }}>
              Two links and about a minute. We read your company and your voice at the same time.
            </p>
            <div className="card pad6">
              <label className="label">Company website</label>
              <input
                className="field"
                placeholder="acme.com"
                value={website}
                disabled={processing}
                onChange={(e) => setWebsite(e.target.value)}
                style={{ marginBottom: 16 }}
              />
              <label className="label">Your LinkedIn profile</label>
              <input
                className="field"
                placeholder="linkedin.com/in/you"
                value={linkedin}
                disabled={processing}
                onChange={(e) => setLinkedin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && website && linkedin && start()}
              />
              {err && <p style={{ color: "var(--amber-500)", fontSize: 13, marginTop: 12, marginBottom: 0 }}>{err}</p>}
              <button
                className="btn pri lg"
                style={{ width: "100%", marginTop: 18 }}
                onClick={start}
                disabled={processing || !website.trim() || !linkedin.trim()}
              >
                {processing ? (
                  <><span className="spinner" /> Reading your site and your posts…</>
                ) : (
                  <><Icon.sparkles size={16} color="#fff" /> Start tuning</>
                )}
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-muted)", marginTop: 16 }}>
              Off-key just means we haven&apos;t learned you yet.
            </p>
          </div>
        )}

        {/* Step 2 — Brand DNA */}
        {step === 1 && org && (
          <div className="fade">
            <div className="eyebrow" style={{ marginBottom: 6 }}>Step 2 · The Score</div>
            <h2 style={{ fontSize: 24, margin: "0 0 4px" }}>We researched {org.name}.</h2>
            <p style={{ color: "var(--text-muted)", margin: "0 0 18px" }}>Verify what&apos;s right. Edit anything — you own the score.</p>
            <div className="card pad6">
              <label className="label">Company</label>
              <input className="field" value={org.name} onChange={(e) => updOrg({ name: e.target.value })} style={{ marginBottom: 16 }} />
              <label className="label">Positioning</label>
              <textarea
                className="field"
                rows={3}
                value={org.positioning}
                onChange={(e) => updOrg({ positioning: e.target.value })}
                style={{ resize: "vertical", marginBottom: 16 }}
              />
              <label className="label">Brand voice rules</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {org.brand_dna.voice_rules.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "var(--text-body)", lineHeight: 1.4 }}>
                    <span style={{ flex: "none", marginTop: 2 }}><Icon.check size={15} color="var(--teal-600)" stroke={2.4} /></span>
                    {r}
                  </div>
                ))}
              </div>
            </div>
            {mocked && <p className="ob-mock-note">Using sample data — no API keys set. Edit freely.</p>}
            <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} nextLabel="Looks right" />
          </div>
        )}

        {/* Step 3 — Audience */}
        {step === 2 && org && (
          <div className="fade">
            <div className="eyebrow" style={{ marginBottom: 6 }}>Step 3 · Your crowd</div>
            <h2 style={{ fontSize: 24, margin: "0 0 4px" }}>Who you&apos;re playing to.</h2>
            <p style={{ color: "var(--text-muted)", margin: "0 0 18px" }}>Weighted personas tied to the weekly moments your pains hit a desk.</p>
            <div className="card pad6">
              <label className="label">Personas</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {org.icp.personas.map((p, i) => (
                  <span className="chip" key={i}>{p}</span>
                ))}
              </div>
              <label className="label">Validated pains</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {org.icp.pains.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ flex: "none", marginTop: 1 }}><Icon.check size={16} color="var(--green-600)" stroke={2.4} /></span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{p.pain}</div>
                      <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
                        <span className="badge blue" style={{ marginRight: 6 }}>{p.weekly_trigger}</span>
                        {p.severity}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} nextLabel="Continue" />
          </div>
        )}

        {/* Step 4 — Team */}
        {step === 3 && (
          <div className="fade">
            <div className="eyebrow" style={{ marginBottom: 6 }}>Step 4 · Team</div>
            <h2 style={{ fontSize: 24, margin: "0 0 4px" }}>Build your ensemble.</h2>
            <p style={{ color: "var(--text-muted)", margin: "0 0 18px" }}>One brand DNA, many distinct voices. Add teammates by email — or do it later.</p>
            <div className="card pad6">
              <label className="label">You&apos;re the first player. Invite a few more.</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {team.map((email, i) => (
                  <input
                    key={i}
                    className="field"
                    placeholder="teammate@company.com"
                    value={email}
                    onChange={(e) => setTeam((t) => t.map((v, j) => (j === i ? e.target.value : v)))}
                  />
                ))}
              </div>
              <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setTeam((t) => [...t, ""])}>
                <Icon.plus size={15} /> Add another
              </button>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "12px 0 0" }}>
                Each teammate adds only their LinkedIn URL when they join — near one-click.
              </p>
            </div>
            <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} nextLabel={team.some((e) => e.trim()) ? "Send invites" : "Skip for now"} />
          </div>
        )}

        {/* Step 5 — Voice & tone */}
        {step === 4 && member && (
          <div className="fade">
            <div className="eyebrow" style={{ marginBottom: 6 }}>Step 5 · Voice &amp; tone</div>
            <h2 style={{ fontSize: 24, margin: "0 0 4px" }}>{member.name.split(" ")[0]}&apos;s voice, captured.</h2>
            <p style={{ color: "var(--text-muted)", margin: "0 0 18px" }}>
              Grounded in {member.prose_samples.length} of your real posts — not a template.
            </p>
            <div className="card pad6" style={{ marginBottom: 14 }}>
              <label className="label">How you sound</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                {member.voice_dna.traits.map((t, i) => (
                  <span className="chip" key={i}>{t}</span>
                ))}
              </div>
              {member.voice_dna.signature_terms.length > 0 && (
                <div style={{ fontSize: 13, color: "var(--text-body)", marginTop: 13 }}>
                  <b style={{ color: "var(--text-strong)" }}>Signature:</b>{" "}
                  {member.voice_dna.signature_terms.slice(0, 4).map((s) => `"${s}"`).join(" · ")}
                </div>
              )}
            </div>
            <div className="card pad6">
              <label className="label">
                What you believe <span style={{ textTransform: "none", color: "var(--teal-600)" }}>· we guessed this — fix anything wrong later</span>
              </label>
              <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text-body)" }}>
                {member.expert_pov.beliefs.map((b, i) => (
                  <div key={i}>◆ {b}</div>
                ))}
              </div>
            </div>
            {err && <p style={{ color: "var(--amber-500)", fontSize: 13, marginTop: 12 }}>{err}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button className="btn" onClick={() => setStep(3)} disabled={finishing}>Back</button>
              <button className="btn pri" style={{ marginLeft: "auto" }} onClick={finish} disabled={finishing}>
                {finishing ? <span className="spinner" /> : <Icon.check size={16} color="#fff" />} Finish tuning
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

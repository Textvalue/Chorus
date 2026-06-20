"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Icon } from "@/components/ds";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

// Upload an image to /api/upload and hand back its URL. Used for the company logo and the
// member profile picture — both are reused later as reference images in visual generation.
function AssetUpload({ label, hint, value, onChange, round }: {
  label: string; hint?: string; value: string | null; onChange: (url: string) => void; round?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      onChange(data.url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "upload failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <label className="label">{label} <span style={{ textTransform: "none", color: "var(--text-muted)", fontWeight: 400 }}>· optional</span></label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {value ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={value} alt="" style={{ width: 56, height: 56, objectFit: "cover", borderRadius: round ? 999 : 10, border: "1px solid var(--line)" }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: round ? 999 : 10, background: "var(--surface-2, #f1f1f4)", display: "grid", placeItems: "center", color: "var(--text-muted)", fontSize: 11 }}>none</div>
        )}
        <label className="btn ghost sm" style={{ cursor: "pointer" }}>
          {busy ? <span className="spinner" /> : null} {value ? "Replace" : "Upload"}
          <input type="file" accept="image/*" onChange={pick} disabled={busy} style={{ display: "none" }} />
        </label>
      </div>
      {hint && !err && <p style={{ fontSize: 12.5, color: "var(--text-muted)", margin: "8px 0 0" }}>{hint}</p>}
      {err && <p style={{ color: "var(--amber-500)", fontSize: 12, marginTop: 6 }}>{err}</p>}
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

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
        body: JSON.stringify({ org, member, linkedin_url: linkedin, logo_url: logoUrl, profile_picture_url: profilePicUrl }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "could not finish");
      router.push("/create");
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

      {/* Electric-violet step progress — the single accent indicator. */}
      <div style={{ width: "100%", maxWidth: 560, margin: "0 auto 26px" }}>
        <Progress value={((step + 1) / STEPS.length) * 100} aria-label="Onboarding progress" />
      </div>

      <Stepper step={step} />

      <div className="ob-body">
        {/* Step 1 — About you (process website + linkedin together) */}
        {step === 0 && (
          <div className="fade">
            <div className="eyebrow" style={{ textAlign: "center", marginBottom: 8 }}>Onboarding · Tuning</div>
            <TextEffect as="h2" className="text-center text-[28px] m-0 mb-1.5" per="word" preset="fade-in-blur">
              Let&rsquo;s get you in tune.
            </TextEffect>
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
            <TextEffect as="h2" className="text-[24px] m-0 mb-1" per="word" preset="fade-in-blur">
              {`We researched ${org.name}.`}
            </TextEffect>
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
              <AnimatedGroup className="flex flex-col gap-2 mb-[18px]">
                {org.brand_dna.voice_rules.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, fontSize: 14, color: "var(--text-body)", lineHeight: 1.4 }}>
                    <span style={{ flex: "none", marginTop: 2 }}><Icon.check size={15} color="var(--green)" stroke={2.4} /></span>
                    {r}
                  </div>
                ))}
              </AnimatedGroup>
              <AssetUpload
                label="Company logo"
                hint="Used as a reference image so generated visuals stay on-brand."
                value={logoUrl}
                onChange={setLogoUrl}
              />
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
              <AnimatedGroup className="flex flex-wrap gap-2 mb-[18px]">
                {org.icp.personas.map((p, i) => (
                  <span className="chip" key={i} style={{ whiteSpace: "normal", maxWidth: "100%", textAlign: "left", lineHeight: 1.4, borderRadius: 12 }}>{p}</span>
                ))}
              </AnimatedGroup>
              <label className="label">Validated pains</label>
              <AnimatedGroup className="flex flex-col gap-3">
                {org.icp.pains.map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ flex: "none", marginTop: 1 }}><Icon.check size={16} color="var(--green)" stroke={2.4} /></span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{p.pain}</div>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap", marginTop: 3 }}>
                        <Badge variant={p.severity === "high" ? "warning" : p.severity === "medium" ? "secondary" : "outline"}>{p.severity}</Badge>
                        <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.4 }}>{p.weekly_trigger}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </AnimatedGroup>
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
            <div className="card pad6" style={{ border: "1px dashed var(--accent)" }}>
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
            <TextEffect as="h2" className="text-[24px] m-0 mb-1" per="word" preset="fade-in-blur">
              {`${member.name.split(" ")[0]}’s voice, captured.`}
            </TextEffect>
            <p style={{ color: "var(--text-muted)", margin: "0 0 18px" }}>
              Grounded in {member.prose_samples.length} of your real posts — not a template.
            </p>
            <div className="card pad6" style={{ marginBottom: 14 }}>
              <label className="label">How you sound</label>
              <AnimatedGroup className="flex flex-wrap gap-[7px]">
                {member.voice_dna.traits.map((t, i) => (
                  <span className="chip" key={i}>{t}</span>
                ))}
              </AnimatedGroup>
              {member.voice_dna.signature_terms.length > 0 && (
                <div style={{ fontSize: 13, color: "var(--text-body)", marginTop: 13 }}>
                  <b style={{ color: "var(--text-strong)" }}>Signature:</b>{" "}
                  {member.voice_dna.signature_terms.slice(0, 4).map((s) => `"${s}"`).join(" · ")}
                </div>
              )}
            </div>
            <div className="card pad6">
              <label className="label">
                What you believe <span style={{ textTransform: "none", color: "var(--text-muted)" }}>· we guessed this — fix anything wrong later</span>
              </label>
              <AnimatedGroup className="text-[13.5px] leading-[1.7] text-[var(--text-body)]">
                {member.expert_pov.beliefs.map((b, i) => (
                  <div key={i}>◆ {b}</div>
                ))}
              </AnimatedGroup>
            </div>
            <div className="card pad6" style={{ marginTop: 14 }}>
              <AssetUpload
                label="Profile picture"
                hint="Your headshot — used as a reference image when generating visuals for your posts."
                value={profilePicUrl}
                onChange={setProfilePicUrl}
                round
              />
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

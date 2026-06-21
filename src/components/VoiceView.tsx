"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./ds";
import { useToast } from "./Toast";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";

type Me = {
  name: string;
  traits: string[];
  signature: string[];
  avoid: string[];
  beliefs: string[];
  topics: string[];
  povStatus: string;
  sampleCount: number;
  memory: { text: string; src: string }[];
};
type Company = {
  positioning: string;
  personas: string[];
  pains: { pain: string; weekly_trigger: string; severity: string }[];
  antiPersonas: string[];
  voiceRules: string[];
  atoms: [string, string][];
  competitors: { name: string; note: string }[];
};

// Sample Brand DNA so the Company tab is populated even before it's filled in.
const MOCK_COMPANY: Company = {
  positioning: "We help B2B teams turn each person's real voice into on-brand LinkedIn content — one brand DNA, many human voices. Not another scheduler; a voice engine.",
  personas: ["VP Marketing", "Head of Content", "Founder / CEO", "Demand-gen lead"],
  pains: [
    { pain: "Employee advocacy makes everyone sound identical", weekly_trigger: "Monday content push", severity: "high" },
    { pain: "Reach looks fine but pipeline doesn't move", weekly_trigger: "QBR / board prep", severity: "high" },
    { pain: "Reps won't post — the drafts don't sound like them", weekly_trigger: "Weekly 1:1s", severity: "medium" },
  ],
  antiPersonas: ["Solo creators", "Pure B2C brands"],
  voiceRules: ["Lead with a point of view, not a feature", "One hard number per post", "Short sentences — cut the throat-clearing", "No buzzwords, no “excited to share”"],
  atoms: [],
  competitors: [],
};

function withSampleData(c: Company): Company {
  return {
    positioning: c.positioning || MOCK_COMPANY.positioning,
    personas: c.personas?.length ? c.personas : MOCK_COMPANY.personas,
    pains: c.pains?.length ? c.pains : MOCK_COMPANY.pains,
    antiPersonas: c.antiPersonas?.length ? c.antiPersonas : MOCK_COMPANY.antiPersonas,
    voiceRules: c.voiceRules?.length ? c.voiceRules : MOCK_COMPANY.voiceRules,
    atoms: c.atoms ?? [],
    competitors: c.competitors ?? [],
  };
}

export function VoiceView({ me, company, isOwner }: { me: Me; company: Company; isOwner: boolean }) {
  const [tab, setTab] = useState<"me" | "company">("me");
  const toast = useToast();

  // Company / Brand DNA — populated with sample data and editable in-session.
  const [co, setCo] = useState<Company>(() => withSampleData(company));
  const [editingDNA, setEditingDNA] = useState(false);
  const [draftPos, setDraftPos] = useState("");
  const [draftPersonas, setDraftPersonas] = useState("");
  const [draftRules, setDraftRules] = useState("");

  function startEditDNA() {
    setDraftPos(co.positioning);
    setDraftPersonas(co.personas.join(", "));
    setDraftRules(co.voiceRules.join("\n"));
    setEditingDNA(true);
  }
  function saveDNA() {
    setCo({
      ...co,
      positioning: draftPos.trim() || co.positioning,
      personas: draftPersonas.split(",").map((s) => s.trim()).filter(Boolean),
      voiceRules: draftRules.split("\n").map((s) => s.trim()).filter(Boolean),
    });
    setEditingDNA(false);
    toast("Brand DNA updated");
  }

  return (
    <div className="pad">
      <div style={{ marginBottom: 24 }}>
        <SegmentedControl
          tone="accent"
          aria-label="Voice section"
          value={tab}
          onValueChange={(v) => setTab(v as "me" | "company")}
          options={[
            { value: "me", label: "My Voice" },
            { value: "company", label: "Company" },
          ]}
        />
      </div>

      {/* ---------- MY VOICE ---------- */}
      {tab === "me" && (
        <div className="fade">
          <div className="vhead">
            <h1>Your voice</h1>
            <p>Most tools copy how you write. Penkala also captured what you believe — and it keeps learning every time you post.</p>
          </div>

          <div className="grid2" style={{ marginBottom: 20 }}>
            <Card>
              <CardContent>
                <div className="eyebrow" style={{ marginBottom: 12 }}>How you sound</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                  {me.traits.length ? me.traits.map((t) => <Badge key={t} variant="secondary">{t}</Badge>) : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Not captured yet.</span>}
                </div>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {me.signature.length > 0 && <>Signature: {me.signature.map((s) => `“${s}”`).join(", ")}<br /></>}
                  {me.avoid.length > 0 && <>Never: {me.avoid.map((s) => `“${s}”`).join(", ")}</>}
                </div>
              </CardContent>
            </Card>
            <Card style={{ borderLeft: "3px solid var(--accent)" }}>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>What you believe</div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {me.beliefs.length ? me.beliefs.slice(0, 4).map((b, i) => (
                    <div key={i} style={{ fontSize: 14, color: "var(--text-body)", padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)", lineHeight: 1.45 }}>{b}</div>
                  )) : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Run the belief interview to capture your POV.</span>}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core memory */}
          <Card style={{ marginBottom: 20 }}>
            <CardContent>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--green-500)", boxShadow: "0 0 0 4px var(--green-50)", flex: "none" }} />
                <h4 style={{ margin: 0 }}>Core memory</h4>
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-muted)" }}>
                  <AnimatedNumber value={me.memory.length} /> things learned
                </span>
              </div>
              <p style={{ margin: "0 0 16px", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
                Every edit, approval, and &ldquo;not quite&rdquo; teaches Penkala. It lands in one governing memory that every future post reads from — so the tool sharpens the more you use it.
              </p>
              {me.memory.length ? me.memory.map((m, i) => (
                <Item key={i} className="px-0">
                  <ItemMedia variant="icon" style={{ color: "var(--text-muted)", alignSelf: "flex-start", marginTop: 1 }}>
                    <Icon.edit size={15} />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="line-clamp-none whitespace-normal" style={{ color: "var(--text-body)" }}>{m.text}</ItemTitle>
                    <ItemDescription>{m.src}</ItemDescription>
                  </ItemContent>
                </Item>
              )) : <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Approve and edit a few posts — your corrections will start showing up here.</p>}
            </CardContent>
          </Card>

          {/* Status boxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            <StatusBox icon={<Icon.mic size={17} />} title="Belief interview" meta={me.povStatus === "confirmed" ? "Captured · forward-looking POV" : "Inferred — confirm it in onboarding"} tone={me.povStatus === "confirmed" ? "green" : "neutral"} label={me.povStatus === "confirmed" ? "Complete" : "Inferred"} />
            <StatusBox icon={<Icon.edit size={17} />} title="Writing samples" meta={`${me.sampleCount} of your posts captured as voice anchors`} tone={me.sampleCount > 0 ? "green" : "neutral"} label={me.sampleCount > 0 ? "Complete" : "None yet"} />
            <StatusBox icon={<Icon.lock size={17} />} title="Voice visibility" meta="Private — only you use your voice for generation" tone="neutral" label="Private" />
          </div>

          <div style={{ marginTop: 22 }}>
            <Link href="/create" className="btn pri"><Icon.create size={16} /> Write a post</Link>
          </div>
        </div>
      )}

      {/* ---------- COMPANY / BRAND DNA ---------- */}
      {tab === "company" && (
        <div className="fade">
          <div className="vhead" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1>Team Brand DNA</h1>
              <p>The shared layer every teammate inherits — positioning, ICP, voice rules. Each person&apos;s voice sits on top.{isOwner ? " You can edit it." : " Admin only."}</p>
            </div>
            {isOwner && (
              editingDNA ? (
                <div className="im" style={{ flex: "none" }}>
                  <button className="btn pri" onClick={saveDNA}><Icon.check size={15} color="#fff" /> Save</button>
                  <button className="btn" onClick={() => setEditingDNA(false)}>Cancel</button>
                </div>
              ) : (
                <button className="btn" style={{ flex: "none" }} onClick={startEditDNA}><Icon.edit size={15} /> Edit Brand DNA</button>
              )
            )}
          </div>

          <Card style={{ marginBottom: 16 }}>
            <CardContent>
              <div className="eyebrow muted" style={{ marginBottom: 8 }}>Positioning</div>
              {editingDNA ? (
                <textarea className="field" rows={3} value={draftPos} onChange={(e) => setDraftPos(e.target.value)} style={{ resize: "vertical" }} />
              ) : (
                <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--text-body)" }}>{co.positioning}</p>
              )}
            </CardContent>
          </Card>

          <div className="grid2" style={{ marginBottom: 16 }}>
            <Card>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Ideal customer</div>
                {editingDNA ? (
                  <input className="field" value={draftPersonas} onChange={(e) => setDraftPersonas(e.target.value)} placeholder="Comma-separated personas" />
                ) : (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                      {co.personas.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                    </div>
                    {co.antiPersonas.length > 0 && (
                      <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}><b style={{ color: "var(--text-body)" }}>Not for:</b> {co.antiPersonas.join(", ")}</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Brand voice rules</div>
                {editingDNA ? (
                  <textarea className="field" rows={4} value={draftRules} onChange={(e) => setDraftRules(e.target.value)} placeholder="One rule per line" style={{ resize: "vertical" }} />
                ) : (
                  co.voiceRules.map((r) => (
                    <div key={r} style={{ display: "flex", gap: 9, fontSize: 13.5, padding: "5px 0", color: "var(--text-body)", lineHeight: 1.4 }}>
                      <Icon.check size={15} color="var(--green)" stroke={2.4} />{r}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {co.pains.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Validated pains</div>
                {co.pains.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 0",
                      borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)",
                    }}
                  >
                    {/* min-width:0 lets the title wrap normally instead of collapsing to one
                        word per line; the trigger is a wrapping muted line, not a nowrap pill,
                        so a long weekly_trigger can't blow out the row width. */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", lineHeight: 1.4 }}>
                        {p.pain}
                      </div>
                      {p.weekly_trigger && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 5,
                            fontSize: 12.5,
                            color: "var(--text-muted)",
                            lineHeight: 1.45,
                          }}
                        >
                          <Icon.clock size={13} />
                          <span style={{ minWidth: 0 }}>{p.weekly_trigger}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant={p.severity === "high" ? "warning" : "secondary"} className="flex-none">
                      {p.severity}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {co.atoms.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Narrative atoms</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  {co.atoms.map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "capitalize", color: "var(--text-muted)", marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.5 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {co.competitors.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Competitive landscape</div>
                {co.competitors.map((c, i) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "baseline", gap: 11, padding: "9px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)" }}>
                    <span style={{ flex: "none", fontSize: 14, fontWeight: 600, color: "var(--text-strong)", minWidth: 120 }}>{c.name}</span>
                    <span style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{c.note}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBox({ icon, title, meta, tone, label }: { icon: React.ReactNode; title: string; meta: string; tone: "green" | "neutral"; label: string }) {
  return (
    <Item variant="outline">
      <ItemMedia>
        <span style={{ width: 34, height: 34, flex: "none", borderRadius: 9, background: "var(--paper-2)", color: "var(--text-muted)", display: "grid", placeItems: "center" }}>{icon}</span>
      </ItemMedia>
      <ItemContent>
        <ItemTitle style={{ color: "var(--text-strong)" }}>{title}</ItemTitle>
        <ItemDescription>{meta}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Badge variant={tone === "green" ? "success" : "secondary"}>{label}</Badge>
      </ItemActions>
    </Item>
  );
}

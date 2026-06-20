"use client";
import { useState } from "react";
import Link from "next/link";
import { Icon } from "./ds";
import { useToast } from "./Toast";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions } from "@/components/ui/item";
import { Progress } from "@/components/ui/progress";
import { InView } from "@/components/motion-primitives/in-view";
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

const DemoTag = () => (
  <Badge variant="secondary" className="ml-2 align-middle">sample</Badge>
);

export function VoiceView({ me, postCount, company, isOwner }: { me: Me; postCount: number; company: Company; isOwner: boolean }) {
  const [tab, setTab] = useState<"me" | "winning" | "company">("me");
  const toast = useToast();

  return (
    <div className="pad">
      <div style={{ marginBottom: 24 }}>
        <SegmentedControl
          tone="accent"
          aria-label="Voice section"
          value={tab}
          onValueChange={(v) => setTab(v as "me" | "winning" | "company")}
          options={[
            { value: "me", label: "My Voice" },
            { value: "winning", label: "Winning content", icon: <Icon.trophy size={14} /> },
            { value: "company", label: "Company" },
          ]}
        />
      </div>

      {/* ---------- MY VOICE ---------- */}
      {tab === "me" && (
        <div className="fade">
          <div className="vhead">
            <h1>Your voice</h1>
            <p>Most tools copy how you write. Tutti also captured what you believe — and it keeps learning every time you post.</p>
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
                Every edit, approval, and &ldquo;not quite&rdquo; teaches Tutti. It lands in one governing memory that every future post reads from — so the tool sharpens the more you use it.
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

      {/* ---------- WINNING CONTENT ---------- */}
      {tab === "winning" && (
        <div className="fade">
          <div className="vhead">
            <h1>Your winning content <DemoTag /></h1>
            <p>Once enough of your posts have engagement data, Tutti reverse-engineers what works for <em>you</em> (TWE = likes + 2× comments + 4× shares) and feeds it back into every draft. Sample below — built from {postCount} posts.</p>
          </div>

          <Card style={{ marginBottom: 14, background: "var(--green-soft)", borderColor: "var(--green-100)" }}>
            <CardContent>
              <div className="eyebrow" style={{ color: "var(--green-700)", marginBottom: 8 }}>Your winning formula</div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--green-700)" }}>
                Write about <b>your category</b> as a <b>contrarian text post</b> or <b>how-to carousel</b>, opening with a <b>1-line bold claim</b>, in <b>90–140 words</b>. Post <b>Tue–Thu</b>. Design for <b>comments</b>, not just likes.
              </p>
            </CardContent>
          </Card>

          <Card style={{ marginBottom: 14 }}>
            <CardContent>
              <div className="eyebrow muted" style={{ marginBottom: 14 }}>Format — what wins for you</div>
              <InView>
                {([["Carousel", 88, "+34%"], ["Contrarian text", 80, "+28%"], ["Story", 52, "+6%"], ["Think-piece", 22, "−19%"]] as [string, number, string][]).map(([l, w, v]) => {
                  const neg = v.startsWith("−") || v.startsWith("-");
                  return (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 10, fontSize: 13 }}>
                      <span style={{ width: 110, flex: "none", color: "var(--text-body)" }}>{l}</span>
                      <Progress value={w} className={`flex-1 ${neg ? "[&_[data-slot=progress-indicator]]:bg-[var(--amber)]" : "[&_[data-slot=progress-indicator]]:bg-[var(--green)]"}`} />
                      <span style={{ width: 46, textAlign: "right", flex: "none", fontWeight: 700, fontSize: 12.5, color: "var(--text-strong)" }}>{v}</span>
                    </div>
                  );
                })}
              </InView>
            </CardContent>
          </Card>

          <div className="grid2" style={{ marginBottom: 14 }}>
            <Card>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 10 }}>Hooks that work</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, color: "var(--text-body)" }}>
                  <b>&ldquo;Everyone does X. We stopped.&rdquo;</b> — your top pattern.<br />
                  <b>&ldquo;The boring truth about Y&rdquo;</b> — 2.1× your median.<br />
                  <span style={{ color: "var(--text-muted)" }}>Underperforms: question openers.</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 10 }}>Stop doing</div>
                {["Burying the hook below the fold", "3+ hashtags — zero correlation", "Posting two days running"].map((t) => (
                  <div key={t} style={{ display: "flex", gap: 9, fontSize: 13, padding: "5px 0", color: "var(--text-body)" }}>
                    <span style={{ color: "var(--text-muted)", fontWeight: 700, flex: "none" }}>✕</span>{t}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Link href="/ideas" className="btn pri"><Icon.ideas size={16} /> Get ideas in your winning formats</Link>
        </div>
      )}

      {/* ---------- COMPANY / BRAND DNA ---------- */}
      {tab === "company" && (
        <div className="fade">
          <div className="vhead">
            <h1>Team Brand DNA</h1>
            <p>The shared layer every teammate inherits — positioning, ICP, voice rules. Each person&apos;s voice sits on top.{isOwner ? " You can edit it." : " Admin only."}</p>
          </div>

          <Card style={{ marginBottom: 16 }}>
            <CardContent>
              <div className="eyebrow muted" style={{ marginBottom: 8 }}>Positioning</div>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: "var(--text-body)" }}>{company.positioning || "Not set yet."}</p>
            </CardContent>
          </Card>

          <div className="grid2" style={{ marginBottom: 16 }}>
            <Card>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Ideal customer</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                  {company.personas.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                </div>
                {company.antiPersonas.length > 0 && (
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}><b style={{ color: "var(--text-body)" }}>Not for:</b> {company.antiPersonas.join(", ")}</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Brand voice rules</div>
                {company.voiceRules.map((r) => (
                  <div key={r} style={{ display: "flex", gap: 9, fontSize: 13.5, padding: "5px 0", color: "var(--text-body)", lineHeight: 1.4 }}>
                    <Icon.check size={15} color="var(--green)" stroke={2.4} />{r}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {company.pains.length > 0 && (
            <Card style={{ marginBottom: 16 }}>
              <CardContent>
                <div className="eyebrow muted" style={{ marginBottom: 12 }}>Validated pains</div>
                {company.pains.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderTop: i === 0 ? "none" : "1px solid var(--border-subtle)" }}>
                    <span style={{ flex: 1, fontSize: 14, color: "var(--text-strong)", fontWeight: 600 }}>{p.pain}</span>
                    <Badge variant="secondary">{p.weekly_trigger}</Badge>
                    <Badge variant={p.severity === "high" ? "warning" : "secondary"}>{p.severity}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {isOwner && (
            <button className="btn" onClick={() => toast("Editing Brand DNA — coming soon")}><Icon.edit size={15} /> Edit Brand DNA</button>
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

"use client";
import { useEffect } from "react";
import Link from "next/link";

/**
 * Tutti marketing landing page.
 * Aesthetic: editorial "concert program / sheet music" — warm ivory paper, ink, brass accent,
 * Instrument Serif display. The unforgettable device is the product thesis made visual:
 * UNISON (forty identical gray voices) vs HARMONY (distinct voices on one score).
 * Marketing psychology is woven through the copy (noted in comments per section).
 */

const VOICES = [
  { initials: "AJ", name: "Alex Johnson", role: "Conductor", color: "#1F7A6B", bars: [5, 11, 7, 14, 9, 13, 6] },
  { initials: "MP", name: "Maya Patel", role: "Violin", color: "#B47B2B", bars: [12, 6, 14, 8, 13, 5, 11] },
  { initials: "JL", name: "Jordan Lee", role: "Cello", color: "#BC5B3C", bars: [4, 9, 6, 12, 7, 10, 5] },
  { initials: "TK", name: "Taylor Kim", role: "Flute", color: "#715089", bars: [13, 7, 11, 6, 14, 8, 12] },
  { initials: "CB", name: "Casey Brown", role: "Timpani", color: "#4A7A52", bars: [6, 12, 8, 5, 11, 7, 13] },
];

function Wave({ bars, color, animate }: { bars: number[]; color: string; animate?: boolean }) {
  return (
    <span className="wave" aria-hidden>
      {bars.map((h, i) => (
        <i
          key={i}
          style={{
            height: h,
            background: color,
            animationDelay: `${i * 90}ms`,
            ...(animate ? {} : { animation: "none", opacity: 0.85 }),
          }}
        />
      ))}
    </span>
  );
}

export function Landing() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".tt [data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="tt">
      <style>{CSS}</style>

      {/* ---------------- NAV ---------------- */}
      <header className="nav">
        <div className="wrap nav-in">
          <a href="#top" className="brand">
            <span className="brand-mark" aria-hidden>
              <span className="bm-staff" />
              <span className="bm-note" />
            </span>
            <span className="brand-wm">tutti</span>
          </a>
          <nav className="nav-links">
            <a href="#problem">The problem</a>
            <a href="#how">How it works</a>
            <a href="#why">Why it&apos;s different</a>
            <a href="#harmony">In their voice</a>
          </nav>
          <div className="nav-cta">
            <Link href="/login" className="lnk">Sign in</Link>
            <Link href="/register" className="btn brass">Start free</Link>
          </div>
        </div>
      </header>

      {/* ---------------- HERO ---------------- */}
      {/* Psychology: Jobs-to-be-done outcome framing + zero-price + activation energy (60s). */}
      <section className="hero" id="top">
        <div className="staff-bg" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <div className="eyebrow rise" style={{ animationDelay: "60ms" }}>
              <span className="op">Op. 01</span> The team content OS
            </div>
            <h1 className="display rise" style={{ animationDelay: "140ms" }}>
              Your team,
              <br />
              finally <em>in&nbsp;tune.</em>
            </h1>
            <p className="lede rise" style={{ animationDelay: "240ms" }}>
              Tutti turns your strategy and each teammate&apos;s real voice into LinkedIn posts that
              actually sound like them. One brand DNA, many human voices — <strong>harmony, not the
              same corporate post pushed to everyone.</strong>
            </p>
            <div className="hero-actions rise" style={{ animationDelay: "340ms" }}>
              <Link href="/register" className="btn brass lg">Start your ensemble — free</Link>
              <a href="#harmony" className="btn ghost lg">See it play <span className="arr">→</span></a>
            </div>
            <p className="trust rise" style={{ animationDelay: "420ms" }}>
              <span className="tick">✓</span> Free during beta &nbsp;·&nbsp; no credit card &nbsp;·&nbsp;
              first voice tuned in ~60 seconds
            </p>
          </div>

          {/* Hero device — the "harmony" state: distinct, alive, in tune. */}
          <div className="hero-device rise" style={{ animationDelay: "300ms" }}>
            <div className="device-head">
              <span className="dh-label">Your ensemble</span>
              <span className="tuner">
                <span className="tuner-track"><span className="tuner-needle" /></span>
                <span className="tuner-val">in&nbsp;tune</span>
              </span>
            </div>
            <div className="roster">
              {VOICES.map((v, i) => (
                <div className="vrow" key={v.initials} style={{ animationDelay: `${600 + i * 110}ms` }}>
                  <span className="ava" style={{ background: v.color }}>{v.initials}</span>
                  <span className="vmeta">
                    <span className="vn">{v.name}</span>
                    <span className="vr">{v.role}</span>
                  </span>
                  <Wave bars={v.bars} color={v.color} animate />
                  <span className="vtick" style={{ color: v.color }}>✓</span>
                </div>
              ))}
            </div>
            <div className="device-foot">One score · five voices · zero AI tells</div>
          </div>
        </div>
      </section>

      {/* ---------------- MANIFESTO MARQUEE ---------------- */}
      {/* Psychology: Unity / identity ("for teams who refuse to sound like a robot"). */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>
              harmony, not unison <i>♪</i> your voice, kept <i>♪</i> what you believe, not how you sound
              <i>♪</i> humans, amplified <i>♪</i> no slop <i>♪</i> one score, every player <i>♪</i>
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- PROBLEM (UNISON) ---------------- */}
      {/* Psychology: Contrast effect + availability heuristic (vivid "40 cellos, one note") + the enemy. */}
      <section className="section problem" id="problem">
        <div className="wrap two">
          <div className="lead" data-reveal>
            <div className="eyebrow"><span className="op">I.</span> The problem</div>
            <h2 className="display sm">
              Employee advocacy plays in <em>unison.</em>
            </h2>
            <p className="body">
              One approved post, blasted from forty accounts. Forty cellos, one note. The algorithm
              reads sameness as spam — and so do humans. They scroll past the second copy before they
              finish the first.
            </p>
            <p className="body muted">
              The tools that promise &ldquo;employee advocacy&rdquo; hand everyone the same script. On-brand
              ends up meaning identical. That isn&apos;t reach. It&apos;s an echo.
            </p>
          </div>
          <div className="unison-card" data-reveal>
            <div className="uc-label">The same post · 40&times;</div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div className="urow" key={i}>
                <span className="ava gray">··</span>
                <span className="ulines">
                  <span style={{ width: "90%" }} />
                  <span style={{ width: "72%" }} />
                </span>
                <span className="uflat" />
              </div>
            ))}
            <div className="uc-foot">Flat. Generic. Forgettable.</div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS ---------------- */}
      {/* Psychology: Hick's Law (3 steps) + IKEA effect (you tune it) + goal-gradient. */}
      <section className="section how" id="how">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <div className="eyebrow"><span className="op">II.</span> How it works</div>
            <h2 className="display sm">Three movements to a team that sounds human.</h2>
          </div>
          <div className="steps">
            {[
              {
                n: "Tune",
                t: "Paste a LinkedIn URL",
                d: "Tutti listens to how each person actually writes — their rhythm, their words — and infers what they believe. Their voice, captured in a minute.",
              },
              {
                n: "Score",
                t: "Set the company strategy once",
                d: "Your ICP, your point of view, your brand DNA — the shared sheet every player reads from. Owned by the bandleader, played by everyone.",
              },
              {
                n: "Play",
                t: "Generate in their real voice",
                d: "Posts grounded in real samples and what the company stands for. The Sounds Flat gate rejects AI slop before you ever see a draft.",
              },
            ].map((s, i) => (
              <div className="step" key={s.n} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                <div className="step-num">{String(i + 1).padStart(2, "0")}</div>
                <div className="step-tempo">{s.n}</div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- WHY DIFFERENT (THE MOAT) ---------------- */}
      {/* Psychology: First-principles differentiation + authority. The defensible claim. */}
      <section className="section why" id="why">
        <div className="wrap why-grid">
          <div className="why-copy" data-reveal>
            <div className="eyebrow light"><span className="op">III.</span> Why it&apos;s different</div>
            <h2 className="display sm light">
              Most tools copy <em>how you sound.</em> Tutti learns <em>what you believe.</em>
            </h2>
            <p className="body on-dark">
              Scraping your old posts only mirrors your style — the commodity half. Tutti captures your
              point of view and your company&apos;s context, then gets sharper every time you edit a draft.
            </p>
            <p className="body on-dark muted">
              That correction loop is the part competitors can&apos;t copy. Every approve, every tweak,
              every rejected slop sentence teaches the model who you are.
            </p>
            <Link href="/register" className="btn brass">Tune your first voice</Link>
          </div>
          <div className="why-art" data-reveal aria-hidden>
            <div className="chord">
              <span>HOW you sound</span>
              <div className="chord-bar dim"><i style={{ width: "100%" }} /></div>
              <small>Commodity. Every tool can mirror it.</small>
              <span>WHAT you believe</span>
              <div className="chord-bar"><i style={{ width: "88%" }} /></div>
              <small>Your POV + company context. Defensible.</small>
              <span>+ The correction loop</span>
              <div className="chord-bar grow"><i style={{ width: "94%" }} /></div>
              <small>Compounds with every edit. Un-copyable.</small>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURES ---------------- */}
      <section className="section features">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <div className="eyebrow"><span className="op">IV.</span> The instrument</div>
            <h2 className="display sm">Everything a team needs to play in tune.</h2>
          </div>
          <div className="fgrid">
            {[
              ["Studio", "Your daily home — what to write, who's waiting, how in-tune the team sounds."],
              ["Create", "On-voice drafts grounded in real samples. The Sounds Flat gate quietly regenerates anything that reads like AI."],
              ["Ideas", "Theme & variations: angle cards pulled from your beliefs and the gaps your company can own."],
              ["Riff", "A 60-second note that both sharpens what you believe and spawns ready-to-write ideas."],
              ["Rehearsal", "The approval queue. Every edit is logged as a correction, so the next draft lands closer."],
              ["Ensemble", "Your whole team's voices on one score — distinct instruments, never unison."],
            ].map(([t, d], i) => (
              <div className="fcard" key={t} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <span className="fnote" aria-hidden>♪</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CONTROL / TRUST ---------------- */}
      {/* Psychology: Regret aversion + status-quo safety ("nothing posts itself, you stay in control"). */}
      <section className="section control">
        <div className="wrap control-in" data-reveal>
          <div className="staff-bg sm" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => <span key={i} />)}
          </div>
          <h2 className="display sm">Nothing posts itself.</h2>
          <p className="body">
            Tutti drafts — <em>you</em> conduct. Read it, tweak it, approve it, copy it out. No
            autopilot, no surprise posts in your name. The baton never leaves your hand.
          </p>
        </div>
      </section>

      {/* ---------------- IN THEIR VOICE (PROOF BY DEMONSTRATION) ---------------- */}
      {/* Psychology: Social proof via demonstration + contrast (one topic, two distinct voices). */}
      <section className="section harmony" id="harmony">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <div className="eyebrow"><span className="op">V.</span> In their voice</div>
            <h2 className="display sm">One topic. Two people. Two unmistakable posts.</h2>
            <p className="body muted center">The same brief — &ldquo;why pushing one post to everyone backfires.&rdquo; Same score, different instruments.</p>
          </div>
          <div className="proof">
            <article className="ppost" data-reveal>
              <header>
                <span className="ava" style={{ background: "#B47B2B" }}>MP</span>
                <span><b>Maya Patel</b><i>Punchy · contrarian</i></span>
                <span className="badge brass-b">Violin</span>
              </header>
              <p>
                Your employee advocacy program is making everyone sound the same.
                {"\n\n"}I watched a 40-person team post the identical paragraph last week. Forty cellos,
                one note. That isn&apos;t reach. It&apos;s an echo.
                {"\n\n"}Give people the score, not the script.
              </p>
              <footer><span className="tick">✓</span> 96% sounds like Maya · no AI tells</footer>
            </article>
            <article className="ppost" data-reveal style={{ transitionDelay: "100ms" }}>
              <header>
                <span className="ava" style={{ background: "#BC5B3C" }}>JL</span>
                <span><b>Jordan Lee</b><i>Measured · data-led</i></span>
                <span className="badge clay-b">Cello</span>
              </header>
              <p>
                We ran the math on a client&apos;s team. Same post, 30 shares, near-zero replies.
                {"\n\n"}The reach number looked great in the deck. The pipeline number didn&apos;t move.
                {"\n\n"}Distinct voices on one strategy beat identical voices every time. People reply to
                people.
              </p>
              <footer><span className="tick">✓</span> 94% sounds like Jordan · no AI tells</footer>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------- FINAL CTA ---------------- */}
      {/* Psychology: Peak-end + single clear action (paradox of choice) + brand-soul close. */}
      <section className="section cta">
        <div className="staff-bg" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => <span key={i} />)}
        </div>
        <div className="wrap cta-in" data-reveal>
          <div className="eyebrow light center"><span className="op">Coda</span></div>
          <h2 className="display cta-h">Get your team in tune.</h2>
          <Link href="/register" className="btn brass lg">Start your ensemble — free</Link>
          <p className="soul">&ldquo;Alone we can do so little. Together we make music.&rdquo;</p>
        </div>
      </section>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="foot">
        <div className="wrap foot-in">
          <a href="#top" className="brand">
            <span className="brand-mark" aria-hidden><span className="bm-staff" /><span className="bm-note" /></span>
            <span className="brand-wm">tutti</span>
          </a>
          <span className="foot-tag">The team content OS — harmony, not unison.</span>
          <div className="foot-links">
            <Link href="/login">Sign in</Link>
            <Link href="/register">Start free</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const CSS = `
.tt {
  --paper:#F6F1E6; --paper-2:#EFE7D6; --ink:#191A1F; --ink-2:#3B3B3C; --ink-soft:#6E6A60;
  --brass:#B07A2A; --brass-2:#946221; --teal:#1F7A6B; --line:#E0D6C2; --line-2:#D2C6AC;
  --serif:var(--lp-serif),Georgia,'Times New Roman',serif;
  --sans:var(--lp-sans),-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  font-family:var(--sans); color:var(--ink); background:var(--paper);
  -webkit-font-smoothing:antialiased; line-height:1.6; letter-spacing:-.005em;
  overflow-x:hidden;
}
.tt *{box-sizing:border-box; margin:0; padding:0;}
.tt a{color:inherit; text-decoration:none;}
.tt .wrap{max-width:1140px; margin:0 auto; padding:0 28px; width:100%;}

/* grain + warmth overlay */
.tt::before{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.5;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.035'/%3E%3C/svg%3E");
}
.tt > *{position:relative; z-index:1;}

/* ---- type ---- */
.tt .display{font-family:var(--serif); font-weight:400; letter-spacing:-.02em; line-height:1.02; color:var(--ink);}
.tt h1.display{font-size:clamp(46px,7.4vw,92px);}
.tt .display.sm{font-size:clamp(32px,4.6vw,54px); line-height:1.05;}
.tt .display em{font-style:italic; color:var(--brass);}
.tt .display.light, .tt .display.light em{color:var(--paper);}
.tt .display.light em{color:#E7B872;}
.tt .eyebrow{font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:.18em; color:var(--ink-soft); display:flex; align-items:center; gap:10px; margin-bottom:22px;}
.tt .eyebrow.center{justify-content:center;}
.tt .eyebrow.light{color:#C9Bfa8;}
.tt .op{font-family:var(--serif); font-style:italic; font-size:15px; letter-spacing:0; text-transform:none; color:var(--brass); border-right:1px solid var(--line-2); padding-right:10px;}
.tt .eyebrow.light .op{color:#E7B872; border-color:rgba(255,255,255,.18);}
.tt .body{font-size:18px; color:var(--ink-2); max-width:46ch;}
.tt .body.muted{color:var(--ink-soft); margin-top:14px; font-size:16.5px;}
.tt .body.center{margin-left:auto; margin-right:auto; text-align:center;}
.tt .body.on-dark{color:#D8D2C4; max-width:48ch;}
.tt .body em{font-family:var(--serif); font-style:italic; color:var(--brass);}
.tt strong{font-weight:600; color:var(--ink);}

/* ---- buttons ---- */
.tt .btn{display:inline-flex; align-items:center; gap:9px; font-weight:600; font-size:15px; padding:12px 22px; border-radius:999px; border:1px solid transparent; transition:transform .15s, background .2s, box-shadow .2s, color .2s; cursor:pointer; white-space:nowrap;}
.tt .btn.lg{font-size:16px; padding:15px 28px;}
.tt .btn.brass{background:var(--ink); color:var(--paper); box-shadow:0 1px 0 rgba(0,0,0,.04);}
.tt .btn.brass:hover{background:var(--brass-2); transform:translateY(-2px); box-shadow:0 10px 28px -10px rgba(176,122,42,.6);}
.tt .btn.ghost{background:transparent; color:var(--ink); border-color:var(--line-2);}
.tt .btn.ghost:hover{background:#fff; border-color:var(--ink); transform:translateY(-2px);}
.tt .btn .arr{transition:transform .2s;}
.tt .btn.ghost:hover .arr{transform:translateX(4px);}
.tt .lnk{font-weight:600; font-size:15px; color:var(--ink-2);}
.tt .lnk:hover{color:var(--ink);}

/* ---- nav ---- */
.tt .nav{position:sticky; top:0; z-index:50; backdrop-filter:saturate(1.2) blur(10px); background:rgba(246,241,230,.78); border-bottom:1px solid var(--line);}
.tt .nav-in{display:flex; align-items:center; justify-content:space-between; height:70px;}
.tt .brand{display:flex; align-items:center; gap:10px;}
.tt .brand-wm{font-family:var(--serif); font-size:26px; letter-spacing:-.01em;}
.tt .brand-mark{position:relative; width:30px; height:30px; display:grid; place-items:center;}
.tt .bm-staff{position:absolute; inset:50% 0 auto 0; height:9px; border-top:1px solid var(--ink); border-bottom:1px solid var(--ink); transform:translateY(-50%);}
.tt .bm-note{width:11px; height:11px; border-radius:50%; background:var(--brass); transform:translateX(4px) rotate(-18deg); box-shadow:6px -7px 0 -4px var(--ink);}
.tt .nav-links{display:flex; gap:30px; font-size:14.5px; color:var(--ink-2); font-weight:500;}
.tt .nav-links a{position:relative;}
.tt .nav-links a:hover{color:var(--ink);}
.tt .nav-links a::after{content:""; position:absolute; left:0; bottom:-5px; height:1.5px; width:0; background:var(--brass); transition:width .25s;}
.tt .nav-links a:hover::after{width:100%;}
.tt .nav-cta{display:flex; align-items:center; gap:18px;}

/* ---- staff lines bg ---- */
.tt .staff-bg{position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; gap:15px; pointer-events:none; opacity:.5;}
.tt .staff-bg span{height:1px; background:var(--line-2);}
.tt .staff-bg.sm{gap:11px; opacity:.7;}

/* ---- hero ---- */
.tt .hero{position:relative; padding:78px 0 70px; overflow:hidden;}
.tt .hero .staff-bg{opacity:.34;}
.tt .hero-grid{display:grid; grid-template-columns:1.06fr .94fr; gap:54px; align-items:center; position:relative;}
.tt .hero-copy{max-width:560px;}
.tt h1.display{margin:6px 0 22px;}
.tt .lede{font-size:19.5px; color:var(--ink-2); max-width:48ch; margin-bottom:30px;}
.tt .lede strong{color:var(--ink);}
.tt .hero-actions{display:flex; gap:13px; flex-wrap:wrap; margin-bottom:20px;}
.tt .trust{font-size:14px; color:var(--ink-soft);}
.tt .trust .tick{color:var(--teal); font-weight:700;}

/* hero device */
.tt .hero-device{background:#FffefB; border:1px solid var(--line-2); border-radius:22px; padding:18px; box-shadow:0 30px 70px -34px rgba(40,30,10,.4), 0 2px 0 rgba(255,255,255,.6) inset; transform:rotate(.6deg);}
.tt .device-head{display:flex; align-items:center; justify-content:space-between; padding:6px 8px 14px;}
.tt .dh-label{font-family:var(--serif); font-size:18px;}
.tt .tuner{display:flex; align-items:center; gap:9px;}
.tt .tuner-track{position:relative; width:74px; height:6px; border-radius:999px; background:linear-gradient(90deg,#E7C9A0,#CFE6D9,#E7C9A0);}
.tt .tuner-needle{position:absolute; top:-4px; width:3px; height:14px; border-radius:2px; background:var(--ink); left:8px; animation:tune 2.6s cubic-bezier(.5,0,.2,1) forwards;}
@keyframes tune{0%{left:8px}30%{left:60px}55%{left:20px}78%{left:42px}100%{left:50%}}
.tt .tuner-val{font-size:12px; font-weight:700; color:var(--teal); letter-spacing:.02em;}
.tt .roster{display:flex; flex-direction:column;}
.tt .vrow{display:flex; align-items:center; gap:12px; padding:11px 8px; border-top:1px solid var(--line); opacity:0; animation:rowin .55s cubic-bezier(.2,.7,.2,1) forwards;}
@keyframes rowin{from{opacity:0; transform:translateY(8px)}to{opacity:1; transform:none}}
.tt .ava{width:38px; height:38px; border-radius:50%; display:grid; place-items:center; color:#fff; font-size:12px; font-weight:700; flex:none; letter-spacing:.02em;}
.tt .ava.gray{background:#C9C2B2;}
.tt .vmeta{display:flex; flex-direction:column; flex:1; min-width:0;}
.tt .vn{font-weight:600; font-size:14.5px;}
.tt .vr{font-size:12px; color:var(--ink-soft);}
.tt .wave{display:inline-flex; align-items:center; gap:2.5px; height:18px;}
.tt .wave i{width:3px; border-radius:2px; display:inline-block; animation:bar 1.1s ease-in-out infinite alternate;}
@keyframes bar{from{transform:scaleY(.4)}to{transform:scaleY(1)}}
.tt .vtick{font-weight:800; font-size:15px;}
.tt .device-foot{margin-top:8px; padding-top:13px; border-top:1px solid var(--line); font-size:12.5px; color:var(--ink-soft); text-align:center; letter-spacing:.01em;}

/* reveal + load anims */
.tt .rise{opacity:0; animation:rise .7s cubic-bezier(.2,.7,.2,1) forwards;}
@keyframes rise{from{opacity:0; transform:translateY(16px)}to{opacity:1; transform:none}}
.tt [data-reveal]{opacity:0; transform:translateY(22px); transition:opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1);}
.tt [data-reveal].in{opacity:1; transform:none;}
@media (prefers-reduced-motion:reduce){
  .tt .rise,.tt [data-reveal]{opacity:1 !important; transform:none !important; animation:none !important;}
  .tt .vrow{opacity:1; animation:none;} .tt .wave i{animation:none;} .tt .tuner-needle{animation:none; left:50%;}
  .tt .marquee-track{animation:none;}
}

/* ---- marquee ---- */
.tt .marquee{border-top:1px solid var(--line); border-bottom:1px solid var(--line); background:var(--paper-2); overflow:hidden; padding:13px 0;}
.tt .marquee-track{display:flex; white-space:nowrap; gap:0; animation:slide 34s linear infinite; font-family:var(--serif); font-size:19px; color:var(--ink-2);}
.tt .marquee-track span{padding-right:0;}
.tt .marquee-track i{color:var(--brass); font-style:normal; padding:0 16px;}
@keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---- sections ---- */
.tt .section{padding:92px 0;}
.tt .two{display:grid; grid-template-columns:1.02fr .98fr; gap:56px; align-items:center;}
.tt .sec-head{max-width:760px; margin:0 auto 52px; text-align:center;}
.tt .sec-head .eyebrow{justify-content:center;}

/* problem */
.tt .problem{background:linear-gradient(180deg,var(--paper),var(--paper-2));}
.tt .unison-card{background:#EEE7D8; border:1px solid var(--line-2); border-radius:18px; padding:20px;}
.tt .uc-label{font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:.12em; color:var(--ink-soft); margin-bottom:14px;}
.tt .urow{display:flex; align-items:center; gap:13px; padding:11px 0; border-top:1px dashed var(--line-2);}
.tt .ulines{flex:1; display:flex; flex-direction:column; gap:7px;}
.tt .ulines span{height:7px; border-radius:4px; background:#CFC6B2; display:block;}
.tt .uflat{width:54px; height:1.5px; background:#B4A98F; flex:none;}
.tt .uc-foot{margin-top:13px; padding-top:13px; border-top:1px solid var(--line-2); text-align:center; font-family:var(--serif); font-style:italic; color:var(--ink-soft);}

/* how */
.tt .steps{display:grid; grid-template-columns:repeat(3,1fr); gap:26px;}
.tt .step{background:#fff; border:1px solid var(--line); border-radius:18px; padding:30px 26px; position:relative; box-shadow:0 1px 0 rgba(255,255,255,.7) inset;}
.tt .step-num{font-family:var(--serif); font-size:15px; color:var(--brass); position:absolute; top:22px; right:24px;}
.tt .step-tempo{font-family:var(--serif); font-style:italic; font-size:23px; color:var(--ink); margin-bottom:14px;}
.tt .step h3{font-size:19px; font-weight:600; margin-bottom:9px; letter-spacing:-.01em;}
.tt .step p{font-size:15px; color:var(--ink-soft); line-height:1.62;}

/* why (dark) */
.tt .why{background:var(--ink); border-radius:0;}
.tt .why-grid{display:grid; grid-template-columns:1.05fr .95fr; gap:54px; align-items:center;}
.tt .why-copy .btn{margin-top:28px;}
.tt .why-art{padding:6px;}
.tt .chord{background:#202127; border:1px solid #33343b; border-radius:20px; padding:30px;}
.tt .chord > span{display:block; font-size:12.5px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:#A9A493; margin:22px 0 9px;}
.tt .chord > span:first-child{margin-top:0;}
.tt .chord-bar{height:12px; border-radius:999px; background:#2c2d34; overflow:hidden;}
.tt .chord-bar i{display:block; height:100%; border-radius:999px; background:#4a4b54;}
.tt .chord-bar:not(.dim) i{background:linear-gradient(90deg,var(--brass),#E7B872);}
.tt .chord-bar.grow i{background:linear-gradient(90deg,var(--teal),#43b89f);}
.tt .chord small{display:block; margin-top:8px; font-size:13px; color:#86826f;}

/* features */
.tt .fgrid{display:grid; grid-template-columns:repeat(3,1fr); gap:20px;}
.tt .fcard{background:#fff; border:1px solid var(--line); border-radius:16px; padding:26px; transition:transform .2s, box-shadow .2s, border-color .2s;}
.tt .fcard:hover{transform:translateY(-4px); box-shadow:0 22px 44px -28px rgba(40,30,10,.45); border-color:var(--line-2);}
.tt .fnote{display:inline-grid; place-items:center; width:36px; height:36px; border-radius:10px; background:var(--paper-2); color:var(--brass); font-size:18px; margin-bottom:16px;}
.tt .fcard h3{font-family:var(--serif); font-size:23px; margin-bottom:8px;}
.tt .fcard p{font-size:15px; color:var(--ink-soft); line-height:1.6;}

/* control */
.tt .control{text-align:center;}
.tt .control-in{position:relative; max-width:720px; margin:0 auto; padding:60px 24px; text-align:center;}
.tt .control-in .body{max-width:50ch; margin:18px auto 0; text-align:center;}

/* harmony / proof */
.tt .proof{display:grid; grid-template-columns:1fr 1fr; gap:24px; max-width:940px; margin:0 auto;}
.tt .ppost{background:#fff; border:1px solid var(--line); border-radius:18px; padding:24px; box-shadow:0 18px 50px -34px rgba(40,30,10,.4);}
.tt .ppost header{display:flex; align-items:center; gap:11px; margin-bottom:16px;}
.tt .ppost header > span:nth-child(2){display:flex; flex-direction:column; flex:1;}
.tt .ppost header b{font-size:14.5px; font-weight:700;}
.tt .ppost header i{font-style:normal; font-size:12px; color:var(--ink-soft);}
.tt .badge{font-size:11px; font-weight:700; padding:4px 10px; border-radius:999px; letter-spacing:.02em;}
.tt .badge.brass-b{background:#F3E6Cf; color:var(--brass-2);}
.tt .badge.clay-b{background:#F2DED4; color:#A24827;}
.tt .ppost p{white-space:pre-line; font-size:15.5px; line-height:1.62; color:#2c2b29;}
.tt .ppost footer{margin-top:18px; padding-top:14px; border-top:1px solid var(--line); font-size:13px; color:var(--ink-soft);}
.tt .ppost footer .tick{color:var(--teal); font-weight:800;}

/* cta */
.tt .cta{position:relative; text-align:center; background:var(--ink); overflow:hidden; padding:104px 0;}
.tt .cta .staff-bg{opacity:.12;}
.tt .cta .staff-bg span{background:#6b6a63;}
.tt .cta-in{position:relative; max-width:760px; margin:0 auto; text-align:center;}
.tt .cta-h{font-size:clamp(40px,6vw,72px); color:var(--paper); margin:6px 0 30px;}
.tt .cta .soul{font-family:var(--serif); font-style:italic; font-size:19px; color:#B9B3A2; margin-top:28px;}

/* footer */
.tt .foot{background:var(--paper-2); border-top:1px solid var(--line); padding:34px 0;}
.tt .foot-in{display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap;}
.tt .foot-tag{font-size:14px; color:var(--ink-soft);}
.tt .foot-links{display:flex; gap:22px; font-size:14px; font-weight:600;}
.tt .foot-links a:hover{color:var(--brass);}

/* responsive */
@media (max-width:940px){
  .tt .hero-grid,.tt .two,.tt .why-grid{grid-template-columns:1fr; gap:40px;}
  .tt .hero-device{transform:none; max-width:460px;}
  .tt .steps,.tt .fgrid,.tt .proof{grid-template-columns:1fr;}
  .tt .nav-links{display:none;}
  .tt .section{padding:68px 0;}
  .tt .hero{padding:48px 0;}
}
@media (max-width:520px){
  .tt .nav-cta .lnk{display:none;}
  .tt .hero-actions{flex-direction:column; align-items:stretch;}
  .tt .hero-actions .btn{justify-content:center;}
}
`;

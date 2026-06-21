import { RefreshCw, Lightbulb, Pencil, Brain, Sparkles } from "lucide-react";

/* All animations are pure CSS (keyframes in globals.css). They settle to a
   readable static frame under prefers-reduced-motion via the global floor. */

const WAVE = [0.5, 0.85, 0.6, 1, 0.7, 0.45, 0.92, 0.6, 0.8, 0.5, 0.95, 0.65, 0.4];

/** Voice capture — an animated waveform (your voice, learned). */
export function VoiceWaveform() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-1.5 px-8" aria-hidden>
      {WAVE.map((h, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-violet"
          style={{
            height: `${Math.round(h * 72)}px`,
            animation: `pk-wave 1.5s ease-in-out ${(i * 0.09).toFixed(2)}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Repurpose — one good post cycles into a week of them. */
export function RepurposeLoop() {
  return (
    <div className="relative grid h-full w-full place-items-center" aria-hidden>
      <div
        className="relative grid h-28 w-28 place-items-center rounded-full"
        style={{ animation: "pk-spin-slow 9s linear infinite" }}
      >
        <span className="absolute inset-0 rounded-full border border-violet/30" />
        <span className="absolute inset-3 rounded-full border border-dashed border-violet/50" />
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full bg-violet"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 90}deg) translateX(56px)`,
              transformOrigin: "0 0",
            }}
          />
        ))}
      </div>
      <span
        className="absolute grid h-11 w-11 place-items-center rounded-xl border border-rule bg-paper text-violet"
        style={{ animation: "pk-orbit 9s linear infinite" }}
      >
        <RefreshCw size={18} />
      </span>
    </div>
  );
}

/** Ideas — angles surfacing from what you believe. */
export function IdeaPulse() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="grid h-12 w-12 place-items-center rounded-full bg-violet-soft text-violet-deep"
          style={{ animation: `pk-bulb 2.1s ease-in-out ${(i * 0.35).toFixed(2)}s infinite` }}
        >
          <Lightbulb size={20} />
        </span>
      ))}
    </div>
  );
}

const CHART = [0.55, 0.82, 0.64, 1, 0.74];

/** Branded visual — a generated post-visual mocked up in the brand kit. */
export function BrandVisualMock() {
  return (
    <div className="grid h-full w-full place-items-center p-6" aria-hidden>
      <div className="w-full max-w-[300px] rounded-xl border border-rule bg-paper p-4 shadow-[0_10px_34px_-14px_rgba(118,31,255,0.35)]">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-violet text-[0.72rem] font-bold text-white">
            P
          </span>
          <div className="flex-1 space-y-1.5">
            <span className="block h-2 w-3/4 rounded-full bg-linen" />
            <span className="block h-2 w-1/2 rounded-full bg-linen" />
          </div>
        </div>
        <div className="mt-4 flex h-20 items-end justify-between gap-2">
          {CHART.map((b, i) => (
            <span
              key={i}
              className="flex-1 rounded-t bg-violet"
              style={{
                height: `${Math.round(b * 100)}%`,
                transformOrigin: "bottom",
                animation: `pk-grow 2.6s ease-in-out ${(i * 0.16).toFixed(2)}s infinite`,
              }}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full" style={{ background: "var(--ev-600)" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "var(--ev-400)" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "var(--ev-200)" }} />
          <span className="ml-auto h-2 w-16 rounded-full bg-linen" />
        </div>
      </div>
    </div>
  );
}

/** The learning loop — edit, remember, sharper next draft, around a memory core. */
export function LearningLoopViz() {
  const nodes = [
    { icon: Pencil, label: "You edit" },
    { icon: Brain, label: "It remembers" },
    { icon: Sparkles, label: "Sharper draft" },
  ];
  return (
    <div className="relative grid h-full w-full place-items-center" aria-hidden>
      {/* rotating orbit ring */}
      <div
        className="absolute h-44 w-44 rounded-full border border-dashed border-violet/35"
        style={{ animation: "pk-spin-slow 14s linear infinite" }}
      >
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-violet" />
      </div>
      {/* memory core */}
      <span
        className="grid h-14 w-14 place-items-center rounded-2xl bg-violet text-white shadow-[0_6px_24px_-8px_rgba(118,31,255,0.6)]"
        style={{ animation: "pk-pulse 2.6s ease-in-out infinite" }}
      >
        <Brain size={22} />
      </span>
      {/* three labelled nodes */}
      {nodes.map((n, i) => (
        <span
          key={n.label}
          className="absolute flex items-center gap-1.5 rounded-full border border-rule bg-paper px-2.5 py-1 text-[0.72rem] font-medium text-ink-soft"
          style={{
            top: "50%",
            left: "50%",
            transform: `rotate(${i * 120 - 90}deg) translateX(96px) rotate(${-(i * 120 - 90)}deg)`,
            transformOrigin: "0 0",
          }}
        >
          <n.icon size={13} className="text-violet" />
          {n.label}
        </span>
      ))}
    </div>
  );
}

// Tutti design-system primitives (ported from /design-system/project/components).
// Pure, presentational, dependency-free — safe in server or client components.
import * as React from "react";

/* ------------------------------------------------------------------ icons */
type IP = { size?: number; className?: string; color?: string; stroke?: number };
const mk =
  (paths: string[], vb = 24) =>
  ({ size = 20, className, color = "currentColor", stroke = 1.8 }: IP = {}) => (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill="none"
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );

export const Icon = {
  studio: mk(["M3 12 12 3l9 9", "M5 10v10h14V10", "M9 20v-6h6v6"]),
  create: mk(["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"]),
  ideas: mk(["M9 18h6", "M10 21h4", "M12 3a6 6 0 0 1 4 10.5c-.7.7-1 1.2-1 2.5H9c0-1.3-.3-1.8-1-2.5A6 6 0 0 1 12 3Z"]),
  riff: mk(["M9 18V5l12-2v13", "M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z", "M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"]),
  notes: mk(["M4 6.5h16", "M4 12h16", "M4 17.5h10"]),
  rehearsal: mk(["M9 11l3 3L22 4", "M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"]),
  ensemble: mk(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]),
  audience: mk(["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.87"]),
  tune: mk(["M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3", "M1 14h6", "M9 8h6", "M17 16h6"]),
  score: mk(["M9 18V5l12-2v13", "M9 9l12-2", "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"]),
  campaign: mk(["M3 11l18-5v12L3 14v-3Z", "M11.6 16.8a3 3 0 1 1-5.8-1.6", "M21 9v4"]),
  live: mk(["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"]),
  engage: mk(["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"]),
  trophy: mk(["M6 9a6 6 0 0 0 12 0V3H6Z", "M6 5H3v2a3 3 0 0 0 3 3", "M18 5h3v2a3 3 0 0 1-3 3", "M9 21h6", "M12 15v6"]),
  waveform: mk(["M2 12h2", "M6 8v8", "M10 4v16", "M14 7v10", "M18 9v6", "M22 12h0"]),
  star: mk(["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"]),
  check: mk(["M20 6 9 17l-5-5"]),
  growth: mk(["M23 6l-9.5 9.5-5-5L1 18", "M17 6h6v6"]),
  sparkles: mk(["M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3Z", "M19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6L19 15Z"]),
  plus: mk(["M12 5v14", "M5 12h14"]),
  search: mk(["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "M21 21l-4.3-4.3"]),
  bell: mk(["M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.7 21a2 2 0 0 1-3.4 0"]),
  send: mk(["M22 2 11 13", "M22 2 15 22l-4-9-9-4 20-7Z"]),
  calendar: mk(["M3 4h18v18H3z", "M16 2v4", "M8 2v4", "M3 10h18"]),
  copy: mk(["M9 9h11v11H9z", "M5 15H4V4h11v1"]),
  chevronRight: mk(["M9 18l6-6-6-6"]),
  heart: mk(["M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"]),
  eye: mk(["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"]),
  edit: mk(["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"]),
  refresh: mk(["M3 12a9 9 0 0 1 15-6.7L21 8", "M21 3v5h-5", "M21 12a9 9 0 0 1-15 6.7L3 16", "M3 21v-5h5"]),
  x: mk(["M18 6 6 18", "M6 6l12 12"]),
  flat: mk(["M9 3v14", "M9 9c2-1.5 5-1 5 1.5S11 16 9 17"]),
  clock: mk(["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3 2"]),
  target: mk(["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M12 12h0"]),
  queue: mk(["M12 3 3 7.5 12 12l9-4.5L12 3Z", "M3 12.5 12 17l9-4.5", "M3 17 12 21.5 21 17"]),
  analytics: mk(["M5 21V11", "M12 21V4", "M19 21v-7"]),
  voice: mk(["M4 10v4", "M8 7v10", "M12 4v16", "M16 7v10", "M20 10v4"]),
  mic: mk(["M9 3h6v8a3 3 0 0 1-6 0Z", "M5 11a7 7 0 0 0 14 0", "M12 18v3"]),
  gear: mk(["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M19.4 13a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 7 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 3.5 14H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 7a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 10 2.6h.09A1.7 1.7 0 0 0 11.4 1H12a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 17 2.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 21.4 11H22a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"]),
  lock: mk(["M5 11h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z", "M8 11V7a4 4 0 0 1 8 0v4"]),
  logout: mk(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"]),
  userCircle: mk(["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M5.5 20a6.5 6.5 0 0 1 13 0"]),
};
export type IconName = keyof typeof Icon;

/* -------------------------------------------------------------- brandmark */
// Editorial monogram: an ink tile with a brass serif ampersand — reads as
// "together", no orchestra metaphor. Used in the sidebar, onboarding and auth.
export function Brandmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <span className={`bmk${size === "sm" ? " sm" : size === "lg" ? " lg" : ""}`} aria-hidden>
      <span>&amp;</span>
    </span>
  );
}

/* --------------------------------------------------------------- eyebrow */
export function Eyebrow({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return <div className={`eyebrow${muted ? " muted" : ""}`}>{children}</div>;
}

/* ----------------------------------------------------------------- badge */
type Tone = "neutral" | "blue" | "teal" | "green" | "amber" | "navy";
export function Badge({ children, tone = "neutral", style }: { children: React.ReactNode; tone?: Tone; style?: React.CSSProperties }) {
  return <span className={`badge ${tone}`} style={style}>{children}</span>;
}

/* ------------------------------------------------------------------ card */
export function Card({
  children,
  className = "",
  interactive,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`card pad6${interactive ? " lift" : ""} ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------- button */
type BtnVariant = "primary" | "accent" | "success" | "secondary" | "ghost";
const variantClass: Record<BtnVariant, string> = {
  primary: "pri",
  accent: "accent",
  success: "ok",
  secondary: "",
  ghost: "ghost",
};
export function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  className = "",
  ...rest
}: {
  children: React.ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  iconLeft?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `btn ${variantClass[variant]} ${size === "sm" ? "sm" : size === "lg" ? "lg" : ""} ${className}`.replace(/\s+/g, " ").trim();
  return (
    <button className={cls} {...rest}>
      {iconLeft}
      {children}
    </button>
  );
}

/* ---------------------------------------------------------------- avatar */
const AVA_PALETTE: [string, string][] = [
  ["var(--blue-100)", "var(--blue-700)"],
  ["var(--teal-100)", "var(--teal-700)"],
  ["var(--green-100)", "var(--green-700)"],
  ["var(--navy-700)", "#fff"],
];
export function brandInitials(name: string): string {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : p[0]?.[1] ?? "")).toUpperCase();
}
function brandTint(name: string): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVA_PALETTE[h % AVA_PALETTE.length];
}
export function Avatar({ name, size = 40, instrument }: { name: string; size?: number; instrument?: string | null }) {
  const [bg, fg] = brandTint(name);
  return (
    <span style={{ position: "relative", display: "inline-flex", flex: "none" }}>
      <span
        style={{
          width: size, height: size, borderRadius: 999, display: "inline-flex",
          alignItems: "center", justifyContent: "center", background: bg, color: fg,
          fontSize: size * 0.38, fontWeight: 700,
        }}
      >
        {brandInitials(name)}
      </span>
      {instrument && (
        <span
          title={instrument}
          style={{
            position: "absolute", bottom: -2, right: -2, width: size * 0.42, height: size * 0.42,
            borderRadius: 999, background: "var(--teal-500)", color: "#fff",
            border: "2px solid var(--surface-card)", display: "inline-flex",
            alignItems: "center", justifyContent: "center", fontSize: size * 0.22,
          }}
        >
          ♪
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ stat */
export function Stat({ value, label, delta, deltaTone = "green" }: { value: React.ReactNode; label: string; delta?: string; deltaTone?: "green" | "blue" | "slate" }) {
  const tone = { green: "var(--green-600)", blue: "var(--blue-600)", slate: "var(--slate-500)" }[deltaTone];
  return (
    <div className="stat">
      <div className="v">{value}</div>
      <div className="l">{label}</div>
      {delta && <div style={{ fontSize: 13, fontWeight: 600, color: tone, marginTop: 2 }}>{delta}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- tunering */
export function TuneScore({ value = 96, size = 132, caption = "In tune", label = "sounds like you" }: { value?: number; size?: number; caption?: string; label?: string }) {
  const stroke = Math.max(8, size * 0.075);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c * (1 - pct / 100);
  return (
    <div className="tunering" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-200)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--green-500)"
          strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset var(--dur-slow) var(--ease-out)" }}
        />
      </svg>
      <div className="tn">
        <span className="pct" style={{ fontSize: size * 0.26 }}>{pct}%</span>
        <span className="cap" style={{ fontSize: size * 0.1, marginTop: 4 }}>{caption}</span>
        <span className="lab" style={{ fontSize: size * 0.082 }}>{label}</span>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- bars */
export function Bar({ value, tone = "teal", height = 8, showLabel, style }: { value: number; tone?: "teal" | "green" | "blue"; height?: number; showLabel?: boolean; style?: React.CSSProperties }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, ...style }}>
      <div className="prog" style={{ flex: 1, height }}>
        <i className={tone} style={{ width: pct + "%" }} />
      </div>
      {showLabel && <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)", minWidth: 34, textAlign: "right" }}>{pct}%</span>}
    </div>
  );
}

export function ProgressMeter({ items }: { items: { label: string; value: number }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((it, i) => {
        const done = it.value >= 100;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                width: 20, height: 20, flex: "none", borderRadius: 999, display: "inline-flex",
                alignItems: "center", justifyContent: "center", background: done ? "var(--green-500)" : "var(--gray-200)",
              }}
            >
              {done && <Icon.check size={11} color="#fff" stroke={4} />}
            </span>
            <span style={{ width: 110, flex: "none", fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{it.label}</span>
            <Bar value={it.value} tone={done ? "green" : "teal"} style={{ flex: 1 }} />
            <span style={{ width: 42, textAlign: "right", fontSize: 14, fontWeight: 700, color: done ? "var(--green-600)" : "var(--text-body)" }}>{it.value}%</span>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------- topbar */
export function TopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-strong)" }}>{title}</h1>
        {subtitle && <p style={{ margin: "6px 0 0", color: "var(--text-muted)", fontSize: 15 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

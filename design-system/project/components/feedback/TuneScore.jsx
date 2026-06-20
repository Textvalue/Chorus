import React from 'react';

/**
 * The "sounds like you" confidence ring — the signature in-tune score.
 * Green arc = on key. Warm framing, never an error.
 */
export function TuneScore({ value = 96, size = 132, label = 'sounds like you', caption = 'In tune' }) {
  const stroke = Math.max(8, size * 0.075);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c * (1 - pct / 100);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-200)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--green-500)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset var(--dur-slow) var(--ease-out)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color: 'var(--text-strong)', lineHeight: 1, letterSpacing: '-0.02em' }}>{pct}%</span>
        <span style={{ fontSize: size * 0.10, fontWeight: 700, color: 'var(--green-600)', marginTop: 4 }}>{caption}</span>
        <span style={{ fontSize: size * 0.082, color: 'var(--text-muted)' }}>{label}</span>
      </div>
    </div>
  );
}

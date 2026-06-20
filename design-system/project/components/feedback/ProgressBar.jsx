import React from 'react';

/** Horizontal progress bar. Tone teal (musical) by default; green for "done". */
export function ProgressBar({ value = 0, tone = 'teal', height = 8, showLabel = false, style = {} }) {
  const pct = Math.max(0, Math.min(100, value));
  const fill = { teal: 'var(--teal-500)', green: 'var(--green-500)', blue: 'var(--blue-500)' }[tone];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, ...style }}>
      <div style={{ flex: 1, height, background: 'var(--gray-200)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: fill, borderRadius: 999, transition: 'width var(--dur-slow) var(--ease-out)' }} />
      </div>
      {showLabel && <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--text-strong)', minWidth: 34, textAlign: 'right' }}>{pct}%</span>}
    </div>
  );
}

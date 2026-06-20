import React from 'react';

/** A labeled metric. Big number + label, optional delta (green up / slate flat). */
export function Stat({ value, label, delta = null, deltaTone = 'green', align = 'left', style = {} }) {
  const tone = { green: 'var(--green-600)', blue: 'var(--blue-600)', slate: 'var(--slate-500)' }[deltaTone];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: align === 'center' ? 'center' : 'flex-start', ...style }}>
      <span style={{ fontSize: 'var(--fs-h2)', fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '-0.02em', lineHeight: 1.05 }}>{value}</span>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>{label}</span>
      {delta && (
        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: tone, marginTop: 2 }}>{delta}</span>
      )}
    </div>
  );
}

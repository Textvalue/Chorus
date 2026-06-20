import React from 'react';
import { ProgressBar } from './ProgressBar.jsx';

/**
 * Character-progression readout: rows of "dimension → % complete" with a
 * green check when done. Mirrors real maturity (Brand DNA, Voice Match, …).
 */
export function ProgressMeter({ items = [], style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, ...style }}>
      {items.map((it, i) => {
        const done = it.value >= 100;
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 20, height: 20, flex: 'none', borderRadius: 999,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'var(--green-500)' : 'var(--gray-200)',
            }}>
              {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
            </span>
            <span style={{ width: 110, flex: 'none', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{it.label}</span>
            <ProgressBar value={it.value} tone={done ? 'green' : 'teal'} style={{ flex: 1 }} />
            <span style={{ width: 42, textAlign: 'right', fontSize: 'var(--fs-sm)', fontWeight: 700, color: done ? 'var(--green-600)' : 'var(--text-body)' }}>{it.value}%</span>
          </div>
        );
      })}
    </div>
  );
}

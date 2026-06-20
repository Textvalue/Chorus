import React from 'react';

/** Vertical step list for Tuning / onboarding. Done = green check, current = blue ring. */
export function StepNav({ steps = [], current = 0, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: active ? 'var(--blue-50)' : 'transparent',
          }}>
            <span style={{
              width: 22, height: 22, flex: 'none', borderRadius: 999,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'var(--fs-xs)', fontWeight: 700,
              background: done ? 'var(--green-500)' : active ? 'var(--blue-500)' : 'var(--surface-card)',
              color: done || active ? '#fff' : 'var(--text-muted)',
              border: done || active ? 'none' : '1.5px solid var(--border-strong)',
            }}>
              {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg> : i + 1}
            </span>
            <span style={{
              fontSize: 'var(--fs-sm)', fontWeight: active ? 600 : 500,
              color: active ? 'var(--text-strong)' : done ? 'var(--text-body)' : 'var(--text-muted)',
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';

/** Checkbox with label. Checked = green (on-key / done). */
export function Checkbox({ checked = false, onChange, label, disabled = false, style = {} }) {
  const [on, setOn] = React.useState(checked);
  React.useEffect(() => setOn(checked), [checked]);
  const toggle = () => { if (disabled) return; const v = !on; setOn(v); onChange && onChange(v); };
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, ...style }}>
      <span
        onClick={toggle}
        style={{
          width: 20, height: 20, flex: 'none', borderRadius: 'var(--radius-xs)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: on ? 'var(--green-500)' : 'var(--surface-card)',
          border: `1.5px solid ${on ? 'var(--green-500)' : 'var(--border-strong)'}`,
          transition: 'all var(--dur-fast) var(--ease-standard)',
        }}
      >
        {on && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        )}
      </span>
      {label && <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-body)' }}>{label}</span>}
    </label>
  );
}

import React from 'react';

/** Toggle switch. On = teal (musical/active). */
export function Switch({ checked = false, onChange, disabled = false, label, style = {} }) {
  const [on, setOn] = React.useState(checked);
  React.useEffect(() => setOn(checked), [checked]);
  const toggle = () => { if (disabled) return; const v = !on; setOn(v); onChange && onChange(v); };
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.55 : 1, ...style }}>
      <span
        onClick={toggle}
        style={{
          width: 40, height: 24, borderRadius: 999, flex: 'none',
          background: on ? 'var(--teal-500)' : 'var(--gray-300)',
          position: 'relative', transition: 'background var(--dur-base) var(--ease-standard)',
        }}
      >
        <span style={{
          position: 'absolute', top: 2, left: on ? 18 : 2,
          width: 20, height: 20, borderRadius: 999, background: '#fff',
          boxShadow: 'var(--shadow-sm)', transition: 'left var(--dur-base) var(--ease-out)',
        }} />
      </span>
      {label && <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-body)' }}>{label}</span>}
    </label>
  );
}

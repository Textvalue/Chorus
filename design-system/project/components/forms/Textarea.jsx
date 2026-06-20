import React from 'react';

/** Multiline text area — for riffs, drafts, belief capture. */
export function Textarea({ label, hint, rows = 4, style = {}, id, ...rest }) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label htmlFor={inputId} style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>}
      <textarea
        id={inputId} rows={rows}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          padding: '12px 14px', resize: 'vertical',
          background: 'var(--surface-card)',
          border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border-strong)'}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: focus ? 'var(--ring)' : 'none',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', lineHeight: 1.55,
          color: 'var(--text-strong)', outline: 'none',
          transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        }}
        {...rest}
      />
      {hint && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{hint}</span>}
    </div>
  );
}

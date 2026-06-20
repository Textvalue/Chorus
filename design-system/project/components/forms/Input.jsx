import React from 'react';

/** Text input with optional label, hint and error. Friendly focus ring. */
export function Input({
  label, hint, error, prefix = null, type = 'text',
  size = 'md', style = {}, id, ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || React.useId();
  const h = { sm: 'var(--control-sm)', md: 'var(--control-md)', lg: 'var(--control-lg)' }[size];
  const borderColor = error ? 'var(--green-600)' : focus ? 'var(--border-focus)' : 'var(--border-strong)';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--text-strong)' }}>{label}</label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: h, padding: '0 14px',
        background: 'var(--surface-card)', border: `1px solid ${borderColor}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: focus ? 'var(--ring)' : 'none',
        transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
      }}>
        {prefix && <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>{prefix}</span>}
        <input
          id={inputId} type={type}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-strong)',
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <span style={{ fontSize: 'var(--fs-xs)', color: error ? 'var(--green-700)' : 'var(--text-muted)' }}>{error || hint}</span>
      )}
    </div>
  );
}

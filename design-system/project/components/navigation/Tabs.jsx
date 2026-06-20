import React from 'react';

/** Underline tabs. Active = navy text with a teal indicator. */
export function Tabs({ tabs = [], value, onChange, style = {} }) {
  const [active, setActive] = React.useState(value ?? (tabs[0] && tabs[0].id));
  React.useEffect(() => { if (value !== undefined) setActive(value); }, [value]);
  const select = (id) => { setActive(id); onChange && onChange(id); };
  return (
    <div role="tablist" style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', ...style }}>
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <button
            key={t.id} role="tab" aria-selected={on}
            onClick={() => select(t.id)}
            style={{
              position: 'relative', appearance: 'none', background: 'none', border: 'none',
              padding: '10px 14px 12px', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', fontWeight: 600,
              color: on ? 'var(--text-strong)' : 'var(--text-muted)',
              transition: 'color var(--dur-fast)',
            }}
          >
            {t.label}
            {t.count != null && (
              <span style={{ marginLeft: 6, fontSize: 'var(--fs-2xs)', fontWeight: 700, color: on ? 'var(--teal-600)' : 'var(--text-muted)', background: on ? 'var(--teal-50)' : 'var(--gray-100)', padding: '1px 6px', borderRadius: 999 }}>{t.count}</span>
            )}
            <span style={{
              position: 'absolute', left: 8, right: 8, bottom: -1, height: 2.5,
              borderRadius: 2, background: 'var(--teal-500)',
              opacity: on ? 1 : 0, transition: 'opacity var(--dur-fast)',
            }} />
          </button>
        );
      })}
    </div>
  );
}

import React from 'react';

/** Small status pill. Tones: neutral, blue, teal, green (in-tune), amber, navy. */
export function Badge({ children, tone = 'neutral', soft = true, style = {} }) {
  const tones = {
    neutral: { soft: ['var(--gray-100)', 'var(--slate-600)'], solid: ['var(--slate-500)', '#fff'] },
    blue: { soft: ['var(--blue-50)', 'var(--blue-700)'], solid: ['var(--blue-500)', '#fff'] },
    teal: { soft: ['var(--teal-50)', 'var(--teal-700)'], solid: ['var(--teal-500)', '#fff'] },
    green: { soft: ['var(--green-50)', 'var(--green-700)'], solid: ['var(--green-500)', '#fff'] },
    amber: { soft: ['#FCF3E0', 'var(--amber-500)'], solid: ['var(--amber-400)', 'var(--navy-900)'] },
    navy: { soft: ['var(--navy-900)', '#fff'], solid: ['var(--navy-900)', '#fff'] },
  }[tone];
  const [bg, fg] = soft ? tones.soft : tones.solid;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: bg, color: fg,
      fontSize: 'var(--fs-2xs)', fontWeight: 700, letterSpacing: '0.02em',
      padding: '3px 9px', borderRadius: 'var(--radius-pill)',
      lineHeight: 1.4, whiteSpace: 'nowrap', ...style,
    }}>
      {children}
    </span>
  );
}

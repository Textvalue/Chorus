import React from 'react';

/** Circular avatar. Initials with deterministic brand-tinted fill, or an image. */
export function Avatar({ name = '', src = null, size = 40, instrument = null, style = {} }) {
  const palette = [
    ['var(--blue-100)', 'var(--blue-700)'],
    ['var(--teal-100)', 'var(--teal-700)'],
    ['var(--green-100)', 'var(--green-700)'],
    ['var(--navy-700)', '#fff'],
  ];
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  const [bg, fg] = palette[h % palette.length];
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flex: 'none', ...style }}>
      <span style={{
        width: size, height: size, borderRadius: 999, overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: bg, color: fg,
        fontSize: size * 0.38, fontWeight: 700, fontFamily: 'var(--font-sans)',
      }}>
        {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
      </span>
      {instrument && (
        <span title={instrument} style={{
          position: 'absolute', bottom: -2, right: -2,
          width: size * 0.42, height: size * 0.42, borderRadius: 999,
          background: 'var(--teal-500)', color: '#fff', border: '2px solid var(--surface-card)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.22,
        }}>♪</span>
      )}
    </span>
  );
}

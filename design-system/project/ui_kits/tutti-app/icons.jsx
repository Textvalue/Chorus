// Tutti line icons — single weight (1.8), round caps. Plain SVG, no deps.
const I = (paths, vb = '24') => ({ size = 20, color = 'currentColor', strokeWidth = 1.8, style = {} } = {}) =>
  React.createElement('svg', {
    width: size, height: size, viewBox: `0 0 ${vb} ${vb}`, fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  }, paths.map((d, i) => React.createElement('path', { key: i, d })));

const Icons = {
  studio: I(['M3 12 12 3l9 9', 'M5 10v10h14V10', 'M9 20v-6h6v6']),
  create: I(['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z']),
  rehearsal: I(['M9 11l3 3L22 4', 'M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11']),
  ensemble: I(['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75']),
  tune: I(['M4 21v-7', 'M4 10V3', 'M12 21v-9', 'M12 8V3', 'M20 21v-5', 'M20 12V3', 'M1 14h6', 'M9 8h6', 'M17 16h6']),
  audience: I(['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8', 'M22 21v-2a4 4 0 0 0-3-3.87']),
  note: I(['M9 18V5l12-2v13', 'M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z']),
  waveform: I(['M2 12h2', 'M6 8v8', 'M10 4v16', 'M14 7v10', 'M18 9v6', 'M22 12h0']),
  star: I(['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z']),
  check: I(['M20 6 9 17l-5-5']),
  growth: I(['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6']),
  sparkles: I(['M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2L12 3Z', 'M19 15l.8 2.4L22 18l-2.2.6L19 21l-.8-2.4L16 18l2.2-.6L19 15Z']),
  plus: I(['M12 5v14', 'M5 12h14']),
  search: I(['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M21 21l-4.3-4.3']),
  bell: I(['M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9', 'M13.7 21a2 2 0 0 1-3.4 0']),
  send: I(['M22 2 11 13', 'M22 2 15 22l-4-9-9-4 20-7Z']),
  calendar: I(['M3 4h18v18H3z', 'M16 2v4', 'M8 2v4', 'M3 10h18']),
  copy: I(['M9 9h11v11H9z', 'M5 15H4V4h11v1']),
  chevronRight: I(['M9 18l6-6-6-6']),
  flat: I(['M9 3v14', 'M9 9c2-1.5 5-1 5 1.5S11 16 9 17']),  // musical flat ♭
};
window.TuttiIcons = Icons;

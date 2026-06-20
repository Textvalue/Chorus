// Brand-tinted avatar fills (white text). No bluish-purple — not part of the Penkala brand.
const COLORS = ["#2563EB", "#1488A6", "#16A34A", "#33425E", "#0F7089", "#1D4FD0"];

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function avatarColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

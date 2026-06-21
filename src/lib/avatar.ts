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

// Deterministic real-photo stand-in from a person's name. Same name → same face,
// every render. Used everywhere a person is shown without a real profile photo —
// feed, leaderboard, team, drafts, etc. If the URL ever fails to load, <Avatar>
// quietly falls back to the name's initials (see components/ds.tsx).
const PRAVATAR_COUNT = 70; // pravatar serves a fixed set of photos, ids 1..70
export function fakeAvatar(seed: string): string {
  const s = seed.trim().toLowerCase() || "anon";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `https://i.pravatar.cc/150?img=${(h % PRAVATAR_COUNT) + 1}`;
}

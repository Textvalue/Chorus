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

// Deterministic illustrated avatar (DiceBear) from a person's name, on a soft
// brand-tinted background. Used everywhere a person is shown without a real
// profile photo — feed, leaderboard, team, drafts, etc.
export function fakeAvatar(seed: string): string {
  const s = encodeURIComponent(seed.trim().toLowerCase() || "anon");
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${s}&radius=50&backgroundColor=ebe6ff,d9d0ff,e6f6ef,fff6e8,f0f0f2`;
}

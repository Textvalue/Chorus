// HarvestAPI LinkedIn scrape — api.harvest-api.com. Pull posts, then run the plan.md §3b filter.

const BASE = "https://api.harvest-api.com";

type HarvestPost = {
  id?: string;
  content?: string;
  repostId?: string | null;
  engagement?: { likes?: number; comments?: number };
  postedAt?: { date?: string };
};

type HarvestProfile = {
  firstName?: string;
  lastName?: string;
  headline?: string;
  about?: string;
  photo?: string;
  followerCount?: number;
  connectionsCount?: number;
  location?: { linkedinText?: string };
  experience?: { companyName?: string; position?: string }[];
};

export type LinkedInProfile = {
  name: string;
  headline: string;
  about: string;
  photo: string;
  location: string;
  followers: number;
  experience: { company: string; position: string }[];
};

function apiKey(): string {
  const key = process.env.HARVEST_API_KEY;
  if (!key) throw new Error("HARVEST_API_KEY is not set");
  return key;
}

async function get<T>(pathAndQuery: string): Promise<T> {
  const res = await fetch(`${BASE}${pathAndQuery}`, {
    headers: { "X-API-Key": apiKey() },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`HarvestAPI ${res.status}: ${body.slice(0, 300)}`);
  }
  return (await res.json()) as T;
}

export async function fetchProfile(profileUrl: string): Promise<{ name: string; headline: string }> {
  const data = await get<{ element?: HarvestProfile }>(
    `/linkedin/profile?url=${encodeURIComponent(profileUrl)}&main=true`
  );
  const el = data.element ?? {};
  const name = [el.firstName, el.lastName].filter(Boolean).join(" ").trim();
  return { name: name || "New member", headline: el.headline ?? "" };
}

/** Full profile for the optimizer — headline, About, experience, followers. */
export async function fetchProfileFull(profileUrl: string): Promise<LinkedInProfile> {
  const data = await get<{ element?: HarvestProfile }>(
    `/linkedin/profile?url=${encodeURIComponent(profileUrl)}`
  );
  const el = data.element ?? {};
  return {
    name: [el.firstName, el.lastName].filter(Boolean).join(" ").trim() || "Member",
    headline: el.headline ?? "",
    about: el.about ?? "",
    photo: el.photo ?? "",
    location: el.location?.linkedinText ?? "",
    followers: el.followerCount ?? el.connectionsCount ?? 0,
    experience: (el.experience ?? [])
      .slice(0, 5)
      .map((e) => ({ company: e.companyName ?? "", position: e.position ?? "" })),
  };
}

/** Fetch ~2 pages of posts for a profile. */
export async function fetchPosts(profileUrl: string, pages = 2): Promise<HarvestPost[]> {
  const all: HarvestPost[] = [];
  let paginationToken: string | undefined;
  for (let page = 1; page <= pages; page++) {
    const q = new URLSearchParams({ profile: profileUrl, page: String(page) });
    if (paginationToken) q.set("paginationToken", paginationToken);
    const data = await get<{
      elements?: HarvestPost[];
      pagination?: { paginationToken?: string };
    }>(`/linkedin/profile-posts?${q.toString()}`);
    all.push(...(data.elements ?? []));
    paginationToken = data.pagination?.paginationToken;
    if (!paginationToken) break;
  }
  return all;
}

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/**
 * plan.md §3b filter: drop reposts (repostId set), drop < ~150 words,
 * sort by likes + 2*comments, take top N as prose_samples.
 */
export function selectProseSamples(posts: HarvestPost[], take = 5): string[] {
  return posts
    .filter((p) => !p.repostId)
    .filter((p) => p.content && wordCount(p.content) >= 120)
    .sort(
      (a, b) =>
        (b.engagement?.likes ?? 0) + 2 * (b.engagement?.comments ?? 0) -
        ((a.engagement?.likes ?? 0) + 2 * (a.engagement?.comments ?? 0))
    )
    .slice(0, take)
    .map((p) => p.content!.trim());
}

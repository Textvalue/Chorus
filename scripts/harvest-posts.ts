// Fetch a LinkedIn profile's posts (text + visuals) via HarvestAPI.
//
// Run:
//   npx tsx scripts/harvest-posts.ts "https://www.linkedin.com/in/USERNAME"
//   npx tsx scripts/harvest-posts.ts "https://www.linkedin.com/in/USERNAME" 3            (3 pages)
//   npx tsx scripts/harvest-posts.ts "https://www.linkedin.com/in/USERNAME" 2 --download (also save media)
//
// Key: read from HARVEST_API_KEY in .env (auto-loaded), or pass HARVEST_API_KEY=... inline.
import "dotenv/config";
import { promises as fs } from "fs";
import path from "path";

const BASE = "https://api.harvest-api.com";
const KEY = process.env.HARVEST_API_KEY;

type Img = { url?: string; width?: number; height?: number };
type HarvestPost = {
  id?: string;
  content?: string;
  repostId?: string | null;
  postedAt?: { date?: string; postedAgoShort?: string };
  engagement?: { likes?: number; comments?: number; shares?: number };
  postImages?: Img[];                                   // attached images
  postVideo?: { thumbnailUrl?: string; videoUrl?: string }; // native video
  document?: { title?: string; transcribedDocumentUrl?: string; coverPages?: Img[] }; // carousel / PDF
  article?: { title?: string; link?: string; image?: Img }; // shared link card
};

async function getPosts(profileUrl: string, pages: number): Promise<HarvestPost[]> {
  const all: HarvestPost[] = [];
  let paginationToken: string | undefined;

  for (let page = 1; page <= pages; page++) {
    const q = new URLSearchParams({ profile: profileUrl, page: String(page) });
    if (paginationToken) q.set("paginationToken", paginationToken);

    const res = await fetch(`${BASE}/linkedin/profile-posts?${q.toString()}`, {
      headers: { "X-API-Key": KEY! },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HarvestAPI ${res.status}: ${body.slice(0, 400)}`);
    }
    const data = (await res.json()) as {
      elements?: HarvestPost[];
      pagination?: { paginationToken?: string };
    };
    all.push(...(data.elements ?? []));
    paginationToken = data.pagination?.paginationToken;
    if (!paginationToken) break;
  }
  return all;
}

const wordCount = (s = "") => s.trim().split(/\s+/).filter(Boolean).length;

// Collect every visual URL on a post, labeled.
function visualsOf(p: HarvestPost): { label: string; url: string }[] {
  const out: { label: string; url: string }[] = [];
  (p.postImages ?? []).forEach((im, i) => im.url && out.push({ label: `image${i + 1}`, url: im.url }));
  if (p.postVideo?.videoUrl) out.push({ label: "video", url: p.postVideo.videoUrl });
  if (p.postVideo?.thumbnailUrl) out.push({ label: "video-thumb", url: p.postVideo.thumbnailUrl });
  if (p.document?.transcribedDocumentUrl) out.push({ label: "document-pdf", url: p.document.transcribedDocumentUrl });
  (p.document?.coverPages ?? []).forEach((im, i) => im.url && out.push({ label: `doc-cover${i + 1}`, url: im.url }));
  if (p.article?.image?.url) out.push({ label: "article-image", url: p.article.image.url });
  if (p.article?.link) out.push({ label: "article-link", url: p.article.link });
  return out;
}

const extOf = (url: string) => {
  const m = url.split("?")[0].match(/\.(jpe?g|png|webp|gif|mp4|pdf)$/i);
  if (m) return m[1].toLowerCase();
  if (/feedshare-document|\/document\//.test(url)) return "pdf";
  if (/mp4-|\/vid\//.test(url)) return "mp4";
  return "jpg";
};

async function download(posts: HarvestPost[]) {
  const dir = path.join(process.cwd(), "harvest-media");
  await fs.mkdir(dir, { recursive: true });
  let n = 0;
  for (let i = 0; i < posts.length; i++) {
    for (const v of visualsOf(posts[i])) {
      if (v.label === "article-link") continue; // it's a page, not a file
      try {
        const res = await fetch(v.url);
        if (!res.ok) continue;
        const buf = Buffer.from(await res.arrayBuffer());
        const file = `post${i + 1}-${v.label}.${extOf(v.url)}`;
        await fs.writeFile(path.join(dir, file), buf);
        n++;
      } catch { /* skip a failed asset */ }
    }
  }
  console.log(`\nDownloaded ${n} media files → harvest-media/`);
}

async function main() {
  const profile = process.argv[2];
  const pages = Number(process.argv[3] ?? 2);
  const doDownload = process.argv.includes("--download");

  if (!KEY) { console.error("Missing HARVEST_API_KEY (set it in .env or pass inline)."); process.exit(1); }
  if (!profile) { console.error('Usage: npx tsx scripts/harvest-posts.ts "<linkedin profile url>" [pages] [--download]'); process.exit(1); }

  console.log(`Fetching up to ${pages} page(s) of posts for:\n  ${profile}\n`);
  const posts = await getPosts(profile, pages);

  const tally = { images: 0, videos: 0, documents: 0, articles: 0 };
  posts.forEach((p) => {
    if (p.postImages?.length) tally.images++;
    if (p.postVideo) tally.videos++;
    if (p.document) tally.documents++;
    if (p.article) tally.articles++;
  });
  console.log(`Got ${posts.length} posts · with media → ${tally.images} images, ${tally.videos} videos, ${tally.documents} documents, ${tally.articles} articles.\n${"=".repeat(60)}`);

  posts.forEach((p, i) => {
    const likes = p.engagement?.likes ?? 0;
    const comments = p.engagement?.comments ?? 0;
    const tag = p.repostId ? "REPOST" : "ORIGINAL";
    console.log(`\n#${i + 1} · ${tag} · ${p.postedAt?.postedAgoShort ?? p.postedAt?.date ?? "?"} · 👍 ${likes}  💬 ${comments} · ${wordCount(p.content)} words`);
    console.log((p.content ?? "(no text)").trim());
    const vis = visualsOf(p);
    if (vis.length) console.log("  visuals:\n" + vis.map((v) => `    [${v.label}] ${v.url}`).join("\n"));
  });

  await fs.writeFile("harvest-posts.json", JSON.stringify(posts, null, 2));
  console.log(`\n${"=".repeat(60)}\nRaw JSON (includes all media URLs) → harvest-posts.json`);

  if (doDownload) await download(posts);
}

main().catch((e) => {
  console.error("Failed:", e instanceof Error ? e.message : e);
  process.exit(1);
});

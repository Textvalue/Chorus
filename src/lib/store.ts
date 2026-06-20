// File-based JSON store (no DB for MVP). Single-process local persistence with in-memory cache.
import { promises as fs } from "fs";
import path from "path";
import type { Store, Org, Member, Post } from "./types";
import { SEED } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const EMPTY: Store = { org: null, members: [], posts: [] };

// Always read from disk. The store is tiny, and an in-memory cache is unsafe here:
// in Next.js, API route handlers and RSC pages load this module as separate instances,
// so a cached copy in one bundle goes stale after the other writes — which silently
// bounced users back to onboarding. Disk is the single source of truth.
async function load(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return { ...EMPTY, ...(JSON.parse(raw) as Store) };
  } catch {
    // No store on disk yet → ship the demo ensemble so Tutti is browsable out of the box.
    // The first real write (onboarding, generation) materializes it to data/store.json.
    return structuredClone(SEED);
  }
}

async function persist(s: Store): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(s, null, 2), "utf8");
}

export function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

// ---- reads ----
export async function getStore(): Promise<Store> {
  return structuredClone(await load());
}
export async function getOrg(): Promise<Org | null> {
  return (await load()).org;
}
export async function getMembers(): Promise<Member[]> {
  return (await load()).members;
}
export async function getMember(memberId: string): Promise<Member | undefined> {
  return (await load()).members.find((m) => m.member_id === memberId);
}
export async function getPosts(): Promise<Post[]> {
  return (await load()).posts;
}

// ---- writes ----
export async function saveOrg(org: Org): Promise<Org> {
  const s = await load();
  s.org = org;
  await persist(s);
  return org;
}

// Wipe the workspace to empty and persist it. Because an EMPTY store has org=null,
// the app gate redirects back into onboarding — this is the "restart onboarding" reset.
export async function resetStore(): Promise<void> {
  await persist(structuredClone(EMPTY));
}

export async function upsertMember(member: Member): Promise<Member> {
  const s = await load();
  const i = s.members.findIndex((m) => m.member_id === member.member_id);
  if (i >= 0) s.members[i] = member;
  else s.members.push(member);
  // first member becomes org owner
  if (s.org && !s.org.owner_member_id) s.org.owner_member_id = member.member_id;
  await persist(s);
  return member;
}

export async function updateMember(
  memberId: string,
  fn: (m: Member) => Member
): Promise<Member | undefined> {
  const s = await load();
  const i = s.members.findIndex((m) => m.member_id === memberId);
  if (i < 0) return undefined;
  s.members[i] = fn(s.members[i]);
  await persist(s);
  return s.members[i];
}

export async function addPost(post: Post): Promise<Post> {
  const s = await load();
  s.posts.unshift(post);
  await persist(s);
  return post;
}

export async function updatePost(
  postId: string,
  fn: (p: Post) => Post
): Promise<Post | undefined> {
  const s = await load();
  const i = s.posts.findIndex((p) => p.id === postId);
  if (i < 0) return undefined;
  s.posts[i] = fn(s.posts[i]);
  await persist(s);
  return s.posts[i];
}

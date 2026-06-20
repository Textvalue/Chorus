// Data store — Postgres-backed (Railway). Drop-in replacement for the former JSON file store:
// every function below keeps its exact signature, so all pages/routes that import "@/lib/store"
// are unchanged. Reads are scoped to the active org (the most recently saved one), giving real
// (org_id, member_id) isolation — onboarding a real company cleanly hides the demo ensemble.
import { pool, query } from "./db";
import { auth } from "@/auth";
import { getUserOrgId, setUserOrg } from "./users";
import type { Store, Org, Member, Post, Correction } from "./types";

export function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

const J = (v: unknown) => JSON.stringify(v ?? null);

// ---- row mappers ----
type OrgRow = {
  org_id: string; name: string; website: string; positioning: string;
  icp: Org["icp"]; competitors: Org["competitors"]; brand_dna: Org["brand_dna"];
  owner_member_id: string | null;
};
function toOrg(r: OrgRow): Org {
  return {
    org_id: r.org_id, name: r.name, website: r.website, positioning: r.positioning,
    icp: r.icp, competitors: r.competitors, brand_dna: r.brand_dna,
    owner_member_id: r.owner_member_id,
  };
}

type MemberRow = {
  member_id: string; org_id: string; name: string; headline: string; linkedin_url: string;
  voice_dna: Member["voice_dna"]; prose_samples: string[]; expert_pov: Member["expert_pov"];
};
function toMember(r: MemberRow, corrections: Correction[]): Member {
  return {
    member_id: r.member_id, org_id: r.org_id, name: r.name, headline: r.headline,
    linkedin_url: r.linkedin_url, voice_dna: r.voice_dna, prose_samples: r.prose_samples,
    expert_pov: r.expert_pov, corrections,
  };
}

type CorrRow = {
  member_id: string; kind: Correction["kind"]; topic: string | null;
  before_text: string | null; after_text: string | null; note: string | null; at: Date;
};
function toCorrection(r: CorrRow): Correction {
  const c: Correction = { at: new Date(r.at).toISOString(), kind: r.kind };
  if (r.topic != null) c.topic = r.topic;
  if (r.before_text != null) c.before = r.before_text;
  if (r.after_text != null) c.after = r.after_text;
  if (r.note != null) c.note = r.note;
  return c;
}

type PostRow = {
  id: string; member_id: string; org_id: string; topic: string; angle: string;
  body: string; generated_body: string; status: Post["status"]; voice_match: number;
  edits: Post["edits"]; created_at: Date; image_url: string | null; carousel: Post["carousel"];
};
function toPost(r: PostRow): Post {
  return {
    id: r.id, member_id: r.member_id, org_id: r.org_id, topic: r.topic, angle: r.angle,
    body: r.body, generated_body: r.generated_body, status: r.status,
    voice_match: r.voice_match, created_at: new Date(r.created_at).toISOString(), edits: r.edits,
    image_url: r.image_url ?? null, carousel: r.carousel ?? null,
  };
}

// The current workspace = the logged-in user's org. Everything is scoped to it, so each
// user gets a fully isolated workspace (multi-tenant). Null until the user finishes onboarding.
async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return (session?.user as { id?: string } | undefined)?.id ?? null;
}
async function currentOrgId(): Promise<string | null> {
  const uid = await currentUserId();
  return uid ? getUserOrgId(uid) : null;
}

// ---- reads ----
export async function getOrg(): Promise<Org | null> {
  const orgId = await currentOrgId();
  if (!orgId) return null;
  const rows = await query<OrgRow>("select * from orgs where org_id = $1", [orgId]);
  return rows[0] ? toOrg(rows[0]) : null;
}

export async function getMembers(): Promise<Member[]> {
  const orgId = await currentOrgId();
  if (!orgId) return [];
  const [mrows, crows] = await Promise.all([
    query<MemberRow>("select * from members where org_id = $1 order by created_at asc", [orgId]),
    query<CorrRow>("select * from corrections where org_id = $1 order by at asc, id asc", [orgId]),
  ]);
  const byMember = new Map<string, Correction[]>();
  for (const c of crows) {
    const list = byMember.get(c.member_id) ?? [];
    list.push(toCorrection(c));
    byMember.set(c.member_id, list);
  }
  return mrows.map((m) => toMember(m, byMember.get(m.member_id) ?? []));
}

export async function getMember(memberId: string): Promise<Member | undefined> {
  const orgId = await currentOrgId();
  if (!orgId) return undefined;
  const mrows = await query<MemberRow>(
    "select * from members where member_id = $1 and org_id = $2",
    [memberId, orgId]
  );
  if (!mrows[0]) return undefined;
  const crows = await query<CorrRow>(
    "select * from corrections where member_id = $1 order by at asc, id asc",
    [memberId]
  );
  return toMember(mrows[0], crows.map(toCorrection));
}

export async function getPosts(): Promise<Post[]> {
  const orgId = await currentOrgId();
  if (!orgId) return [];
  const rows = await query<PostRow>(
    "select * from posts where org_id = $1 order by created_at desc, id desc",
    [orgId]
  );
  return rows.map(toPost);
}

export async function getStore(): Promise<Store> {
  const [org, members, posts] = await Promise.all([getOrg(), getMembers(), getPosts()]);
  return { org, members, posts };
}

// ---- writes ----
export async function saveOrg(org: Org): Promise<Org> {
  await query(
    `insert into orgs (org_id, name, website, positioning, icp, competitors, brand_dna, owner_member_id, updated_at)
     values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,$8, now())
     on conflict (org_id) do update set
       name=excluded.name, website=excluded.website, positioning=excluded.positioning,
       icp=excluded.icp, competitors=excluded.competitors, brand_dna=excluded.brand_dna,
       owner_member_id=excluded.owner_member_id, updated_at=now()`,
    [org.org_id, org.name, org.website, org.positioning, J(org.icp), J(org.competitors),
     J(org.brand_dna), org.owner_member_id]
  );
  // Bind this org to the current user as their private workspace.
  const uid = await currentUserId();
  if (uid) await setUserOrg(uid, org.org_id);
  return org;
}

// Restart onboarding for the current user: drop their org (cascades members/posts/corrections).
// The FK users.org_id ON DELETE SET NULL clears their workspace link, so the gate sends them
// back into onboarding. Other users are untouched.
export async function resetStore(): Promise<void> {
  const orgId = await currentOrgId();
  if (orgId) await query("delete from orgs where org_id = $1", [orgId]);
}

async function syncCorrections(member: Member): Promise<void> {
  await query("delete from corrections where member_id = $1", [member.member_id]);
  for (const c of member.corrections) {
    await query(
      `insert into corrections (member_id, org_id, kind, topic, before_text, after_text, note, at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [member.member_id, member.org_id, c.kind, c.topic ?? null, c.before ?? null,
       c.after ?? null, c.note ?? null, c.at ?? new Date().toISOString()]
    );
  }
}

export async function upsertMember(member: Member): Promise<Member> {
  await query(
    `insert into members (member_id, org_id, name, headline, linkedin_url, voice_dna, prose_samples, expert_pov, updated_at)
     values ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb, now())
     on conflict (member_id) do update set
       org_id=excluded.org_id, name=excluded.name, headline=excluded.headline,
       linkedin_url=excluded.linkedin_url, voice_dna=excluded.voice_dna,
       prose_samples=excluded.prose_samples, expert_pov=excluded.expert_pov, updated_at=now()`,
    [member.member_id, member.org_id, member.name, member.headline, member.linkedin_url,
     J(member.voice_dna), J(member.prose_samples), J(member.expert_pov)]
  );
  // First member becomes the org owner.
  await query(
    "update orgs set owner_member_id = $1 where org_id = $2 and owner_member_id is null",
    [member.member_id, member.org_id]
  );
  await syncCorrections(member);
  return member;
}

export async function updateMember(
  memberId: string,
  fn: (m: Member) => Member
): Promise<Member | undefined> {
  const current = await getMember(memberId);
  if (!current) return undefined;
  const next = fn(current);
  await query(
    `update members set name=$2, headline=$3, linkedin_url=$4, voice_dna=$5::jsonb,
       prose_samples=$6::jsonb, expert_pov=$7::jsonb, updated_at=now() where member_id=$1`,
    [memberId, next.name, next.headline, next.linkedin_url, J(next.voice_dna),
     J(next.prose_samples), J(next.expert_pov)]
  );
  await syncCorrections(next);
  return next;
}

export async function addPost(post: Post): Promise<Post> {
  await query(
    `insert into posts (id, member_id, org_id, topic, angle, body, generated_body, status, voice_match, edits, created_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)`,
    [post.id, post.member_id, post.org_id, post.topic, post.angle, post.body, post.generated_body,
     post.status, post.voice_match, J(post.edits), post.created_at]
  );
  return post;
}

export async function updatePost(
  postId: string,
  fn: (p: Post) => Post
): Promise<Post | undefined> {
  const orgId = await currentOrgId();
  if (!orgId) return undefined;
  const rows = await query<PostRow>("select * from posts where id = $1 and org_id = $2", [postId, orgId]);
  if (!rows[0]) return undefined;
  const next = fn(toPost(rows[0]));
  await query(
    `update posts set topic=$2, angle=$3, body=$4, generated_body=$5, status=$6,
       voice_match=$7, edits=$8::jsonb where id=$1`,
    [postId, next.topic, next.angle, next.body, next.generated_body, next.status,
     next.voice_match, J(next.edits)]
  );
  return next;
}

export async function setPostImage(postId: string, imageUrl: string): Promise<void> {
  const orgId = await currentOrgId();
  if (!orgId) return;
  await query("update posts set image_url = $1 where id = $2 and org_id = $3", [imageUrl, postId, orgId]);
}

export async function setPostCarousel(postId: string, slides: Post["carousel"]): Promise<void> {
  const orgId = await currentOrgId();
  if (!orgId) return;
  await query("update posts set carousel = $1::jsonb where id = $2 and org_id = $3", [J(slides), postId, orgId]);
}

// Exposed so scripts can close the pool cleanly.
export async function closePool(): Promise<void> {
  await pool.end();
}

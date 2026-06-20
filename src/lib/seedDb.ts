// Seeds the Acme demo ensemble into Postgres. Used by the db:seed script and by resetStore()
// (reset = reload the demo, per product choice). Inserts in FK order: org → members → posts.
import { query } from "./db";
import { SEED } from "./seed";
import { hashPassword } from "./password";

const J = (v: unknown) => JSON.stringify(v ?? null);

// A demo account whose workspace is the Acme ensemble, so the seeded demo is reachable via login.
export const DEMO_USER = { id: "usr_demo", email: "demo@tutti.app", password: "demodemo" };

export async function seedDatabase({ truncate = true }: { truncate?: boolean } = {}): Promise<void> {
  if (truncate) {
    await query("truncate users, corrections, posts, members, orgs restart identity cascade");
  }

  const org = SEED.org!;
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

  // Demo login bound to the Acme workspace.
  await query(
    `insert into users (id, email, password_hash, org_id) values ($1,$2,$3,$4)
     on conflict (id) do update set email=excluded.email, password_hash=excluded.password_hash, org_id=excluded.org_id`,
    [DEMO_USER.id, DEMO_USER.email, await hashPassword(DEMO_USER.password), org.org_id]
  );

  for (const m of SEED.members) {
    await query(
      `insert into members (member_id, org_id, name, headline, linkedin_url, voice_dna, prose_samples, expert_pov)
       values ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb)
       on conflict (member_id) do nothing`,
      [m.member_id, m.org_id, m.name, m.headline, m.linkedin_url,
       J(m.voice_dna), J(m.prose_samples), J(m.expert_pov)]
    );
    for (const c of m.corrections) {
      await query(
        `insert into corrections (member_id, org_id, kind, topic, before_text, after_text, note, at)
         values ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [m.member_id, m.org_id, c.kind, c.topic ?? null, c.before ?? null, c.after ?? null,
         c.note ?? null, c.at ?? new Date().toISOString()]
      );
    }
  }

  for (const p of SEED.posts) {
    await query(
      `insert into posts (id, member_id, org_id, topic, angle, body, generated_body, status, voice_match, edits, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
       on conflict (id) do nothing`,
      [p.id, p.member_id, p.org_id, p.topic, p.angle, p.body, p.generated_body, p.status,
       p.voice_match, J(p.edits), p.created_at]
    );
  }
}

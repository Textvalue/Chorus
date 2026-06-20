-- Tutti — Postgres schema (Phase 1: the real, wired content loop).
-- Relational core + JSONB for nested blobs the app reads/writes as whole objects.
-- App-generated TEXT ids are kept (org_acme, mem_alex, post_…) so seed + id() stay valid.

create table if not exists orgs (
  org_id           text primary key,
  name             text not null,
  website          text not null default '',
  positioning      text not null default '',
  icp              jsonb not null default '{}'::jsonb,   -- { personas[], pains[], anti_personas[] }
  competitors      jsonb not null default '[]'::jsonb,
  brand_dna        jsonb not null default '{}'::jsonb,   -- { voice_rules[], narrative_atoms{} }
  owner_member_id  text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists members (
  member_id      text primary key,
  org_id         text not null references orgs(org_id) on delete cascade,
  name           text not null,
  headline       text not null default '',
  linkedin_url   text not null default '',
  voice_dna      jsonb not null default '{}'::jsonb,     -- { traits[], sentence_patterns[], signature_terms[], phrases_to_avoid[] }
  prose_samples  jsonb not null default '[]'::jsonb,     -- string[] of verbatim posts
  expert_pov     jsonb not null default '{}'::jsonb,     -- { beliefs[], topics[], hot_takes[], status }
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists posts (
  id              text primary key,
  member_id       text not null references members(member_id) on delete cascade,
  org_id          text not null references orgs(org_id) on delete cascade,
  topic           text not null default '',
  angle           text not null default '',
  body            text not null default '',
  generated_body  text not null default '',
  status          text not null default 'draft' check (status in ('draft','approved','rejected')),
  voice_match     integer not null default 0,
  edits           jsonb not null default '[]'::jsonb,    -- [{ at, before, after }]
  created_at      timestamptz not null default now()
);

-- Corrections — the moat loop, promoted to its own table so it's queryable
-- (voice drift, edits/week). Populated by store.ts syncing from member.corrections.
create table if not exists corrections (
  id          bigint generated always as identity primary key,
  member_id   text not null references members(member_id) on delete cascade,
  org_id      text not null references orgs(org_id) on delete cascade,
  kind        text not null check (kind in ('edit','reject','brain_dump')),
  topic       text,
  before_text text,
  after_text  text,
  note        text,
  at          timestamptz not null default now()
);

-- Auth (NextAuth credentials + JWT sessions). One user owns one workspace (org).
-- org_id is null until the user finishes onboarding, then points at their private org.
create table if not exists users (
  id             text primary key,
  email          text unique not null,
  password_hash  text not null,
  org_id         text references orgs(org_id) on delete set null,
  created_at     timestamptz not null default now()
);
create index if not exists users_org_idx on users (org_id);

create index if not exists members_org_idx       on members (org_id);
create index if not exists posts_member_idx       on posts (member_id);
create index if not exists posts_org_idx          on posts (org_id);
create index if not exists posts_status_idx       on posts (status);
create index if not exists corrections_member_idx on corrections (member_id);
create index if not exists corrections_org_idx    on corrections (org_id);

-- generated post image / infographic (relative URL under /generated)
alter table if exists posts add column if not exists image_url text;

-- generated carousel slides (JSON array of {url,title,body,kind})
alter table if exists posts add column if not exists carousel jsonb;

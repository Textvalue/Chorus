// User data-access (separate from the content store so it can be imported by auth without cycles).
import { query } from "./db";
import { hashPassword } from "./password";

export type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  org_id: string | null;
};

function uid(): string {
  return `usr_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  const rows = await query<UserRow>("select * from users where email = $1", [email.toLowerCase()]);
  return rows[0];
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  const rows = await query<UserRow>("select * from users where id = $1", [id]);
  return rows[0];
}

export async function createUser(email: string, password: string): Promise<UserRow> {
  const normalized = email.trim().toLowerCase();
  const existing = await getUserByEmail(normalized);
  if (existing) throw new Error("An account with this email already exists.");
  const password_hash = await hashPassword(password);
  const id = uid();
  const rows = await query<UserRow>(
    "insert into users (id, email, password_hash) values ($1,$2,$3) returning *",
    [id, normalized, password_hash]
  );
  return rows[0];
}

/** The org_id of the user's workspace (null until they finish onboarding). */
export async function getUserOrgId(userId: string): Promise<string | null> {
  const rows = await query<{ org_id: string | null }>("select org_id from users where id = $1", [userId]);
  return rows[0]?.org_id ?? null;
}

export async function setUserOrg(userId: string, orgId: string): Promise<void> {
  await query("update users set org_id = $1 where id = $2", [orgId, userId]);
}

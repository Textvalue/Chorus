// Postgres connection pool (Railway). Singleton across Next module instances / dev HMR.
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __ttPool: Pool | undefined;
}

function makePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  // Railway's public proxy serves a self-signed cert; relax verification for non-local hosts.
  const local = /localhost|127\.0\.0\.1/.test(connectionString);
  return new Pool({
    connectionString,
    ssl: local ? false : { rejectUnauthorized: false },
    max: 5,
  });
}

export const pool: Pool = globalThis.__ttPool ?? makePool();
if (process.env.NODE_ENV !== "production") globalThis.__ttPool = pool;

export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await pool.query(text, params as never[]);
  return res.rows as T[];
}

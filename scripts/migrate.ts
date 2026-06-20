// Apply db/schema.sql to the database in DATABASE_URL. Idempotent (create … if not exists).
import "dotenv/config";
import { readFileSync } from "fs";
import path from "path";
import { pool } from "../src/lib/db";

async function main() {
  const sql = readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("✓ schema applied");
  await pool.end();
}

main().catch((e) => {
  console.error("migration failed:", e);
  process.exit(1);
});

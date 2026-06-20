// Seed the Acme demo ensemble (truncates first). Run after db:migrate.
import "dotenv/config";
import { seedDatabase } from "../src/lib/seedDb";
import { pool } from "../src/lib/db";

async function main() {
  await seedDatabase({ truncate: true });
  const { rows } = await pool.query(
    "select (select count(*) from orgs) orgs, (select count(*) from members) members, (select count(*) from posts) posts"
  );
  console.log("✓ seeded:", rows[0]);
  await pool.end();
}

main().catch((e) => {
  console.error("seed failed:", e);
  process.exit(1);
});

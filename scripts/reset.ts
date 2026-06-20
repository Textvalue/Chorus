// Drop all rows and reload the Acme demo. Alias for the in-app resetStore().
import "dotenv/config";
import { seedDatabase } from "../src/lib/seedDb";
import { pool } from "../src/lib/db";

async function main() {
  await seedDatabase({ truncate: true });
  console.log("✓ reset to Acme demo");
  await pool.end();
}

main().catch((e) => {
  console.error("reset failed:", e);
  process.exit(1);
});

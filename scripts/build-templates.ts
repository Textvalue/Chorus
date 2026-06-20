// Build the infographic TEMPLATE LIBRARY from the megathon corpus.
// Picks the best-scoring example(s) per visual category (preferring JPGs — safer as references
// than animated GIFs), copies those original infographics into public/templates/, and writes a
// manifest. Templates are used only as REFERENCE images when generating infographics; they are
// never stored as posts. Re-runnable.
//   npx tsx scripts/build-templates.ts
import { promises as fs } from "fs";
import path from "path";

const MEGATHON = path.join(process.cwd(), "megathon-linkedin");
const SRC_IMAGES = path.join(MEGATHON, "output2", "images");
const VC_PATH = path.join(MEGATHON, "output5", "visual-categories.jsonl");
const POSTS_PATH = path.join(MEGATHON, "output5", "posts.jsonl");
const OUT_DIR = path.join(process.cwd(), "public", "templates");
const PER_CATEGORY = 2;

// Human labels for the 14 derived visual categories (see megathon HANDOFF.md).
const LABELS: Record<string, string> = {
  flowchart: "Flowchart",
  funnel_diagram: "Funnel",
  roadmap_or_timeline: "Roadmap / timeline",
  hierarchy_diagram: "Hierarchy",
  multi_column_list: "Multi-column list",
  vertical_list: "Vertical list",
  grid_of_cards: "Card grid",
  comparison_table: "Comparison table",
  two_by_two_matrix: "2×2 matrix",
  data_visualization: "Data viz",
  text_block: "Text block",
  chat_conversation: "Chat / conversation",
  screenshot_or_mockup: "Screenshot / mockup",
  multi_section_infographic: "Multi-section",
};

type VC = { postId: string; file: string; category: string; family: string };

async function readJsonl<T>(p: string): Promise<T[]> {
  return (await fs.readFile(p, "utf8")).split(/\r?\n/).filter(Boolean).map((l) => JSON.parse(l) as T);
}

async function main() {
  const vc = await readJsonl<VC>(VC_PATH);
  const posts = await readJsonl<{ postId: string; score?: string; linkedinUrl?: string }>(POSTS_PATH);
  const scoreOf = new Map(posts.map((p) => [p.postId, Number(p.score) || 0]));
  const urlOf = new Map(posts.map((p) => [p.postId, p.linkedinUrl ?? ""]));

  const byCat = new Map<string, VC[]>();
  for (const v of vc) {
    const arr = byCat.get(v.category) ?? [];
    arr.push(v);
    byCat.set(v.category, arr);
  }

  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const manifest: {
    id: string; src: string; category: string; family: string; label: string; score: number; sourceUrl: string;
  }[] = [];

  for (const [cat, arr] of byCat) {
    // Prefer JPGs, then highest engagement score.
    arr.sort((a, b) => {
      const ga = a.file.endsWith(".gif") ? 1 : 0;
      const gb = b.file.endsWith(".gif") ? 1 : 0;
      if (ga !== gb) return ga - gb;
      return (scoreOf.get(b.postId) ?? 0) - (scoreOf.get(a.postId) ?? 0);
    });
    let added = 0;
    for (const v of arr) {
      if (added >= PER_CATEGORY) break;
      const srcFile = path.join(SRC_IMAGES, v.file);
      try {
        await fs.access(srcFile);
      } catch {
        continue;
      }
      await fs.copyFile(srcFile, path.join(OUT_DIR, v.file));
      manifest.push({
        id: v.postId,
        src: `/templates/${v.file}`,
        category: cat,
        family: v.family,
        label: LABELS[cat] ?? cat,
        score: scoreOf.get(v.postId) ?? 0,
        sourceUrl: urlOf.get(v.postId) ?? "",
      });
      added++;
    }
  }

  // Group by family, best first within group.
  manifest.sort((a, b) => a.family.localeCompare(b.family) || b.score - a.score);
  await fs.writeFile(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`✓ ${manifest.length} templates across ${byCat.size} categories → public/templates/`);
}

main().catch((e) => {
  console.error("build-templates failed:", e);
  process.exit(1);
});

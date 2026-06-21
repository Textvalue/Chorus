import type { NextConfig } from "next";
import path from "node:path";

// Repo root (one level up). Vercel forces `outputFileTracingRoot` to the repo
// root for monorepo file tracing, so pin BOTH roots to the same value to avoid
// the "roots must have the same value" warning. Build entries still come from
// this app's app/ dir, so the parent app's middleware is never compiled.
const repoRoot = path.resolve(__dirname, "..");

const nextConfig: NextConfig = {
  turbopack: {
    root: repoRoot,
  },
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;

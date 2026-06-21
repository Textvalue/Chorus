import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin Turbopack to this app — the parent KB has its own lockfile.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

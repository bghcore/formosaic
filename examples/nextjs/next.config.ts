import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Next.js from resolving to the monorepo root node_modules
  outputFileTracingRoot: path.join(__dirname, "./"),
  // Ensure @form-engine packages are transpiled from node_modules
  transpilePackages: [
    "@form-eng/core",
    "@form-eng/mui",
  ],
};

export default nextConfig;

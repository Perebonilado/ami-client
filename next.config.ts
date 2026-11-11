import type { NextConfig } from "next";

// In the sandbox the NestJS server runs as an internal Service. Setting API_PROXY_URL at build time
// (for example http://api) sends every /api request there instead of the mock route handlers, so the
// browser only ever talks to one origin and the session cookie stays first-party.
const apiProxy = process.env.API_PROXY_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    if (!apiProxy) return [];
    return { beforeFiles: [{ source: "/api/:path*", destination: `${apiProxy}/api/:path*` }], afterFiles: [], fallback: [] };
  },
};

export default nextConfig;

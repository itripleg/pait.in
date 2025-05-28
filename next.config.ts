// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Essential for Netlify deployment
  trailingSlash: false,

  // Reduce memory usage during build
  experimental: {
    memoryBasedWorkers: false,
    workerThreads: false,
  },

  // Remove console logs in production
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },
};

export default nextConfig;

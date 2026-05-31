import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow async server components
  experimental: {},
  // Headers for font loading
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "4000", pathname: "/media/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "4000", pathname: "/media/**" },
    ],
  },
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: "/backend/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
      {
        protocol: "https",
        hostname: "arunashi-storefront-media.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "arunashi-storefront-media.s3.us-east-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "arunashi-backend.onrender.com",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      },
    ],
  },
};

export default nextConfig;

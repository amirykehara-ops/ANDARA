import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["https://andara-andara.vercel.app"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};
export default nextConfig;
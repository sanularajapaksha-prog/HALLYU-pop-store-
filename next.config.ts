import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Mock product photography comes from picsum.photos (deterministic per slug).
    // Without this, every next/image render throws "hostname is not configured".
    // Replace with the real CDN host when actual assets land.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", pathname: "/seed/**" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;

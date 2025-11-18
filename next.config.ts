import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No need for CORS headers - cookies work when the page is accessed directly
  // Farcaster miniapps load your domain directly in iframe, so it's same-origin
};

export default nextConfig;

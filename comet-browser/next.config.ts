import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  assetPrefix: './',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  reactStrictMode: false
};

export default nextConfig;

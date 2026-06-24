import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/TheUsualsWeb',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

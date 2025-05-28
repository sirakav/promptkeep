import type { NextConfig } from "next";

const repoName = 'promptkeep'; // Used for basePath and assetPrefix

const nextConfig: NextConfig = {
  output: 'export', // Enable static export
  basePath: `/${repoName}`, // Deploy to a subdirectory (e.g., /promptkeep)
  assetPrefix: `/${repoName}/`, // Prefix for assets to load correctly from subdirectory
  images: {
    unoptimized: true, // Disable Next.js Image Optimization for static exports
  },
  // Ensure trailingSlashes is not true if you prefer no trailing slashes,
  // or set it explicitly based on your preference for URL structure.
  // By default (undefined or false), Next.js does not add trailing slashes.
  // trailingSlash: false, // Default is false, so this line is optional
};

export default nextConfig;

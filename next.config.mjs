/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // ⭐ REQUIRED for GitHub Pages

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  basePath: "/TeamMegh_HackForBusiness",
  assetPrefix: "/TeamMegh_HackForBusiness/",
};

export default nextConfig;


import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// ✅ Manually define __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, '.');
    return config;
  },
  // Turbopack configuration (when using --turbopack flag)
  turbopack: {
    resolveAlias: {
      '@': '.',
      '@/*': './*',
    },
  },
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;

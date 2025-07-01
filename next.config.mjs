import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  experimental: {
    appDir: true, // ✅ Keep this only if you're using the App Router (i.e., /app folder)
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src'); // ✅ Fix alias
    return config;
  },
};

export default nextConfig;

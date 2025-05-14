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
  turbo: {
    loaders: {
      font: [
        {
          loader: "@next/font/google",
          options: { subsets: ["latin"] },
        },
      ],
    },
  },
  experimental: {
    appDir: true,
  },
};

export default nextConfig;

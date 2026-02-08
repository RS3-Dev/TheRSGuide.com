import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.thersguide.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.thersguide.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "thersguide.com",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "runescape.wiki",
        port: "",
        pathname: "/images/**",
      },
    ],
  },
};

export default withMDX(config);

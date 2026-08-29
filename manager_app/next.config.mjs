import createNextIntlPlugin from "next-intl/plugin";
import { withSerwist } from "@serwist/turbopack";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ordersync/order-utils", "@ordersync/types"],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  allowedDevOrigins: ['*.ngrok-free.app'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pub-fd5c9e71bf0d4aa6bf3ebbfefbed5c55.r2.dev",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default withSerwist(withNextIntl(nextConfig));

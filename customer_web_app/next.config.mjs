import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from "next-intl/plugin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  transpilePackages: ["@ordersync/order-utils", "@ordersync/types"],
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default withNextIntl(nextConfig);

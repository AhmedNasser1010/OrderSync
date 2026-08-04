import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from "next-intl/plugin";
import { withSerwist } from "@serwist/turbopack";

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
  allowedDevOrigins: ["*.ngrok-free.app", "1952-196-130-150-25.ngrok-free.app"],
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default withSerwist(withNextIntl(nextConfig));

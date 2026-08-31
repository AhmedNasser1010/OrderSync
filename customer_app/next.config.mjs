import path from 'path';
import { fileURLToPath } from 'url';
import createNextIntlPlugin from "next-intl/plugin";
import { withSerwist } from "@serwist/turbopack";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Serve Firebase Auth's same-origin relay from this app's domain so the
    // auth iframe stays first-party. The locale-prefixed variant is needed
    // because next-intl uses `localePrefix: "always"` and Firebase builds the
    // handler URL from the current localized page path.
    return [
      {
        source: "/__/auth/:path*",
        destination: `https://${process.env.NEXT_PUBLIC_PROJECT_ID}.firebaseapp.com/__/auth/:path*`,
      },
      {
        source: "/:locale/__/auth/:path*",
        destination: `https://${process.env.NEXT_PUBLIC_PROJECT_ID}.firebaseapp.com/__/auth/:path*`,
      },
    ];
  },
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
    qualities: [75, 100],
  },
  transpilePackages: ["@ordersync/order-utils", "@ordersync/types"],
  allowedDevOrigins: ["*.ngrok-free.app", "1952-196-130-150-25.ngrok-free.app"],
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default withSerwist(withNextIntl(nextConfig));

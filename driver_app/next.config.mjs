import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@ordersync/order-utils", "@ordersync/types"],
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
};

export default nextConfig;

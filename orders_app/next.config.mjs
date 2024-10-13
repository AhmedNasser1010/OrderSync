/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media-assets.swiggy.com',
        port: '',
        pathname: '/swiggy/image/upload/**',
      },
    ],
  },
};


export default nextConfig;

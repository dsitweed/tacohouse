import type { NextConfig } from 'next';
import { withIntlayer } from 'next-intlayer/server';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
};

export default withIntlayer(nextConfig);

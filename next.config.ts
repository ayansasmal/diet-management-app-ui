import type { NextConfig } from 'next';

/**
 * Next.js Configuration
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        // Google user profile pictures
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        // Google content
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable React 19 compiler (already default in Next.js 15+)
    // reactCompiler: true,
  },

  // Environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
  },
};

export default nextConfig;

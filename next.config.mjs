import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9001',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'prium.github.io',
        pathname: '/aurora/images/**',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['@iconify/react', 'lodash', '@mui/x-date-pickers', '@mui/lab'],
  },
};

export default withBundleAnalyzer(nextConfig);

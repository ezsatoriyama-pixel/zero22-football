/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/zero22-football',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
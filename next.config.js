/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        { source: '/api/cross_stitch', destination: 'http://localhost:8000/api/cross_stitch' },
      ];
    }
    return [];
  },

    images: {
    // Works on Next 13/14/15
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
    // Optional: if you're on an older Next, this also works:
    // domains: ['res.cloudinary.com'],
  },
};
module.exports = nextConfig;

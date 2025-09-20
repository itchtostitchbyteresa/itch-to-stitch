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
};
module.exports = nextConfig;

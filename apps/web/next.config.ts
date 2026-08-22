import type { NextConfig } from 'next';
const api = process.env.API_INTERNAL_URL ?? 'http://localhost:3001';
const config: NextConfig = {
  transpilePackages: ['@mimelie/contracts', '@mimelie/ui'],
  images: { formats: ['image/avif', 'image/webp'], remotePatterns: [{ protocol: 'https', hostname: '**.r2.dev' }, { protocol: 'https', hostname: 'imagedelivery.net' }] },
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=()' },
        ],
      },
    ];
  },
  async rewrites() { return [{ source: '/api/:path*', destination: `${api}/v1/:path*` }]; },
};
export default config;

import type { NextConfig } from 'next';

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : 'https://mimelie.vira.ia.br');
const adminUrl =
  process.env.NEXT_PUBLIC_ADMIN_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5174'
    : 'https://mimelie-api.vira.ia.br');

const config: NextConfig = {
  agentRules: false,
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_ADMIN_URL: adminUrl,
  },
  transpilePackages: ['@mimelie/contracts', '@mimelie/ui'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
      { protocol: 'https', hostname: '**.workers.dev' },
      { protocol: 'https', hostname: '**.mimelie.com' },
    ],
  },
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
};
export default config;

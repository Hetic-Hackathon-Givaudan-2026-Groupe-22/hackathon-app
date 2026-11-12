import type { NextConfig } from 'next';

// Adresse de l'API NestJS : réglable par API_URL, localhost:3000 en dev
const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  // Le front appelle /api/… ; Next.js relaie vers l'API, sans CORS ni adresse en dur
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

// Adresse de l'API NestJS : réglable par API_URL, localhost:3000 en dev
const apiUrl = process.env.API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  // docker compose construit dans son propre dossier : il ne gêne pas next dev (ADR 0010)
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
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

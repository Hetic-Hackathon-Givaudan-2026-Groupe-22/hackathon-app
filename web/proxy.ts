import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Proxy de Next.js (ex-middleware) : choisit la langue et préfixe l'URL (ADR 0016)
export default createMiddleware(routing);

export const config = {
  // Ni l'API relayée, ni les fichiers de Next.js, ni les fichiers statiques
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

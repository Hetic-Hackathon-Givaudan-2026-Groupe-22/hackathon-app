import type { routing } from './i18n/routing';
import type messages from './messages/fr.json';

// Typage de next-intl : une clé absente de messages/fr.json est une erreur de compilation
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}

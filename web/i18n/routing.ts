import { defineRouting } from 'next-intl/routing';

// Langues de l'interface (ADR 0016) : le français par défaut, l'anglais en option
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
});

export type Langue = (typeof routing.locales)[number];

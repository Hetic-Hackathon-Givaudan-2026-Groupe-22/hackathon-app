import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// Messages de la langue demandée, chargés à chaque requête (ADR 0016)
export default getRequestConfig(async ({ requestLocale }) => {
  const demandee = await requestLocale;
  const locale = hasLocale(routing.locales, demandee)
    ? demandee
    : routing.defaultLocale;
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    timeZone: 'Europe/Paris',
  };
});

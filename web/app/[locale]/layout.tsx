import type { Metadata } from 'next';
import { Figtree, IBM_Plex_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import { SessionProvider } from '@/lib/session';
import { EnTete, Garde } from './en-tete';
import '../globals.css';

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Sillage',
  description: 'Distinguer un buzz passager d’une tendance durable',
};

// La langue vient de l'URL (/fr, /en), posée par le proxy de next-intl (ADR 0016)
export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return (
    <html lang={locale} className={`${figtree.variable} ${plexMono.variable}`}>
      <body>
        <NextIntlClientProvider>
          <SessionProvider>
            <EnTete />
            <main className="gutter">
              <Garde>{children}</Garde>
            </main>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

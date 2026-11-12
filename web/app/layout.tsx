import type { Metadata } from 'next';
import { Figtree, IBM_Plex_Mono } from 'next/font/google';
import { SessionProvider } from '@/lib/session';
import { EnTete, Garde } from './en-tete';
import './globals.css';

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

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className={`${figtree.variable} ${plexMono.variable}`}>
      <body>
        <SessionProvider>
          <EnTete />
          <main className="gutter">
            <Garde>{children}</Garde>
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}

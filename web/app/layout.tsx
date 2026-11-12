import type { Metadata } from 'next';
import { Figtree, IBM_Plex_Mono } from 'next/font/google';
import Link from 'next/link';
import { Comete } from './logo';
import { NavEtapes } from './nav-etapes';
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
        <header className="top gutter">
          <div className="top-in">
            <Link href="/" className="logo" aria-label="Accueil Sillage">
              <Comete />
              Sillage
            </Link>
            <NavEtapes />
            <span className="prof" style={{ marginLeft: 'auto' }}>
              <span className="av" aria-hidden="true">
                C
              </span>
              <span className="note">Camille · Consumer Insights (démo)</span>
            </span>
          </div>
        </header>
        <main className="gutter">{children}</main>
      </body>
    </html>
  );
}

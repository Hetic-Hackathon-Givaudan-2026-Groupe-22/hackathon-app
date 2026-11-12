import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sillage',
  description: 'Distinguer un buzz passager d’une tendance durable',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full flex flex-col bg-base-200">
        <header className="navbar bg-base-100 shadow-sm px-4">
          <Link href="/" className="text-xl font-semibold">
            Sillage
          </Link>
          <nav className="ml-6">
            <Link href="/tendances" className="link link-hover">
              Tendances
            </Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}

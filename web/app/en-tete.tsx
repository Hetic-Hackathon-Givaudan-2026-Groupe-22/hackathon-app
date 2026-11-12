'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { initiales, pagePublique, useSession } from '@/lib/session';
import { Comete } from './logo';
import { NavEtapes } from './nav-etapes';

// En-tête du prototype ; renvoie à l'accueil toute personne non connectée (US-03)
export function EnTete() {
  const { utilisateur, pret, deconnecter } = useSession();
  const chemin = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pret && !utilisateur && !pagePublique(chemin)) router.replace('/');
  }, [pret, utilisateur, chemin, router]);

  if (!utilisateur) return null;

  return (
    <header className="top gutter">
      <div className="top-in">
        <Link href="/tendances" className="logo" aria-label="Tendances Sillage">
          <Comete />
          Sillage
        </Link>
        <NavEtapes />
        <Link
          href="/profil"
          className="prof"
          style={{ marginLeft: 'auto' }}
          title="Mon profil"
        >
          <span className="av" aria-hidden="true">
            {initiales(utilisateur.nom)}
          </span>
          <span className="note">
            {utilisateur.nom}
            {utilisateur.metier ? ` · ${utilisateur.metier}` : ''}
          </span>
        </Link>
        <button
          className="btn sm ghost"
          onClick={async () => {
            await deconnecter();
            router.replace('/');
          }}
        >
          Se déconnecter
        </button>
      </div>
    </header>
  );
}

// Contenu des pages privées : rien tant que la session n'est pas confirmée
export function Garde({ children }: { children: React.ReactNode }) {
  const { utilisateur, pret } = useSession();
  const chemin = usePathname();
  if (pagePublique(chemin)) return <>{children}</>;
  if (!pret || !utilisateur) return <p className="note view">Chargement…</p>;
  return <>{children}</>;
}

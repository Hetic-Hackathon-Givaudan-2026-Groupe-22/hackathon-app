'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { initiales, pagePublique, useSession } from '@/lib/session';
import { Comete } from './logo';
import { ChoixLangue } from './choix-langue';
import { NavEtapes } from './nav-etapes';

// En-tête du prototype ; renvoie à l'accueil toute personne non connectée (US-03)
export function EnTete() {
  const t = useTranslations();
  const { utilisateur, pret, deconnecter } = useSession();
  const chemin = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pret && !utilisateur && !pagePublique(chemin)) router.replace('/');
  }, [pret, utilisateur, chemin, router]);

  // US-07 : la langue choisie est gardée dans le compte, retrouvée à la reconnexion
  const locale = useLocale();
  const langueCompte = utilisateur?.langue;
  useEffect(() => {
    if (
      langueCompte &&
      (langueCompte === 'fr' || langueCompte === 'en') &&
      langueCompte !== locale
    ) {
      router.replace(chemin, { locale: langueCompte });
    }
  }, [langueCompte, locale, chemin, router]);

  if (!utilisateur) return null;

  return (
    <header className="top gutter">
      <div className="top-in">
        <Link
          href="/tendances"
          className="logo"
          aria-label={t('tendances_sillage')}
        >
          <Comete />
          Sillage
        </Link>
        <NavEtapes />
        <Link
          href="/profil"
          className="prof"
          style={{ marginLeft: 'auto' }}
          title={t('mon_profil')}
        >
          <span className="av" aria-hidden="true">
            {initiales(utilisateur.nom)}
          </span>
          <span className="note">
            {utilisateur.nom}
            {utilisateur.metier ? ` · ${utilisateur.metier}` : ''}
          </span>
        </Link>
        <ChoixLangue />
        <button
          className="btn sm ghost"
          onClick={async () => {
            await deconnecter();
            router.replace('/');
          }}
        >
          {t('se_deconnecter')}
        </button>
      </div>
    </header>
  );
}

// Contenu des pages privées : rien tant que la session n'est pas confirmée
export function Garde({ children }: { children: React.ReactNode }) {
  const t = useTranslations();
  const { utilisateur, pret } = useSession();
  const chemin = usePathname();
  if (pagePublique(chemin)) return <>{children}</>;
  if (!pret || !utilisateur)
    return <p className="note view">{t('chargement')}</p>;
  return <>{children}</>;
}

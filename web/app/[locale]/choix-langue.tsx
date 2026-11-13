'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { apiPatch } from '@/lib/api';
import { useSession, type Utilisateur } from '@/lib/session';

// Sélecteur FR / EN du prototype (US-07) : change l'URL (/fr, /en) avec next-intl,
// et enregistre la langue dans le compte pour la retrouver à la reconnexion
export function ChoixLangue() {
  const t = useTranslations();
  const locale = useLocale();
  const chemin = usePathname();
  const router = useRouter();
  const { utilisateur, setUtilisateur } = useSession();

  async function changer(l: (typeof routing.locales)[number]) {
    if (utilisateur) {
      setUtilisateur(await apiPatch<Utilisateur>('/moi', { langue: l }));
    }
    router.replace(chemin, { locale: l });
  }

  return (
    <div className="langsw" role="group" aria-label={t('langue')}>
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={locale === l}
          onClick={() => changer(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

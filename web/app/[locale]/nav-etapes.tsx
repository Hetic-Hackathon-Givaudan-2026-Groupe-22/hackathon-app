'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';

// Les étapes du parcours, comme dans le prototype ; l'étape courante est en noir
export function NavEtapes() {
  const t = useTranslations();
  const chemin = usePathname();
  const enAnalyse = chemin.startsWith('/analyses');
  return (
    <nav className="steps" aria-label={t('etapes')}>
      <Link
        href="/tendances"
        className="step"
        aria-current={chemin.startsWith('/tendances') ? 'page' : undefined}
      >
        {t('1_tendances')}
      </Link>
      <span className="step" aria-current={enAnalyse ? 'page' : undefined}>
        {t('2_analyse_et_verdict')}
      </span>
      <Link
        href="/historique"
        className="step"
        aria-current={chemin.startsWith('/historique') ? 'page' : undefined}
      >
        {t('3_historique')}
      </Link>
    </nav>
  );
}

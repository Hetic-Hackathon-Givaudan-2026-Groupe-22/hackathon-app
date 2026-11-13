'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { METIERS } from '@/lib/metiers';

// Liste des métiers, en pastilles du prototype (US-05)
export function ChoixMetier({
  valeur,
  onChange,
}: {
  valeur: string | null;
  onChange: (m: string) => void;
}) {
  const td = useTd();
  const t = useTranslations();
  return (
    <div className="famrow" role="radiogroup" aria-label={t('votre_metier')}>
      {METIERS.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          className="famt"
          aria-checked={valeur === m}
          onClick={() => onChange(m)}
        >
          {td(m)}
        </button>
      ))}
    </div>
  );
}

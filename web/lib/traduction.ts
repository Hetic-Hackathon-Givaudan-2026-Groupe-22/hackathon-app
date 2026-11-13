'use client';

import { useTranslations } from 'next-intl';
import cles from './cles-traduction.json';

// Texte venu des données ou d'une table de libellés (statut, famille, métier) :
// traduit s'il a une clé dans messages/*.json, laissé tel quel sinon (ADR 0016)
export function useTd() {
  const t = useTranslations();
  return (fr: string): string => {
    const cle = (cles as Record<string, string>)[fr];
    return cle && t.has(cle as never) ? t(cle as never) : fr;
  };
}

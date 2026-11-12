import type { TendanceResume } from './api';

// Filtres de la vue Tendances (US-11) : ils se cumulent
export type Filtres = {
  famille: string; // '' = toutes
  statut: string; // '' = tous
  suiviesSeulement: boolean;
};

export const SANS_FILTRE: Filtres = {
  famille: '',
  statut: '',
  suiviesSeulement: false,
};

export function filtrer(liste: TendanceResume[], f: Filtres): TendanceResume[] {
  return liste.filter(
    (t) =>
      (!f.famille || t.famille === f.famille) &&
      (!f.statut || t.statut === f.statut) &&
      (!f.suiviesSeulement || t.suivie),
  );
}

export function nombreFiltresActifs(f: Filtres): number {
  return [f.famille !== '', f.statut !== '', f.suiviesSeulement].filter(Boolean)
    .length;
}

// Valeurs proposées, tirées des tendances elles-mêmes, triées
export function valeursDe(
  liste: TendanceResume[],
  cle: 'famille' | 'statut',
): string[] {
  return [...new Set(liste.map((t) => t[cle]))].sort((a, b) =>
    a.localeCompare(b),
  );
}

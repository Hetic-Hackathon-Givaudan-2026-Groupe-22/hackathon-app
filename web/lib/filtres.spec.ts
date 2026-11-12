import { describe, expect, it } from 'vitest';
import type { TendanceResume } from './api';
import {
  filtrer,
  nombreFiltresActifs,
  SANS_FILTRE,
  valeursDe,
} from './filtres';

const t = (
  slug: string,
  famille: string,
  statut: string,
  suivie = false,
): TendanceResume => ({
  slug,
  nom: slug,
  famille,
  statut,
  suivie,
  dateDebut: '2024-01-01',
  origine: 'Paris',
  pays: [],
});

const liste = [
  t('pistache', 'Gourmand', 'en_hausse', true),
  t('dalgona', 'Gourmand', 'en_baisse'),
  t('yuzu', 'Agrume', 'en_hausse'),
  t('matcha', 'Végétal', 'stable', true),
];

describe('filtrer (US-11)', () => {
  it('sans filtre, tout reste', () => {
    expect(filtrer(liste, SANS_FILTRE)).toHaveLength(4);
  });

  it('les filtres se cumulent', () => {
    const r = filtrer(liste, {
      ...SANS_FILTRE,
      famille: 'Gourmand',
      statut: 'en_hausse',
    });
    expect(r.map((x) => x.slug)).toEqual(['pistache']);
  });

  it('« suivies seulement » garde les tendances suivies', () => {
    const r = filtrer(liste, { ...SANS_FILTRE, suiviesSeulement: true });
    expect(r.map((x) => x.slug)).toEqual(['pistache', 'matcha']);
  });

  it('compte les filtres actifs', () => {
    expect(nombreFiltresActifs(SANS_FILTRE)).toBe(0);
    expect(
      nombreFiltresActifs({
        famille: 'Agrume',
        statut: '',
        suiviesSeulement: true,
      }),
    ).toBe(2);
  });

  it('propose les valeurs présentes, triées, sans doublon', () => {
    expect(valeursDe(liste, 'famille')).toEqual([
      'Agrume',
      'Gourmand',
      'Végétal',
    ]);
  });
});

import { courbeSimulee, moisLibelle } from './courbe.js';

// Tests unitaires de la courbe simulée (US-22)
describe('courbeSimulee', () => {
  it('un point par mois demandé, du plus ancien au plus récent', () => {
    const c = courbeSimulee('pistache', 'en_hausse', 6);
    expect(c).toHaveLength(6);
    expect(c.at(-1)?.mois).toBe('2026-11');
    expect(c[0].mois).toBe('2026-06');
  });

  it('déterministe : la même tendance donne la même courbe', () => {
    expect(courbeSimulee('yuzu', 'en_hausse', 12)).toEqual(
      courbeSimulee('yuzu', 'en_hausse', 12),
    );
  });

  it('valeurs entre 0 et 100', () => {
    for (const p of courbeSimulee('dalgona', 'en_baisse', 24)) {
      expect(p.valeur).toBeGreaterThanOrEqual(0);
      expect(p.valeur).toBeLessThanOrEqual(100);
    }
  });

  it('une tendance en hausse finit plus haut qu’elle ne commence', () => {
    const c = courbeSimulee('pistache', 'en_hausse', 24);
    expect(c.at(-1)!.valeur).toBeGreaterThan(c[0].valeur);
  });

  it('un buzz retombe après son pic', () => {
    const c = courbeSimulee('dalgona', 'en_baisse', 24);
    const pic = Math.max(...c.map((p) => p.valeur));
    expect(c.at(-1)!.valeur).toBeLessThan(pic / 2);
  });
});

describe('moisLibelle', () => {
  it('recule de mois en mois en changeant d’année', () => {
    expect(moisLibelle(0)).toBe('2026-11');
    expect(moisLibelle(11)).toBe('2025-12');
    expect(moisLibelle(23)).toBe('2024-12');
  });
});

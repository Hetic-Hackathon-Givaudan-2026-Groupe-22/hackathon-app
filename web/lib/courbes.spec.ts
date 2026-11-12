import { describe, expect, it } from 'vitest';
import { basculerComparaison, cheminSvg, moisCourt } from './courbes';

describe('cheminSvg (US-22)', () => {
  it('de gauche à droite, 100 en haut et 0 en bas', () => {
    const d = cheminSvg(
      [
        { mois: '2026-10', valeur: 0 },
        { mois: '2026-11', valeur: 100 },
      ],
      200,
      100,
    );
    expect(d).toBe('M0,100 L200,0');
  });

  it('vide sans point', () => {
    expect(cheminSvg([], 100, 100)).toBe('');
  });
});

describe('moisCourt', () => {
  it('mois abrégé en français', () => {
    expect(moisCourt('2026-11')).toBe('nov. 26');
  });
});

describe('basculerComparaison (US-22)', () => {
  it('ajoute puis retire une tendance', () => {
    expect(basculerComparaison([], 'ube')).toEqual(['ube']);
    expect(basculerComparaison(['ube'], 'ube')).toEqual([]);
  });

  it('jamais plus de 2 tendances à comparer', () => {
    expect(basculerComparaison(['ube', 'yuzu'], 'matcha')).toEqual([
      'ube',
      'yuzu',
    ]);
  });
});

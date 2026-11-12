import { describe, expect, it } from 'vitest';
import { couleurAgent, sieges, STATUT_AGENT, tousTermines } from './agents';

describe('STATUT_AGENT (US-15)', () => {
  it('nomme les trois statuts', () => {
    expect(Object.values(STATUT_AGENT).map((s) => s.libelle)).toEqual([
      'En attente',
      'En cours',
      'Terminé',
    ]);
  });
});

describe('tousTermines', () => {
  const agent = (statut: 'en_attente' | 'en_cours' | 'termine') => ({
    nom: 'A',
    role: 'r',
    statut,
  });

  it('vrai seulement si chaque agent a terminé', () => {
    expect(tousTermines([agent('termine'), agent('termine')])).toBe(true);
    expect(tousTermines([agent('termine'), agent('en_cours')])).toBe(false);
  });

  it('faux sans agent', () => {
    expect(tousTermines([])).toBe(false);
  });
});

describe('sieges', () => {
  it('le premier agent est en haut, au centre', () => {
    expect(sieges(5)[0]).toEqual([50, 13]);
  });

  it('chaque siège reste dans le cadre', () => {
    for (const [x, y] of sieges(5)) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
  });
});

describe('couleurAgent', () => {
  it('une couleur par agent, grise sinon', () => {
    expect(couleurAgent('Veilleur')).toBe('169,184,245');
    expect(couleurAgent('Inconnu')).toBe('201,204,214');
  });
});

import { describe, expect, it } from 'vitest';
import { STATUT_AGENT, tousTermines } from './agents';

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

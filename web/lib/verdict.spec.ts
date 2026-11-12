import { describe, expect, it } from 'vitest';
import type { Verdict } from './analyse';
import { FIABILITE, libelleVerdict, verdictRetenu } from './verdict';

const verdict = (v: Partial<Verdict> = {}): Verdict => ({
  propose: 'durable',
  score: 78,
  fiabilite: 'elevee',
  explicationFiabilite: 'Repose sur 5 sources',
  raisons: [],
  reserve: null,
  statut: 'propose',
  final: null,
  justification: null,
  decidePar: null,
  decideLe: null,
  ...v,
});

describe('libelleVerdict (US-23)', () => {
  it('le verdict en un mot', () => {
    expect(libelleVerdict('buzz')).toBe('Buzz');
    expect(libelleVerdict('durable')).toBe('Durable');
  });
});

describe('FIABILITE (US-23)', () => {
  it('trois niveaux : faible, moyenne, élevée', () => {
    expect(Object.values(FIABILITE).map((f) => f.libelle)).toEqual([
      'Fiabilité faible',
      'Fiabilité moyenne',
      'Fiabilité élevée',
    ]);
  });
});

describe('verdictRetenu (US-26)', () => {
  it('le verdict de Sillage tant qu’il n’est pas modifié', () => {
    expect(verdictRetenu(verdict())).toBe('durable');
    expect(verdictRetenu(verdict({ statut: 'valide' }))).toBe('durable');
  });

  it('le verdict de Camille une fois modifié', () => {
    expect(verdictRetenu(verdict({ statut: 'modifie', final: 'buzz' }))).toBe(
      'buzz',
    );
  });
});

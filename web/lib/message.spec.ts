import { describe, expect, it } from 'vitest';
import type { Message } from './analyse';
import { argumentCite, STATUT_MESSAGE } from './message';

const msg = (tour: number, repondA: number | null): Message => ({
  tour,
  agent: `Agent ${tour}`,
  repondA,
  relation: repondA ? 'objecte' : null,
  contenu: `argument ${tour}`,
  statut: 'etabli',
  position: 50,
  sources: [],
});

describe('argumentCite (US-17)', () => {
  const messages = [msg(1, null), msg(2, 1)];

  it('retrouve l’argument auquel le message répond', () => {
    expect(argumentCite(messages, messages[1])?.contenu).toBe('argument 1');
  });

  it('rien à citer pour un message qui ne répond à personne', () => {
    expect(argumentCite(messages, messages[0])).toBeUndefined();
  });
});

describe('STATUT_MESSAGE (US-17)', () => {
  it('nomme les trois statuts', () => {
    expect(Object.values(STATUT_MESSAGE).map((s) => s.libelle)).toEqual([
      'Établi',
      'Contesté',
      'Ouvert',
    ]);
  });
});

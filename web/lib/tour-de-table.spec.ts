import { describe, expect, it } from 'vitest';
import type { Message } from './analyse';
import {
  agentCible,
  ecart,
  positionsAuTour,
  RELATION,
  tourPrecedent,
  tourSuivant,
} from './tour-de-table';

const msg = (
  tour: number,
  agent: string,
  position: number,
  repondA: number | null = null,
): Message => ({
  tour,
  agent,
  position,
  repondA,
  relation: repondA ? 'objecte' : null,
  contenu: `message ${tour}`,
  statut: 'etabli',
  sources: [],
});

const messages = [
  msg(1, 'Veilleur', 90),
  msg(2, 'Sceptique', 40, 1),
  msg(3, 'Veilleur', 70, 2),
];

describe('agentCible (US-16)', () => {
  it('nomme l’agent auquel le message répond', () => {
    expect(agentCible(messages, messages[1])).toBe('Veilleur');
    expect(agentCible(messages, messages[0])).toBeUndefined();
  });
});

describe('positionsAuTour et ecart (US-16)', () => {
  it('ne compte que les tours déjà joués', () => {
    expect([...positionsAuTour(messages, 1)]).toEqual([['Veilleur', 90]]);
  });

  it('garde la dernière position de chaque agent', () => {
    expect(positionsAuTour(messages, 3).get('Veilleur')).toBe(70);
  });

  it('l’écart se met à jour à chaque tour', () => {
    expect(ecart(positionsAuTour(messages, 1))).toBe(0);
    expect(ecart(positionsAuTour(messages, 2))).toBe(50);
    expect(ecart(positionsAuTour(messages, 3))).toBe(30);
  });
});

describe('lecture (US-16)', () => {
  it('Suivant s’arrête au dernier tour, Précédent au premier', () => {
    expect(tourSuivant(6, 7)).toBe(7);
    expect(tourSuivant(7, 7)).toBe(7);
    expect(tourPrecedent(2)).toBe(1);
    expect(tourPrecedent(1)).toBe(1);
  });

  it('traduit les relations', () => {
    expect(RELATION.objecte).toBe('objecte à');
  });
});

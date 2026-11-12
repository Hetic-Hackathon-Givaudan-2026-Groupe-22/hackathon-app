import { describe, expect, it } from 'vitest';
import type { Analyse, Message } from './analyse';
import { raisonsDetaillees } from './raisons';

const msg = (tour: number, avecSource: boolean): Message => ({
  tour,
  agent: `Agent ${tour}`,
  repondA: null,
  relation: null,
  contenu: `argument ${tour}`,
  statut: 'etabli',
  position: 50,
  sources: avecSource
    ? [
        {
          titre: 't',
          editeur: 'Financial Times',
          date: '19/04/2025',
          url: null,
          verifiee: true,
        },
      ]
    : [],
});

const analyse = (tours: number[]): Analyse => ({
  id: 1,
  mode: 'dummy',
  perimetre: {
    tendance: { slug: 'p', nom: 'P' },
    marche: 'Europe',
    periode: '24 mois',
  },
  demarreeLe: '',
  dureeMs: 0,
  ecouleMs: 0,
  statut: 'terminee',
  agents: [],
  messages: [msg(1, true), msg(2, false), msg(3, true), msg(4, true)],
  verdict: {
    propose: 'durable',
    score: 70,
    fiabilite: 'moyenne',
    explicationFiabilite: '',
    raisons: tours.map((t) => ({ texte: `raison ${t}`, messageTour: t })),
    reserve: null,
    statut: 'propose',
    final: null,
    justification: null,
    decidePar: null,
    decideLe: null,
  },
});

describe('raisonsDetaillees (US-24)', () => {
  it('relie chaque raison à l’agent et à la source de son argument', () => {
    const [r] = raisonsDetaillees(analyse([1]));
    expect(r.message.agent).toBe('Agent 1');
    expect(r.source).toBe('Financial Times, 19/04/2025');
  });

  it('argument sans source : source nulle (« Source à compléter »)', () => {
    expect(raisonsDetaillees(analyse([2]))[0].source).toBeNull();
  });

  it('au plus 3 raisons', () => {
    expect(raisonsDetaillees(analyse([1, 2, 3, 4]))).toHaveLength(3);
  });

  it('ignore une raison dont l’argument est introuvable', () => {
    expect(raisonsDetaillees(analyse([9]))).toEqual([]);
  });
});

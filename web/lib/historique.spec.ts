import { describe, expect, it } from 'vitest';
import {
  type Decision,
  ecartStratege,
  filtrerDecisions,
  SANS_FILTRE_HISTORIQUE,
} from './historique';

const d = (
  propose: 'buzz' | 'durable',
  retenu: 'buzz' | 'durable',
): Decision => ({
  analyseId: 1,
  tendance: { slug: 'pistache', nom: 'Pistache' },
  propose,
  retenu,
  statut: propose === retenu ? 'valide' : 'modifie',
  score: 78,
  justification: null,
  decidePar: 'Camille',
  decideLe: '2026-11-12T10:00:00Z',
});

describe('ecartStratege (US-30)', () => {
  it('aucun écart quand la décision suit le Stratège', () => {
    expect(ecartStratege(d('durable', 'durable'))).toBe('Aucun');
  });

  it('verdict changé sinon', () => {
    expect(ecartStratege(d('durable', 'buzz'))).toBe('Verdict changé');
  });
});

describe('filtrerDecisions (US-31)', () => {
  const liste: Decision[] = [
    {
      ...d('durable', 'durable'),
      analyseId: 1,
      decideLe: '2026-11-02T09:00:00Z',
    },
    {
      ...d('durable', 'buzz'),
      analyseId: 2,
      tendance: { slug: 'matcha', nom: 'Matcha' },
      decideLe: '2026-11-10T09:00:00Z',
    },
    { ...d('buzz', 'buzz'), analyseId: 3, decideLe: '2026-11-12T09:00:00Z' },
  ];
  const ids = (l: Decision[]) => l.map((x) => x.analyseId);

  it('sans filtre, tout l’historique', () => {
    expect(ids(filtrerDecisions(liste, SANS_FILTRE_HISTORIQUE))).toEqual([
      1, 2, 3,
    ]);
  });

  it('par tendance', () => {
    expect(
      ids(
        filtrerDecisions(liste, {
          ...SANS_FILTRE_HISTORIQUE,
          tendance: 'pistache',
        }),
      ),
    ).toEqual([1, 3]);
  });

  it('par période, dates incluses', () => {
    expect(
      ids(
        filtrerDecisions(liste, {
          tendance: '',
          du: '2026-11-10',
          au: '2026-11-12',
        }),
      ),
    ).toEqual([2, 3]);
    expect(
      ids(filtrerDecisions(liste, { tendance: '', du: '', au: '2026-11-02' })),
    ).toEqual([1]);
  });

  it('tendance et période se cumulent', () => {
    expect(
      ids(
        filtrerDecisions(liste, {
          tendance: 'pistache',
          du: '2026-11-05',
          au: '',
        }),
      ),
    ).toEqual([3]);
  });
});

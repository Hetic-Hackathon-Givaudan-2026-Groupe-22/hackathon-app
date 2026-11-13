import { describe, expect, it } from 'vitest';
import { type Decision, ecartStratege } from './historique';

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

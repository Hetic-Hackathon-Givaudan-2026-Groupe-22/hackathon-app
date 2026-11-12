import { describe, expect, it } from 'vitest';
import type { Analyse } from './analyse';
import { etapesChaine } from './chaine';

const analyse = (chaine?: Analyse['chaine']): Analyse => ({
  id: 1,
  mode: 'dummy',
  perimetre: {
    tendance: { slug: 'pistache', nom: 'Pistache' },
    marche: 'Europe',
    periode: '24 derniers mois',
  },
  demarreeLe: '2026-11-12T00:00:00Z',
  dureeMs: 0,
  ecouleMs: 0,
  statut: 'terminee',
  agents: [],
  chaine,
});

describe('etapesChaine (US-20)', () => {
  const chaine = {
    notes: [{ nom: 'Verte', detail: 'd', source: 'Référentiel' }],
    matieres: [{ nom: 'Pistache', detail: 'd', source: 'USDA' }],
    prix: [
      {
        nom: 'Pistache',
        detail: '7,65 $ puis 10,30 $ la livre',
        source: 'Financial Times, 19/04/2025',
      },
    ],
  };

  it('4 maillons dans l’ordre tendance, notes, matières, prix', () => {
    expect(etapesChaine(analyse(chaine)).map((e) => e.titre)).toEqual([
      'Tendance',
      'Notes olfactives',
      'Matières',
      'Prix',
    ]);
  });

  it('chaque maillon indique sa source', () => {
    for (const etape of etapesChaine(analyse(chaine))) {
      for (const m of etape.maillons) expect(m.source).toBeTruthy();
    }
  });

  it('rien tant que l’analyse n’a pas de chaîne', () => {
    expect(etapesChaine(analyse())).toEqual([]);
  });
});

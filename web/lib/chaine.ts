import type { Analyse, Maillon } from './analyse';

export type EtapeChaine = { titre: string; maillons: Maillon[] };

// Les 4 maillons de la chaîne : tendance, notes olfactives, matières, prix (US-20)
export function etapesChaine(analyse: Analyse): EtapeChaine[] {
  const c = analyse.chaine;
  if (!c) return [];
  return [
    {
      titre: 'Tendance',
      maillons: [
        {
          nom: analyse.perimetre.tendance.nom,
          detail: `${analyse.perimetre.marche}, ${analyse.perimetre.periode}`,
          source: 'Fiche de la tendance (signaux Google Trends, Mintel)',
        },
      ],
    },
    { titre: 'Notes olfactives', maillons: c.notes },
    { titre: 'Matières', maillons: c.matieres },
    { titre: 'Prix', maillons: c.prix },
  ];
}

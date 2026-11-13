// Historique des décisions (US-30, US-31)

export type Decision = {
  analyseId: number;
  tendance: { slug: string; nom: string };
  propose: 'buzz' | 'durable';
  retenu: 'buzz' | 'durable';
  statut: 'valide' | 'modifie';
  score: number;
  justification: string | null;
  decidePar: string | null;
  decideLe: string;
};

// Écart avec le Stratège : la décision suit-elle la proposition ?
export function ecartStratege(d: Decision): string {
  return d.retenu === d.propose ? 'Aucun' : 'Verdict changé';
}

export type FiltresHistorique = { tendance: string; du: string; au: string };

export const SANS_FILTRE_HISTORIQUE: FiltresHistorique = {
  tendance: '',
  du: '',
  au: '',
};

// US-31 : par tendance et par période (dates incluses, AAAA-MM-JJ)
export function filtrerDecisions(
  liste: Decision[],
  f: FiltresHistorique,
): Decision[] {
  return liste.filter((d) => {
    const jour = d.decideLe.slice(0, 10);
    return (
      (!f.tendance || d.tendance.slug === f.tendance) &&
      (!f.du || jour >= f.du) &&
      (!f.au || jour <= f.au)
    );
  });
}

import type { Verdict } from './analyse';

// Le verdict en un mot (US-23)
export function libelleVerdict(v: 'buzz' | 'durable'): string {
  return v === 'buzz' ? 'Buzz' : 'Durable';
}

export const FIABILITE: Record<
  Verdict['fiabilite'],
  { libelle: string; chip: string }
> = {
  faible: { libelle: 'Fiabilité faible', chip: 'risk' },
  moyenne: { libelle: 'Fiabilité moyenne', chip: 'wait' },
  elevee: { libelle: 'Fiabilité élevée', chip: 'go' },
};

// Verdict retenu : celui de Camille s'il l'a modifié, sinon celui de Sillage
export function verdictRetenu(v: Verdict): 'buzz' | 'durable' {
  return v.statut === 'modifie' && v.final ? v.final : v.propose;
}

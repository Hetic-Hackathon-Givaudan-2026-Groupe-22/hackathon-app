import type { Verdict } from './analyse';

// Le verdict en un mot (US-23)
export function libelleVerdict(v: 'buzz' | 'durable'): string {
  return v === 'buzz' ? 'Buzz' : 'Durable';
}

export const FIABILITE: Record<
  Verdict['fiabilite'],
  { libelle: string; badge: string }
> = {
  faible: { libelle: 'Fiabilité faible', badge: 'badge-error' },
  moyenne: { libelle: 'Fiabilité moyenne', badge: 'badge-warning' },
  elevee: { libelle: 'Fiabilité élevée', badge: 'badge-success' },
};

// Verdict retenu : celui de Camille s'il l'a modifié, sinon celui de Sillage
export function verdictRetenu(v: Verdict): 'buzz' | 'durable' {
  return v.statut === 'modifie' && v.final ? v.final : v.propose;
}

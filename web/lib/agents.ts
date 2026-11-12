import type { Agent } from './analyse';

// Libellé et couleur daisyUI du statut d'un agent (US-15)
export const STATUT_AGENT: Record<
  Agent['statut'],
  { libelle: string; badge: string }
> = {
  en_attente: { libelle: 'En attente', badge: 'badge-ghost' },
  en_cours: { libelle: 'En cours', badge: 'badge-info' },
  termine: { libelle: 'Terminé', badge: 'badge-success' },
};

export function tousTermines(agents: Agent[]): boolean {
  return agents.length > 0 && agents.every((a) => a.statut === 'termine');
}

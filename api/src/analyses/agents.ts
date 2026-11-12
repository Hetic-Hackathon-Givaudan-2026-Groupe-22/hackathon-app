// Les 5 agents du tour de table, dans leur ordre de démarrage (US-14, US-15)
export const AGENTS = [
  { nom: 'Veilleur', role: 'Repère les signaux de hausse' },
  { nom: 'Sceptique', role: 'Cherche les signes d’un buzz passager' },
  { nom: 'Historien', role: 'Compare aux tendances passées' },
  { nom: 'Acheteur', role: 'Mesure l’enjeu matières et prix' },
  { nom: 'Stratège', role: 'Propose le verdict' },
] as const;

export type StatutAgent = 'en_attente' | 'en_cours' | 'termine';

// Statut de chaque agent selon le temps écoulé (fonction pure, testée).
// L'agent i démarre à i/6 de la durée et travaille pendant 2/6 :
// le dernier finit exactement à la fin de l'analyse.
export function statutsAgents(ecouleMs: number, dureeMs: number) {
  const tranche = dureeMs / 6;
  return AGENTS.map((agent, i) => {
    const debut = i * tranche;
    const fin = Math.min(dureeMs, debut + 2 * tranche);
    let statut: StatutAgent = 'en_attente';
    if (ecouleMs >= fin) statut = 'termine';
    else if (ecouleMs >= debut) statut = 'en_cours';
    return { ...agent, statut };
  });
}

import type { Agent } from './analyse';

// Libellé et style du statut d'un agent (US-15)
export const STATUT_AGENT: Record<
  Agent['statut'],
  { libelle: string; classe: string }
> = {
  en_attente: { libelle: 'En attente', classe: '' },
  en_cours: { libelle: 'En cours', classe: 'run' },
  termine: { libelle: 'Terminé', classe: 'fin' },
};

export function tousTermines(agents: Agent[]): boolean {
  return agents.length > 0 && agents.every((a) => a.statut === 'termine');
}

// Couleur de chaque agent autour de la table (palette du prototype)
const COULEURS: Record<string, string> = {
  Veilleur: '169,184,245',
  Sceptique: '244,166,183',
  Historien: '142,214,184',
  Acheteur: '246,195,94',
  Stratège: '150,156,172',
};

export function couleurAgent(nom: string): string {
  return COULEURS[nom] ?? '201,204,214';
}

// Place des n agents autour de la table ovale, en % du cadre, le premier en haut
export function sieges(n: number): [number, number][] {
  return Array.from({ length: n }, (_, i) => {
    const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
    return [
      Math.round((50 + 39 * Math.cos(a)) * 10) / 10,
      Math.round((50 + 37 * Math.sin(a)) * 10) / 10,
    ];
  });
}

// Types et affichages du plan d'action (US-27)

export type Action = {
  texte: string;
  qui: string;
  echeance: string;
  priorite: 'Haute' | 'Moyenne' | 'Basse';
};

export type Equipe = {
  cle: string;
  nom: string;
  destinataire: string;
  urgence: string;
  conclusion: string;
  actions: Action[];
};

export type Plan = {
  tendance: string;
  verdict: 'buzz' | 'durable';
  decideLe: string;
  equipes: Equipe[];
  disponibles: { cle: string; nom: string }[];
};

export const CHIP_PRIORITE: Record<Action['priorite'], string> = {
  Haute: 'risk',
  Moyenne: 'wait',
  Basse: 'off',
};

export function chipUrgence(urgence: string): string {
  if (urgence === 'Urgent') return 'risk';
  if (urgence === 'Cette semaine') return 'wait';
  return 'off';
}

// Icône d'équipe du prototype : une lettre sur un fond pastel
const ICONES: Record<string, [string, string]> = {
  achats: ['A', '#FFF4D6'],
  commerciaux: ['C', '#E3EEFF'],
  marketing: ['M', '#FDE3EA'],
  labos: ['L', '#DDF3E8'],
  qualite: ['Q', '#F1F2F6'],
  finance: ['F', '#E8ECFB'],
  supply: ['S', '#E2F1FB'],
  region: ['D', '#F4E8FA'],
};

export function iconeEquipe(cle: string): [string, string] {
  return ICONES[cle] ?? ['·', '#F1F2F6'];
}

// « 2026-11-19 » -> « 19/11 »
export function jourMois(iso: string): string {
  const [, m, j] = iso.split('-');
  return `${j}/${m}`;
}

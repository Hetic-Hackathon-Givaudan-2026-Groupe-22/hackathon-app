// Couleur pastel de chaque famille d'arômes (palette du prototype, ADR 0011)
const FAMILLES: Record<string, string> = {
  gourmand: '246,195,94',
  agrume: '244,166,183',
  fruite: '244,166,183',
  vegetal: '142,214,184',
  vert: '142,214,184',
  floral: '169,184,245',
};

export const ETEINT = '201,204,214';

function cle(famille: string): string {
  return famille.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// « Végétal » -> « 142,214,184 », à utiliser dans rgb(…) ou rgba(…, alpha)
export function couleurFamille(famille: string): string {
  return FAMILLES[cle(famille)] ?? ETEINT;
}

// Pastille de statut d'une tendance (US-09)
const STATUTS: Record<string, { libelle: string; chip: string }> = {
  emergente: { libelle: 'Émergente', chip: 'wait' },
  en_hausse: { libelle: 'En hausse', chip: 'go' },
  stable: { libelle: 'Stable', chip: 'off' },
  en_baisse: { libelle: 'En baisse', chip: 'risk' },
};

export function statutTendance(statut: string) {
  return STATUTS[statut] ?? { libelle: statut, chip: 'off' };
}

// Légende (US-12) : une entrée par couleur, toujours accompagnée de son nom
export const LEGENDE_FAMILLES = ['Gourmand', 'Agrume', 'Végétal', 'Floral'];

export const LEGENDE_STATUTS = [
  'emergente',
  'en_hausse',
  'stable',
  'en_baisse',
].map(statutTendance);

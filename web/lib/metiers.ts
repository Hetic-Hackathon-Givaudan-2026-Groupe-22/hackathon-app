// Les métiers proposés (US-05), les mêmes que dans l'API (compte.service.ts)
export const METIERS = [
  'Consumer Insights',
  'Marketing',
  'Achats',
  'Aromaticien',
  'Parfumeur',
  'Développement produit',
  'Direction',
] as const;

export type Metier = (typeof METIERS)[number];

// Tracé des courbes de la vue Rejouer (US-22), sans bibliothèque

export type Point = { mois: string; valeur: number };
export type Courbe = { slug: string; nom: string; points: Point[] };

// Chemin SVG d'une courbe (valeurs 0 à 100) dans un cadre largeur × hauteur
export function cheminSvg(
  points: Point[],
  largeur: number,
  hauteur: number,
): string {
  if (points.length === 0) return '';
  const pas = points.length > 1 ? largeur / (points.length - 1) : 0;
  return points
    .map((p, i) => {
      const x = Math.round(i * pas * 10) / 10;
      const y = Math.round((hauteur - (p.valeur / 100) * hauteur) * 10) / 10;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

// « 2026-11 » -> « nov. 26 »
export function moisCourt(mois: string): string {
  const [a, m] = mois.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, 1)).toLocaleDateString('fr-FR', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}

export const PERIODES = [6, 12, 24] as const;
export const COMPARAISONS_MAX = 2;

// Ajoute ou retire une tendance à comparer, sans dépasser le maximum
export function basculerComparaison(
  choisies: string[],
  slug: string,
): string[] {
  if (choisies.includes(slug)) return choisies.filter((s) => s !== slug);
  if (choisies.length >= COMPARAISONS_MAX) return choisies;
  return [...choisies, slug];
}

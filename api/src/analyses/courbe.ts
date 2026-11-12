// Courbe de recherches simulée (ADR 0005) pour la vue Rejouer (US-22) :
// déterministe, la même tendance donne toujours la même courbe.

export type Point = { mois: string; valeur: number };

// Dernier mois de données de la démonstration
const FIN = { annee: 2026, mois: 11 };

function graine(texte: string): number {
  let h = 2166136261;
  for (const c of texte) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

// Forme de la courbe selon le statut, x de 0 (début des 24 mois) à 1 (aujourd'hui)
function forme(statut: string, x: number): number {
  switch (statut) {
    case 'en_hausse':
      return 20 + 70 * x ** 1.4;
    case 'emergente':
      return 8 + 80 * x ** 3;
    case 'en_baisse':
      // Pic brutal vers le premier tiers, puis retombée
      return 10 + 85 * Math.exp(-(((x - 0.3) / 0.08) ** 2)) + 5 * x;
    default:
      return 55 + 10 * Math.sin(x * Math.PI * 4);
  }
}

export function moisLibelle(decalage: number): string {
  const total = FIN.annee * 12 + (FIN.mois - 1) - decalage;
  const annee = Math.floor(total / 12);
  const mois = (total % 12) + 1;
  return `${annee}-${String(mois).padStart(2, '0')}`;
}

// Les N derniers mois (6, 12 ou 24), valeurs de 0 à 100
export function courbeSimulee(
  slug: string,
  statut: string,
  mois: number,
): Point[] {
  const g = graine(slug);
  const points: Point[] = [];
  for (let i = mois - 1; i >= 0; i--) {
    const x = (24 - 1 - i) / (24 - 1);
    const bruit = (((g >>> (i % 24)) & 15) - 7.5) * 0.6;
    const valeur = Math.max(
      0,
      Math.min(100, Math.round(forme(statut, x) + bruit)),
    );
    points.push({ mois: moisLibelle(i), valeur });
  }
  return points;
}

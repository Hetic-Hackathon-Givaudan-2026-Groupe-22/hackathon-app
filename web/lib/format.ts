// Affichages partagés par les écrans

// 75 000 ms -> « 01:15 » (chronomètre de l'analyse, US-14)
export function formatChrono(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const min = String(Math.floor(total / 60)).padStart(2, '0');
  const sec = String(total % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

// « 2023-09-01 » -> « sept. 2023 »
export function formatMois(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('fr-FR', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

const STATUTS: Record<string, string> = {
  emergente: 'Émergente',
  en_hausse: 'En hausse',
  stable: 'Stable',
  en_baisse: 'En baisse',
};

export function libelleStatut(statut: string): string {
  return STATUTS[statut] ?? statut;
}

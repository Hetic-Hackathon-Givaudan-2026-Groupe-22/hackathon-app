import type { Message } from './analyse';

// Logique du tour de table (US-16), sans affichage : testée à part

export const RELATION: Record<NonNullable<Message['relation']>, string> = {
  objecte: 'objecte à',
  nuance: 'nuance',
  repond: 'répond à',
};

// Agent dont le message est cité par celui-ci
export function agentCible(
  messages: Message[],
  m: Message,
): string | undefined {
  if (m.repondA === null) return undefined;
  return messages.find((x) => x.tour === m.repondA)?.agent;
}

// Position de chaque agent ayant parlé jusqu'au tour donné (0 = buzz, 100 = durable)
export function positionsAuTour(
  messages: Message[],
  tour: number,
): Map<string, number> {
  const positions = new Map<string, number>();
  for (const m of [...messages].sort((a, b) => a.tour - b.tour)) {
    if (m.tour > tour) break;
    positions.set(m.agent, m.position);
  }
  return positions;
}

// Écart entre la position la plus « buzz » et la plus « durable »
export function ecart(positions: Map<string, number>): number {
  const valeurs = [...positions.values()];
  return valeurs.length < 2 ? 0 : Math.max(...valeurs) - Math.min(...valeurs);
}

// Tour suivant de la lecture : s'arrête au dernier
export function tourSuivant(courant: number, dernier: number): number {
  return Math.min(courant + 1, dernier);
}

export function tourPrecedent(courant: number): number {
  return Math.max(courant - 1, 1);
}

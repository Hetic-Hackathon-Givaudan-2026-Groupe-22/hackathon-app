import type { Message } from './analyse';

// Statut d'une prise de parole (US-17)
export const STATUT_MESSAGE: Record<
  Message['statut'],
  { libelle: string; badge: string }
> = {
  etabli: { libelle: 'Établi', badge: 'badge-success' },
  conteste: { libelle: 'Contesté', badge: 'badge-error' },
  ouvert: { libelle: 'Ouvert', badge: 'badge-warning' },
};

// Argument auquel le message répond, cité dans le détail (US-17)
export function argumentCite(
  messages: Message[],
  m: Message,
): Message | undefined {
  if (m.repondA === null) return undefined;
  return messages.find((x) => x.tour === m.repondA);
}

import type { Message } from './analyse';

// Statut d'une prise de parole (US-17), en pastille du prototype
export const STATUT_MESSAGE: Record<
  Message['statut'],
  { libelle: string; chip: string }
> = {
  etabli: { libelle: 'Établi', chip: 'go' },
  conteste: { libelle: 'Contesté', chip: 'risk' },
  ouvert: { libelle: 'Ouvert', chip: 'wait' },
};

// Argument auquel le message répond, cité dans le détail (US-17)
export function argumentCite(
  messages: Message[],
  m: Message,
): Message | undefined {
  if (m.repondA === null) return undefined;
  return messages.find((x) => x.tour === m.repondA);
}

import type { Analyse, Message } from './analyse';

export type RaisonDetaillee = {
  texte: string;
  message: Message;
  // Première source de l'argument, ou null : « Source à compléter »
  source: string | null;
};

// Au plus 3 raisons, chacune reliée à l'argument d'un agent et à sa source (US-24)
export function raisonsDetaillees(analyse: Analyse): RaisonDetaillee[] {
  const messages = analyse.messages ?? [];
  return (analyse.verdict?.raisons ?? [])
    .map((r) => {
      const message = messages.find((m) => m.tour === r.messageTour);
      if (!message) return null;
      const s = message.sources[0];
      return {
        texte: r.texte,
        message,
        source: s ? `${s.editeur}, ${s.date}` : null,
      };
    })
    .filter((r): r is RaisonDetaillee => r !== null)
    .slice(0, 3);
}

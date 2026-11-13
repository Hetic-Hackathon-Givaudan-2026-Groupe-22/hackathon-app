import type { Analyse, Message, Source } from './analyse';

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

// US-32 : les sources des arguments retenus par le verdict, sans doublon
export function sourcesDuVerdict(analyse: Analyse): Source[] {
  const vues = new Set<string>();
  const liste: Source[] = [];
  for (const r of raisonsDetaillees(analyse)) {
    for (const s of r.message.sources) {
      const cle = `${s.titre}|${s.editeur}|${s.date}`;
      if (vues.has(cle)) continue;
      vues.add(cle);
      liste.push(s);
    }
  }
  return liste;
}

'use client';

import type { Message } from '@/lib/analyse';
import { argumentCite, STATUT_MESSAGE } from '@/lib/message';
import { ListeSources } from './liste-sources';

// US-17 : le message complet d'un agent, son statut et l'argument auquel il répond,
// dans le tiroir latéral du prototype
export function DetailMessage({
  messages,
  message,
  onFermer,
}: {
  messages: Message[];
  message: Message | null;
  onFermer: () => void;
}) {
  if (!message) return null;
  const cite = argumentCite(messages, message);
  const statut = STATUT_MESSAGE[message.statut];

  return (
    <>
      <button
        className="drawer-bg"
        aria-label="Fermer le message"
        onClick={onFermer}
      />
      <aside
        className="drawer on"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titre-message"
        onKeyDown={(e) => e.key === 'Escape' && onFermer()}
      >
        <button className="x" onClick={onFermer} autoFocus>
          Fermer
        </button>
        <div className="eyebrow">Tour {message.tour}</div>
        <div className="sx-h">
          <h3 id="titre-message" style={{ fontSize: 20 }}>
            {message.agent}
          </h3>
          <span className={`chip ${statut.chip}`}>{statut.libelle}</span>
        </div>

        {cite && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              En réponse à {cite.agent} (tour {cite.tour})
            </div>
            <blockquote className="sx-q">« {cite.contenu} »</blockquote>
          </div>
        )}

        <p style={{ margin: 0 }}>{message.contenu}</p>

        <ListeSources key={message.tour} sources={message.sources} />
      </aside>
    </>
  );
}

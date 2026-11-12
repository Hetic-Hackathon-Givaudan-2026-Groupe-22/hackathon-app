'use client';

import type { Message } from '@/lib/analyse';
import { argumentCite, STATUT_MESSAGE } from '@/lib/message';
import { ListeSources } from './liste-sources';

// US-17 : le message complet d'un agent, son statut et l'argument auquel il répond
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
    <dialog
      open
      className="modal modal-bottom sm:modal-middle"
      aria-labelledby="titre-message"
      onClose={onFermer}
    >
      <div className="modal-box flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="titre-message" className="text-lg font-semibold">
            {message.agent}
          </h2>
          <span className="text-sm opacity-70">tour {message.tour}</span>
          <span className={`badge ${statut.badge}`}>{statut.libelle}</span>
        </div>

        {cite && (
          <blockquote className="border-l-4 border-base-300 pl-3 text-sm opacity-80">
            <p className="font-semibold">
              En réponse à {cite.agent} (tour {cite.tour}) :
            </p>
            <p>« {cite.contenu} »</p>
          </blockquote>
        )}

        <p>{message.contenu}</p>

        <ListeSources key={message.tour} sources={message.sources} />

        <div className="modal-action">
          <button className="btn" onClick={onFermer} autoFocus>
            Fermer
          </button>
        </div>
      </div>
      <button
        className="modal-backdrop"
        aria-label="Fermer"
        onClick={onFermer}
      />
    </dialog>
  );
}

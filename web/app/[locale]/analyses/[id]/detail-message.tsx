'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
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
  const td = useTd();
  const t = useTranslations();
  if (!message) return null;
  const cite = argumentCite(messages, message);
  const statut = STATUT_MESSAGE[message.statut];

  return (
    <>
      <button
        className="drawer-bg"
        aria-label={t('fermer_le_message')}
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
          {t('fermer')}
        </button>
        <div className="eyebrow">
          {t('tour_3')} {message.tour}
        </div>
        <div className="sx-h">
          <h3 id="titre-message" style={{ fontSize: 20 }}>
            {message.agent}
          </h3>
          <span className={`chip ${statut.chip}`}>{td(statut.libelle)}</span>
        </div>

        {cite && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              {t('en_reponse_a')} {cite.agent} {t('tour')} {cite.tour})
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

'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import type { Analyse, Message } from '@/lib/analyse';
import { raisonsDetaillees } from '@/lib/raisons';
import { libelleVerdict } from '@/lib/verdict';

// US-24 : les raisons du verdict, reliées aux arguments des agents ; la réserve reste visible
export function RaisonsVerdict({
  analyse,
  onOuvrir,
}: {
  analyse: Analyse;
  onOuvrir: (m: Message) => void;
}) {
  const td = useTd();
  const t = useTranslations();
  const raisons = raisonsDetaillees(analyse);
  const v = analyse.verdict;

  return (
    <section
      aria-labelledby="titre-raisons"
      style={{ display: 'grid', gap: 12 }}
    >
      <h3 id="titre-raisons">
        {t('pourquoi_verdict_selon_stratege', {
          verdict: v ? td(libelleVerdict(v.propose)) : '',
        })}
      </h3>
      <ol className="args">
        {raisons.map((r, i) => (
          <li key={i}>
            <div>
              <p>{r.texte}</p>
              <span className="note">
                {t('argument')} {r.message.agent}
                {t('tour_2')} {r.message.tour} ·{' '}
                {r.source
                  ? `${td('Source :')} ${r.source}`
                  : td('Source à compléter')}
              </span>{' '}
              <button className="src" onClick={() => onOuvrir(r.message)}>
                {t('voir_l_argument')}
              </button>
            </div>
          </li>
        ))}
      </ol>
      {v?.reserve && (
        <div role="note" className="reserve" style={{ marginTop: 0 }}>
          <b>{t('reserve')}</b> <span>{v.reserve}</span>
        </div>
      )}
    </section>
  );
}

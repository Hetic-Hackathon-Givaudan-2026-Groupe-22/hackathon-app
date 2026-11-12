'use client';

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
  const raisons = raisonsDetaillees(analyse);
  const v = analyse.verdict;

  return (
    <section
      aria-labelledby="titre-raisons"
      style={{ display: 'grid', gap: 12 }}
    >
      <h3 id="titre-raisons">
        Pourquoi « {v ? libelleVerdict(v.propose) : ''} », selon le Stratège
      </h3>
      <ol className="args">
        {raisons.map((r, i) => (
          <li key={i}>
            <div>
              <p>{r.texte}</p>
              <span className="note">
                Argument : {r.message.agent}, tour {r.message.tour} ·{' '}
                {r.source ? `Source : ${r.source}` : 'Source à compléter'}
              </span>{' '}
              <button className="src" onClick={() => onOuvrir(r.message)}>
                Voir l&apos;argument
              </button>
            </div>
          </li>
        ))}
      </ol>
      {v?.reserve && (
        <div role="note" className="reserve" style={{ marginTop: 0 }}>
          <b>Réserve :</b> <span>{v.reserve}</span>
        </div>
      )}
    </section>
  );
}

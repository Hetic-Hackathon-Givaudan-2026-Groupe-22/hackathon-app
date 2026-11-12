'use client';

import type { Analyse, Message } from '@/lib/analyse';
import { raisonsDetaillees } from '@/lib/raisons';

// US-24 : les raisons du verdict, reliées aux arguments des agents ; la réserve reste visible
export function RaisonsVerdict({
  analyse,
  onOuvrir,
}: {
  analyse: Analyse;
  onOuvrir: (m: Message) => void;
}) {
  const raisons = raisonsDetaillees(analyse);
  const reserve = analyse.verdict?.reserve;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="titre-raisons">
      <h2 id="titre-raisons" className="text-lg font-semibold">
        Raisons principales
      </h2>
      <ol className="flex flex-col gap-2">
        {raisons.map((r, i) => (
          <li key={i} className="rounded-box bg-base-100 p-3 shadow-sm">
            <p>{r.texte}</p>
            <p className="mt-1 text-xs opacity-70">
              Argument : {r.message.agent}, tour {r.message.tour} ·{' '}
              {r.source ? `Source : ${r.source}` : 'Source à compléter'}
            </p>
            <button
              className="link link-primary text-sm"
              onClick={() => onOuvrir(r.message)}
            >
              Voir l&apos;argument
            </button>
          </li>
        ))}
      </ol>
      {reserve && (
        <div role="note" className="alert alert-warning">
          <span>
            <strong>Réserve : </strong>
            {reserve}
          </span>
        </div>
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import type { Analyse } from '@/lib/analyse';

type Onglet = 'tour' | 'chaine' | 'verdict';

// Résultat d'une analyse terminée ; le tour de table s'ouvre en premier (US-15)
export function ResultatAnalyse({ analyse }: { analyse: Analyse }) {
  const [onglet, setOnglet] = useState<Onglet>('tour');
  const messages = analyse.messages ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div role="tablist" className="tabs tabs-box w-fit">
        <button
          role="tab"
          className={`tab ${onglet === 'tour' ? 'tab-active' : ''}`}
          aria-selected={onglet === 'tour'}
          onClick={() => setOnglet('tour')}
        >
          Tour de table
        </button>
      </div>

      {onglet === 'tour' && (
        <div className="flex flex-col gap-2" data-testid="tour-de-table">
          {messages.map((m) => (
            <div key={m.tour} className="rounded-box bg-base-100 p-3 shadow-sm">
              <p className="text-sm font-semibold">
                Tour {m.tour} · {m.agent}
              </p>
              <p>{m.contenu}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import type { Analyse } from '@/lib/analyse';
import { TourDeTable } from './tour-de-table';

type Onglet = 'tour' | 'chaine' | 'verdict';

// Résultat d'une analyse terminée ; le tour de table s'ouvre en premier (US-15)
export function ResultatAnalyse({ analyse }: { analyse: Analyse }) {
  const [onglet, setOnglet] = useState<Onglet>('tour');

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

      {onglet === 'tour' && <TourDeTable messages={analyse.messages ?? []} />}
    </section>
  );
}

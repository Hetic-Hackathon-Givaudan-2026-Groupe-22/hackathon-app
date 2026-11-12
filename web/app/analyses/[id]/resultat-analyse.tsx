'use client';

import { useState } from 'react';
import type { Analyse, Message } from '@/lib/analyse';
import { DetailMessage } from './detail-message';
import { TourDeTable } from './tour-de-table';

type Onglet = 'tour' | 'chaine' | 'verdict';

// Résultat d'une analyse terminée ; le tour de table s'ouvre en premier (US-15)
export function ResultatAnalyse({ analyse }: { analyse: Analyse }) {
  const [onglet, setOnglet] = useState<Onglet>('tour');
  const [ouvert, setOuvert] = useState<Message | null>(null);
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
        <>
          <p className="text-sm opacity-70">
            Cliquez sur une prise de parole pour lire le message complet.
          </p>
          <TourDeTable messages={messages} onOuvrir={setOuvert} />
        </>
      )}

      <DetailMessage
        messages={messages}
        message={ouvert}
        onFermer={() => setOuvert(null)}
      />
    </section>
  );
}

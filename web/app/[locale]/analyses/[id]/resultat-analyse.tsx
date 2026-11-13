'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Analyse, Message } from '@/lib/analyse';
import { ChaineMatieres } from './chaine-matieres';
import { DecisionVerdict } from './decision-verdict';
import { DetailMessage } from './detail-message';
import { EnteteDecision } from './entete-decision';
import { RaisonsVerdict } from './raisons-verdict';
import { SourcesVerdict } from './sources-verdict';
import { TourDeTable } from './tour-de-table';
import { VerdictAnalyse } from './verdict-analyse';

type Onglet = 'tour' | 'chaine' | 'verdict';

const ONGLETS: { id: Onglet; libelle: string }[] = [
  { id: 'tour', libelle: 'Tour de table' },
  { id: 'chaine', libelle: 'Notes et prix' },
  { id: 'verdict', libelle: 'Verdict' },
];

// Résultat d'une analyse terminée ; le tour de table s'ouvre en premier (US-15)
export function ResultatAnalyse({
  analyse,
  onMaj,
  vue = 'tour',
}: {
  analyse: Analyse;
  onMaj: (a: Analyse) => void;
  vue?: Onglet;
}) {
  const td = useTd();
  const t = useTranslations();
  const [onglet, setOnglet] = useState<Onglet>(vue);
  const [ouvert, setOuvert] = useState<Message | null>(null);
  const messages = analyse.messages ?? [];

  return (
    <section style={{ marginTop: 22 }}>
      <div className="seg" role="group" aria-label={t('resultat_de_l_analyse')}>
        {ONGLETS.map((o) => (
          <button
            key={o.id}
            aria-pressed={onglet === o.id}
            onClick={() => setOnglet(o.id)}
          >
            {td(o.libelle)}
          </button>
        ))}
      </div>

      {onglet === 'tour' && (
        <TourDeTable messages={messages} onOuvrir={setOuvert} />
      )}

      {onglet === 'chaine' && <ChaineMatieres analyse={analyse} />}

      {onglet === 'verdict' && (
        <div className="narrow" style={{ marginTop: 18 }}>
          <EnteteDecision analyse={analyse} />
          <VerdictAnalyse
            analyse={analyse}
            raisons={<RaisonsVerdict analyse={analyse} onOuvrir={setOuvert} />}
          />
          <SourcesVerdict analyse={analyse} />
          <DecisionVerdict analyse={analyse} onMaj={onMaj} />
        </div>
      )}

      <DetailMessage
        messages={messages}
        message={ouvert}
        onFermer={() => setOuvert(null)}
      />
    </section>
  );
}

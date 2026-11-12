'use client';

import type { Analyse } from '@/lib/analyse';
import { FIABILITE, libelleVerdict } from '@/lib/verdict';

// US-23 : le verdict en un mot, son score sur 100 et sa fiabilité expliquée
export function VerdictAnalyse({
  analyse,
  raisons,
}: {
  analyse: Analyse;
  raisons?: React.ReactNode;
}) {
  const v = analyse.verdict;
  if (!v) return null;
  const fiabilite = FIABILITE[v.fiabilite];

  return (
    <>
      <div className="eyebrow">Moment décisif</div>
      <h2 className="t">
        Verdict proposé pour « {analyse.perimetre.tendance.nom} »
      </h2>
      <p className="lede">
        Le Stratège propose à partir du score et du débat. Vous gardez la
        décision.
        {analyse.mode === 'dummy' && ' (Analyse simulée.)'}
      </p>

      <div className="g4">
        <div className="card">
          <h3>Score buzz ou durable</h3>
          <div className="score" data-testid="verdict">
            {libelleVerdict(v.propose)}
          </div>
          <div className="bar">
            <div className="l">
              <span>Score</span>
              <b>{v.score} / 100</b>
            </div>
            <i
              style={{
                background: `linear-gradient(90deg,var(--ink) ${v.score}%,#E9EBF1 ${v.score}%)`,
              }}
            />
          </div>
          <span
            className={`chip ${fiabilite.chip}`}
            style={{ width: 'fit-content' }}
          >
            {fiabilite.libelle}
          </span>
          <details>
            <summary className="lnk" style={{ cursor: 'pointer' }}>
              Sur quoi repose la fiabilité ?
            </summary>
            <p className="note" style={{ margin: '8px 0 0' }}>
              {v.explicationFiabilite}
            </p>
          </details>
        </div>
        <div className="card">{raisons}</div>
      </div>
    </>
  );
}

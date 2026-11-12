'use client';

import type { Analyse } from '@/lib/analyse';
import { FIABILITE, libelleVerdict } from '@/lib/verdict';

// US-23 : le verdict en un mot, son score sur 100 et sa fiabilité expliquée
export function VerdictAnalyse({ analyse }: { analyse: Analyse }) {
  const v = analyse.verdict;
  if (!v) return null;
  const fiabilite = FIABILITE[v.fiabilite];

  return (
    <div className="flex flex-col gap-4">
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body flex-row flex-wrap items-center gap-6">
          <div
            className="radial-progress text-primary"
            style={{ '--value': v.score } as React.CSSProperties}
            role="progressbar"
            aria-valuenow={v.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Score ${v.score} sur 100`}
          >
            {v.score}/100
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm opacity-70">
              Verdict proposé par Sillage
              {analyse.mode === 'dummy' && ' (analyse simulée)'}
            </p>
            <p className="text-4xl font-bold" data-testid="verdict">
              {libelleVerdict(v.propose)}
            </p>
            <span className={`badge ${fiabilite.badge}`}>
              {fiabilite.libelle}
            </span>
          </div>
        </div>
      </div>

      <details className="collapse collapse-arrow bg-base-100 shadow-sm">
        <summary className="collapse-title font-semibold">
          Sur quoi repose la fiabilité ?
        </summary>
        <div className="collapse-content text-sm">
          <p>{v.explicationFiabilite}</p>
        </div>
      </details>
    </div>
  );
}

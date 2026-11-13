'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
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
  const td = useTd();
  const t = useTranslations();
  const v = analyse.verdict;
  if (!v) return null;
  const fiabilite = FIABILITE[v.fiabilite];

  return (
    <>
      <div className="eyebrow">{t('moment_decisif')}</div>
      <h2 className="t">
        {t('verdict_propose_pour_tendance', {
          tendance: analyse.perimetre.tendance.nom,
        })}
      </h2>
      <p className="lede">
        {t('le_stratege_propose_a_partir_du_score_et_du_deba')}
        {analyse.mode === 'dummy' && ` (${td('Analyse simulée.')})`}
      </p>

      <div className="g4">
        <div className="card">
          <h3>{t('score_buzz_ou_durable')}</h3>
          <div className="score" data-testid="verdict">
            {td(libelleVerdict(v.propose))}
          </div>
          <div className="bar">
            <div className="l">
              <span>{t('score')}</span>
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
            {td(fiabilite.libelle)}
          </span>
          <details>
            <summary className="lnk" style={{ cursor: 'pointer' }}>
              {t('sur_quoi_repose_la_fiabilite')}
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

'use client';

import { useTd } from '@/lib/traduction';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { formatDateHeure } from '@/lib/format';
import {
  type Decision,
  ecartStratege,
  filtrerDecisions,
  type FiltresHistorique,
  SANS_FILTRE_HISTORIQUE,
} from '@/lib/historique';
import { libelleVerdict } from '@/lib/verdict';

// US-30 : l'historique des décisions, repris du prototype (« Mémoire de l'équipe »)
// US-31 : filtré par tendance et par période
export default function Historique() {
  const td = useTd();
  const locale = useLocale();
  const t = useTranslations();
  const [decisions, setDecisions] = useState<Decision[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtres, setFiltres] = useState<FiltresHistorique>(
    SANS_FILTRE_HISTORIQUE,
  );

  useEffect(() => {
    apiGet<Decision[]>('/moi/decisions')
      .then(setDecisions)
      .catch((e: Error) => setErreur(e.message));
  }, []);

  const visibles = decisions ? filtrerDecisions(decisions, filtres) : null;

  return (
    <section className="view narrow">
      <div className="eyebrow">{t('memoire_de_l_equipe')}</div>
      <h2 className="t">{t('historique_de_mes_decisions')}</h2>
      <p className="lede">
        {t('chaque_verdict_valide_ou_modifie_du_plus_recent')}
      </p>

      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
      {!erreur && !decisions && <p className="note">{t('chargement')}</p>}

      {decisions && decisions.length === 0 && (
        <div className="empty" style={{ marginTop: 18 }}>
          {t('vous_n_avez_encore_valide_aucun_verdict')}
          <Link href="/tendances" className="btn">
            {t('analyser_une_tendance')}
          </Link>
        </div>
      )}

      {decisions && decisions.length > 0 && (
        <div
          className="filters"
          role="toolbar"
          aria-label={t('filtrer_l_historique')}
        >
          <label className={`fbtn${filtres.tendance ? ' on' : ''}`}>
            <span className="fl">{t('tendance')}</span>
            <select
              className="fsel"
              value={filtres.tendance}
              onChange={(e) =>
                setFiltres({ ...filtres, tendance: e.target.value })
              }
            >
              <option value="">{t('toutes')}</option>
              {[
                ...new Map(
                  decisions.map((d) => [d.tendance.slug, d.tendance.nom]),
                ),
              ]
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([slug, nom]) => (
                  <option key={slug} value={slug}>
                    {nom}
                  </option>
                ))}
            </select>
          </label>
          <label className={`fbtn${filtres.du ? ' on' : ''}`}>
            <span className="fl">{t('du')}</span>
            <input
              type="date"
              className="fsel"
              value={filtres.du}
              onChange={(e) => setFiltres({ ...filtres, du: e.target.value })}
            />
          </label>
          <label className={`fbtn${filtres.au ? ' on' : ''}`}>
            <span className="fl">{t('au')}</span>
            <input
              type="date"
              className="fsel"
              value={filtres.au}
              onChange={(e) => setFiltres({ ...filtres, au: e.target.value })}
            />
          </label>
          {(filtres.tendance || filtres.du || filtres.au) && (
            <button
              type="button"
              className="freset"
              onClick={() => setFiltres(SANS_FILTRE_HISTORIQUE)}
            >
              {t('reinitialiser')}
            </button>
          )}
          <span className="fcount" role="status">
            <b>{visibles?.length ?? 0}</b>{' '}
            {td((visibles?.length ?? 0) > 1 ? 'décisions' : 'décision')}
          </span>
        </div>
      )}

      {visibles &&
        visibles.length === 0 &&
        decisions &&
        decisions.length > 0 && (
          <div className="empty" style={{ marginTop: 14 }}>
            {t('aucune_decision_pour_ces_filtres')}
            <button
              className="freset"
              onClick={() => setFiltres(SANS_FILTRE_HISTORIQUE)}
            >
              {t('reinitialiser')}
            </button>
          </div>
        )}

      {visibles && visibles.length > 0 && (
        <div className="card hist">
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>{t('date')}</th>
                  <th>{t('tendance')}</th>
                  <th>{t('decision')}</th>
                  <th>{t('ecart_avec_le_stratege')}</th>
                  <th>{t('raison')}</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((d) => (
                  <tr key={d.analyseId}>
                    <td className="mono">
                      {formatDateHeure(d.decideLe, locale)}
                    </td>
                    <td>
                      <Link
                        href={`/analyses/${d.analyseId}?vue=verdict`}
                        className="lnk"
                      >
                        {d.tendance.nom}
                      </Link>
                    </td>
                    <td>
                      <span
                        className={`chip ${d.retenu === 'durable' ? 'go' : 'risk'}`}
                      >
                        {td(libelleVerdict(d.retenu))}
                      </span>
                    </td>
                    <td>{td(ecartStratege(d))}</td>
                    <td className="note">{d.justification ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

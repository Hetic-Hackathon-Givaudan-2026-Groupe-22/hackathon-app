'use client';

import Link from 'next/link';
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
      <div className="eyebrow">Mémoire de l&apos;équipe</div>
      <h2 className="t">Historique de mes décisions</h2>
      <p className="lede">
        Chaque verdict validé ou modifié, du plus récent au plus ancien.
      </p>

      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
      {!erreur && !decisions && <p className="note">Chargement…</p>}

      {decisions && decisions.length === 0 && (
        <div className="empty" style={{ marginTop: 18 }}>
          Vous n&apos;avez encore validé aucun verdict.
          <Link href="/tendances" className="btn">
            Analyser une tendance
          </Link>
        </div>
      )}

      {decisions && decisions.length > 0 && (
        <div
          className="filters"
          role="toolbar"
          aria-label="Filtrer l'historique"
        >
          <label className={`fbtn${filtres.tendance ? ' on' : ''}`}>
            <span className="fl">Tendance</span>
            <select
              className="fsel"
              value={filtres.tendance}
              onChange={(e) =>
                setFiltres({ ...filtres, tendance: e.target.value })
              }
            >
              <option value="">Toutes</option>
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
            <span className="fl">Du</span>
            <input
              type="date"
              className="fsel"
              value={filtres.du}
              onChange={(e) => setFiltres({ ...filtres, du: e.target.value })}
            />
          </label>
          <label className={`fbtn${filtres.au ? ' on' : ''}`}>
            <span className="fl">Au</span>
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
              Réinitialiser
            </button>
          )}
          <span className="fcount" role="status">
            <b>{visibles?.length ?? 0}</b>{' '}
            {(visibles?.length ?? 0) > 1 ? 'décisions' : 'décision'}
          </span>
        </div>
      )}

      {visibles &&
        visibles.length === 0 &&
        decisions &&
        decisions.length > 0 && (
          <div className="empty" style={{ marginTop: 14 }}>
            Aucune décision pour ces filtres.
            <button
              className="freset"
              onClick={() => setFiltres(SANS_FILTRE_HISTORIQUE)}
            >
              Réinitialiser
            </button>
          </div>
        )}

      {visibles && visibles.length > 0 && (
        <div className="card hist">
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tendance</th>
                  <th>Décision</th>
                  <th>Écart avec le Stratège</th>
                  <th>Raison</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((d) => (
                  <tr key={d.analyseId}>
                    <td className="mono">{formatDateHeure(d.decideLe)}</td>
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
                        {libelleVerdict(d.retenu)}
                      </span>
                    </td>
                    <td>{ecartStratege(d)}</td>
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

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, type TendanceResume } from '@/lib/api';
import { couleurFamille, statutTendance } from '@/lib/famille';
import { filtrer, SANS_FILTRE, type Filtres } from '@/lib/filtres';
import { formatMois } from '@/lib/format';
import { BarreFiltres } from './barre-filtres';
import { Globe } from './globe';
import { LegendeStatuts } from './legende';

// US-09 : la liste des tendances, celles suivies en tête
// US-10 : filtrée au fil de la saisie
// US-08 : à côté, le globe du prototype montre les mêmes tendances
// US-11 : filtres cumulés, appliqués à la liste et au globe
export function ListeTendances() {
  const [q, setQ] = useState('');
  const [tendances, setTendances] = useState<TendanceResume[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [filtres, setFiltres] = useState<Filtres>(SANS_FILTRE);
  const visibles = tendances ? filtrer(tendances, filtres) : null;

  useEffect(() => {
    // Attend 200 ms sans frappe avant d'interroger l'API
    const minuteur = setTimeout(() => {
      const motCle = q.trim();
      apiGet<TendanceResume[]>(
        motCle ? `/tendances?q=${encodeURIComponent(motCle)}` : '/tendances',
      )
        .then((liste) => {
          setTendances(liste);
          setErreur(null);
        })
        .catch((e: Error) => setErreur(e.message));
    }, 200);
    return () => clearTimeout(minuteur);
  }, [q]);

  return (
    <>
      {tendances && (
        <BarreFiltres
          toutes={tendances}
          filtres={filtres}
          onChange={setFiltres}
          nombre={visibles?.length ?? 0}
        />
      )}
      <div className="g1">
        <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
          <form
            className="search"
            role="search"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="q" className="sr-only">
              Rechercher une tendance
            </label>
            <input
              id="q"
              type="search"
              placeholder="Rechercher une tendance (nom ou famille)…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              maxLength={60}
              autoComplete="off"
            />
          </form>

          <LegendeStatuts />
          {erreur && (
            <p className="hint" role="alert">
              {erreur}
            </p>
          )}
          {!erreur && !tendances && <p className="note">Chargement…</p>}

          {visibles && visibles.length === 0 && (
            <div className="empty">
              Aucune tendance ne correspond à la recherche et aux filtres.
              <button
                className="freset"
                onClick={() => {
                  setQ('');
                  setFiltres(SANS_FILTRE);
                }}
              >
                Réinitialiser
              </button>
            </div>
          )}

          {visibles && visibles.length > 0 && (
            <div className="sugglist sugg" style={{ maxHeight: 560 }}>
              {visibles.map((t) => {
                const statut = statutTendance(t.statut);
                return (
                  <Link
                    key={t.slug}
                    href={`/tendances/${t.slug}`}
                    className={`sg${t.suivie ? ' hot' : ''}`}
                  >
                    <div className="h">
                      <b>
                        <i
                          className="dot"
                          style={{
                            background: `rgb(${couleurFamille(t.famille)})`,
                          }}
                        />
                        {t.nom}
                      </b>
                      <span style={{ display: 'flex', gap: 6 }}>
                        {t.suivie && <span className="chip go">Suivie</span>}
                        <span className={`chip ${statut.chip}`}>
                          {statut.libelle}
                        </span>
                      </span>
                    </div>
                    <div className="why">
                      <b>Famille :</b>
                      <span>{t.famille}</span>
                    </div>
                    <div className="f">
                      <span className="note">
                        {t.origine} → {t.pays.slice(0, 3).join(', ')} · depuis{' '}
                        {formatMois(t.dateDebut)}
                      </span>
                      <span className="go-a">
                        Voir la fiche <span aria-hidden="true">›</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Globe tendances={visibles ?? []} />
      </div>
    </>
  );
}

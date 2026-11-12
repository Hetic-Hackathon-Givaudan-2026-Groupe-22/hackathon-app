'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, type TendanceResume } from '@/lib/api';
import { couleurFamille, statutTendance } from '@/lib/famille';
import { formatMois } from '@/lib/format';

// US-09 : la liste des tendances, celles suivies en tête
// US-10 : filtrée au fil de la saisie
export function ListeTendances() {
  const [q, setQ] = useState('');
  const [tendances, setTendances] = useState<TendanceResume[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

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
    <div style={{ display: 'grid', gap: 14, marginTop: 18 }}>
      <form
        className="search"
        role="search"
        style={{ maxWidth: 640 }}
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

      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
      {!erreur && !tendances && <p className="note">Chargement…</p>}

      {tendances && tendances.length === 0 && (
        <div className="empty">
          Aucune tendance ne correspond à « {q.trim()} ».
          <button className="freset" onClick={() => setQ('')}>
            Effacer la recherche
          </button>
        </div>
      )}

      {tendances && tendances.length > 0 && (
        <div className="sugglist grid">
          {tendances.map((t) => {
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
                  <span className="note">Depuis {formatMois(t.dateDebut)}</span>
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
  );
}

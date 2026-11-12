'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, type TendanceResume } from '@/lib/api';
import { formatMois, libelleStatut } from '@/lib/format';

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
    <div className="flex flex-col gap-4">
      <label className="input w-full max-w-md">
        <span className="sr-only">Rechercher une tendance</span>
        <input
          type="search"
          placeholder="Rechercher une tendance (nom ou famille)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={60}
        />
      </label>

      {erreur && <div className="alert alert-error">{erreur}</div>}
      {!erreur && !tendances && <span className="loading loading-dots" />}

      {tendances && tendances.length === 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-box bg-base-100 p-4">
          <span>Aucune tendance ne correspond à « {q.trim()} ».</span>
          <button className="btn btn-sm" onClick={() => setQ('')}>
            Effacer la recherche
          </button>
        </div>
      )}

      {tendances && tendances.length > 0 && (
        <div className="overflow-x-auto rounded-box bg-base-100 shadow-sm">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Famille</th>
                <th>Statut</th>
                <th>Début</th>
              </tr>
            </thead>
            <tbody>
              {tendances.map((t) => (
                <tr key={t.slug} className="hover:bg-base-200">
                  <td>
                    <Link href={`/tendances/${t.slug}`} className="link-hover">
                      {t.nom}
                    </Link>
                    {t.suivie && (
                      <span className="badge badge-primary badge-sm ml-2">
                        Suivie
                      </span>
                    )}
                  </td>
                  <td>{t.famille}</td>
                  <td>
                    <span className="badge badge-outline">
                      {libelleStatut(t.statut)}
                    </span>
                  </td>
                  <td>{formatMois(t.dateDebut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

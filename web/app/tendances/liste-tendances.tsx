'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, type TendanceResume } from '@/lib/api';
import { formatMois, libelleStatut } from '@/lib/format';

// US-09 : la liste des tendances, celles suivies en tête
export function ListeTendances() {
  const [tendances, setTendances] = useState<TendanceResume[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiGet<TendanceResume[]>('/tendances')
      .then(setTendances)
      .catch((e: Error) => setErreur(e.message));
  }, []);

  if (erreur) return <div className="alert alert-error">{erreur}</div>;
  if (!tendances) return <span className="loading loading-dots" />;

  return (
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
  );
}

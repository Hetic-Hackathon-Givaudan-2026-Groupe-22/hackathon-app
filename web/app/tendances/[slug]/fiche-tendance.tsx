'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiGet, type Tendance } from '@/lib/api';
import { formatMois, libelleStatut } from '@/lib/format';
import { BoutonLancerAnalyse } from './bouton-lancer-analyse';

// US-13 : la fiche d'une tendance, pour juger si elle mérite une analyse
export function FicheTendance({ slug }: { slug: string }) {
  const [tendance, setTendance] = useState<Tendance | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Tendance>(`/tendances/${encodeURIComponent(slug)}`)
      .then(setTendance)
      .catch((e: Error) => setErreur(e.message));
  }, [slug]);

  if (erreur)
    return (
      <div className="flex flex-col gap-4">
        <div className="alert alert-error">{erreur}</div>
        <Link href="/tendances" className="link">
          Retour aux tendances
        </Link>
      </div>
    );
  if (!tendance) return <span className="loading loading-dots" />;

  return (
    <>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/tendances">Tendances</Link>
          </li>
          <li>{tendance.nom}</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold">{tendance.nom}</h1>
        <span className="badge badge-outline">{tendance.famille}</span>
        <span className="badge">{libelleStatut(tendance.statut)}</span>
      </div>
      <p className="text-sm opacity-70">
        Observée depuis {formatMois(tendance.dateDebut)}
      </p>
      <p>{tendance.description}</p>

      <section className="grid gap-3 sm:grid-cols-2">
        {tendance.signaux.map((s) => (
          <div key={s.libelle} className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <p className="text-sm opacity-70">{s.libelle}</p>
              <p className="text-xl font-semibold">{s.valeur}</p>
              <p className="text-xs">
                Source : {s.source}
                {s.demo && (
                  <span className="badge badge-warning badge-xs ml-2">
                    Valeur de démonstration
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}
      </section>

      <BoutonLancerAnalyse slug={tendance.slug} />
    </>
  );
}

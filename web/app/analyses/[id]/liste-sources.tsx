'use client';

import { useState } from 'react';
import type { Source } from '@/lib/analyse';

// US-18 : les sources d'un message, vérifiées ou de démonstration
// US-19 : chacune s'ouvre dans un nouvel onglet, sans quitter l'analyse
export function ListeSources({ sources }: { sources: Source[] }) {
  const [visibles, setVisibles] = useState(false);

  if (sources.length === 0)
    return (
      <p className="badge badge-warning badge-outline">Source à compléter</p>
    );

  return (
    <div className="flex flex-col gap-2">
      <div>
        <button
          className="btn btn-sm btn-outline"
          aria-expanded={visibles}
          onClick={() => setVisibles(!visibles)}
        >
          {visibles ? 'Masquer les sources' : 'Voir les sources'} (
          {sources.length})
        </button>
      </div>
      {visibles && (
        <ul className="flex flex-col gap-2" aria-label="Sources du message">
          {sources.map((s, i) => (
            <li key={i} className="rounded-box bg-base-200 p-3 text-sm">
              <p className="font-semibold">{s.titre}</p>
              <p className="opacity-70">
                {s.editeur} · {s.date}
              </p>
              <LienSource source={s} />
              {s.verifiee ? (
                <span className="badge badge-success badge-sm">
                  Source vérifiée
                </span>
              ) : (
                <span className="badge badge-warning badge-sm">
                  Donnée de démonstration
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LienSource({ source }: { source: Source }) {
  const [indisponible, setIndisponible] = useState(false);

  if (source.url)
    return (
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="link link-primary mr-2"
      >
        Ouvrir la source ↗
      </a>
    );

  return (
    <>
      <button
        className="link link-primary mr-2"
        onClick={() => setIndisponible(true)}
      >
        Ouvrir la source
      </button>
      {indisponible && (
        <p role="status" className="alert alert-warning my-2 text-sm">
          Le lien de cette source n&apos;est plus disponible. Référence :{' '}
          {source.titre}, {source.editeur}, {source.date}.
        </p>
      )}
    </>
  );
}

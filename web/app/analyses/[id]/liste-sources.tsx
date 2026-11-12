'use client';

import { useState } from 'react';
import type { Source } from '@/lib/analyse';

// US-18 : les sources d'un message, vérifiées ou de démonstration
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

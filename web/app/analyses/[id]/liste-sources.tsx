'use client';

import { useState } from 'react';
import type { Source } from '@/lib/analyse';

// US-18 : les sources d'un message, vérifiées ou de démonstration
// US-19 : chacune s'ouvre dans un nouvel onglet, sans quitter l'analyse
export function ListeSources({ sources }: { sources: Source[] }) {
  const [visibles, setVisibles] = useState(false);

  if (sources.length === 0)
    return (
      <p>
        <span className="chip wait">Source à compléter</span>
      </p>
    );

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div>
        <button
          className="src"
          aria-expanded={visibles}
          onClick={() => setVisibles(!visibles)}
        >
          {visibles ? 'Masquer les sources' : 'Voir les sources'} (
          {sources.length})
        </button>
      </div>
      {visibles && (
        <ul className="sx-docs" aria-label="Sources du message">
          {sources.map((s, i) => (
            <li key={i}>
              <LienSource source={s} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Contenu({ source }: { source: Source }) {
  return (
    <>
      <b>{source.titre}</b>
      <span>
        {source.editeur} · {source.date} ·{' '}
        {source.verifiee ? (
          <span className="chip go">Source vérifiée</span>
        ) : (
          <span className="chip wait">Donnée de démonstration</span>
        )}
      </span>
    </>
  );
}

function LienSource({ source }: { source: Source }) {
  const [indisponible, setIndisponible] = useState(false);

  if (source.url)
    return (
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        <Contenu source={source} />
        <i aria-hidden="true">↗</i>
        <span className="sr-only">Ouvrir la source (nouvel onglet)</span>
      </a>
    );

  return (
    <>
      <a
        href="#"
        role="button"
        onClick={(e) => {
          e.preventDefault();
          setIndisponible(true);
        }}
      >
        <Contenu source={source} />
        <i aria-hidden="true">›</i>
        <span className="sr-only">Ouvrir la source</span>
      </a>
      {indisponible && (
        <p role="status" className="reserve" style={{ marginTop: 8 }}>
          Le lien de cette source n&apos;est plus disponible. Référence :{' '}
          {source.titre}, {source.editeur}, {source.date}.
        </p>
      )}
    </>
  );
}

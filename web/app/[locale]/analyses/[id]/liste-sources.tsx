'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { Source } from '@/lib/analyse';

// US-18 : les sources d'un message, vérifiées ou de démonstration
// US-19 : chacune s'ouvre dans un nouvel onglet, sans quitter l'analyse
export function ListeSources({ sources }: { sources: Source[] }) {
  const td = useTd();
  const t = useTranslations();
  const [visibles, setVisibles] = useState(false);

  if (sources.length === 0)
    return (
      <p>
        <span className="chip wait">{t('source_a_completer')}</span>
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
          {td(visibles ? 'Masquer les sources' : 'Voir les sources')} (
          {sources.length})
        </button>
      </div>
      {visibles && (
        <ul className="sx-docs" aria-label={t('sources_du_message')}>
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
  const t = useTranslations();
  return (
    <>
      <b>{source.titre}</b>
      <span>
        {source.editeur} · {source.date} ·{' '}
        {source.verifiee ? (
          <span className="chip go">{t('source_verifiee')}</span>
        ) : (
          <span className="chip wait">{t('donnee_de_demonstration')}</span>
        )}
      </span>
    </>
  );
}

function LienSource({ source }: { source: Source }) {
  const t = useTranslations();
  const [indisponible, setIndisponible] = useState(false);

  if (source.url)
    return (
      <a href={source.url} target="_blank" rel="noopener noreferrer">
        <Contenu source={source} />
        <i aria-hidden="true">↗</i>
        <span className="sr-only">{t('ouvrir_la_source_nouvel_onglet')}</span>
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
        <span className="sr-only">{t('ouvrir_la_source')}</span>
      </a>
      {indisponible && (
        <p role="status" className="reserve" style={{ marginTop: 8 }}>
          {t('le_lien_de_cette_source_n_est_plus_disponible_re')} {source.titre}
          , {source.editeur}, {source.date}.
        </p>
      )}
    </>
  );
}

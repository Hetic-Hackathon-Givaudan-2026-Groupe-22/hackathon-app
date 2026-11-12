'use client';

import { useEffect, useState } from 'react';
import { apiGet, type TendanceResume } from '@/lib/api';
import { couleurFamille } from '@/lib/famille';

// Cases à cocher du prototype pour choisir les tendances suivies (US-06)
export function ChoixTendances({
  choisies,
  onChange,
}: {
  choisies: string[];
  onChange: (slugs: string[]) => void;
}) {
  const [tendances, setTendances] = useState<TendanceResume[] | null>(null);

  useEffect(() => {
    apiGet<TendanceResume[]>('/tendances')
      .then((liste) =>
        setTendances([...liste].sort((a, b) => a.nom.localeCompare(b.nom))),
      )
      .catch(() => setTendances([]));
  }, []);

  if (!tendances) return <p className="note">Chargement…</p>;

  const basculer = (slug: string) =>
    onChange(
      choisies.includes(slug)
        ? choisies.filter((s) => s !== slug)
        : [...choisies, slug],
    );

  return (
    <div className="chklist" role="group" aria-label="Tendances à suivre">
      {tendances.map((t) => {
        const coche = choisies.includes(t.slug);
        return (
          <button
            key={t.slug}
            type="button"
            className="chk"
            role="checkbox"
            aria-checked={coche}
            onClick={() => basculer(t.slug)}
          >
            <span className="bx" aria-hidden="true">
              {coche ? '✓' : ''}
            </span>
            <i
              className="dot"
              style={{ background: `rgb(${couleurFamille(t.famille)})` }}
            />
            <span className="t">
              <b>{t.nom}</b>
              <span>{t.famille}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

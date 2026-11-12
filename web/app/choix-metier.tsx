'use client';

import { METIERS } from '@/lib/metiers';

// Liste des métiers, en pastilles du prototype (US-05)
export function ChoixMetier({
  valeur,
  onChange,
}: {
  valeur: string | null;
  onChange: (m: string) => void;
}) {
  return (
    <div className="famrow" role="radiogroup" aria-label="Votre métier">
      {METIERS.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          className="famt"
          aria-checked={valeur === m}
          onClick={() => onChange(m)}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

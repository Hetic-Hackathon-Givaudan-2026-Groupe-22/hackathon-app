'use client';

import { useTd } from '@/lib/traduction';
import { useState } from 'react';

// Champ mot de passe masqué, avec l'œil du prototype pour l'afficher (US-03)
export function ChampMotDePasse({
  id,
  valeur,
  onChange,
  autoComplete,
  placeholder,
  invalide,
}: {
  id: string;
  valeur: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder?: string;
  invalide?: boolean;
}) {
  const td = useTd();
  const [visible, setVisible] = useState(false);
  return (
    <div className="pw">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalide}
      />
      <button
        type="button"
        className="eye"
        aria-label={td(
          visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe',
        )}
        aria-pressed={visible}
        onClick={() => setVisible(!visible)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          {visible && (
            <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.8" />
          )}
        </svg>
      </button>
    </div>
  );
}

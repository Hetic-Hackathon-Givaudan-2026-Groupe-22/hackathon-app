'use client';

import { useEffect, useState } from 'react';

type Etat =
  { kind: 'chargement' } | { kind: 'ok' } | { kind: 'erreur'; message: string };

// État de l'API et de la base, lu sur GET /api/health
export function ApiStatus() {
  const [etat, setEtat] = useState<Etat>({ kind: 'chargement' });

  useEffect(() => {
    fetch('/api/health')
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          // Sans réponse JSON, c'est le relais de Next.js : l'API ne répond pas
          setEtat({
            kind: 'erreur',
            message: body?.message ?? 'API injoignable',
          });
          return;
        }
        setEtat({ kind: 'ok' });
      })
      .catch(() => setEtat({ kind: 'erreur', message: 'API injoignable' }));
  }, []);

  if (etat.kind === 'chargement')
    return <p className="statusline">Connexion à l&apos;API…</p>;
  if (etat.kind === 'erreur')
    return (
      <p className="statusline" role="alert">
        <span className="chip risk">{etat.message}</span>
      </p>
    );
  return (
    <p className="statusline">
      <span className="chip go">API et base connectées</span>
    </p>
  );
}

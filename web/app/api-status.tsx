'use client';

import { useEffect, useState } from 'react';

type Etat =
  | { kind: 'chargement' }
  | { kind: 'ok'; db: string }
  | { kind: 'erreur'; message: string };

// Affiche l'état de l'API et de la base, lu sur GET /api/health
export function ApiStatus() {
  const [etat, setEtat] = useState<Etat>({ kind: 'chargement' });

  useEffect(() => {
    fetch('/api/health')
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) {
          setEtat({
            kind: 'erreur',
            // Sans réponse JSON, c'est le relais de Next.js : l'API ne répond pas
            message: body?.message ?? 'API injoignable',
          });
          return;
        }
        setEtat({ kind: 'ok', db: body.db });
      })
      .catch(() => setEtat({ kind: 'erreur', message: 'API injoignable' }));
  }, []);

  if (etat.kind === 'chargement') return <p>Connexion à l&apos;API…</p>;
  if (etat.kind === 'erreur') return <p role="alert">❌ {etat.message}</p>;
  return (
    <p>
      ✅ API et base connectées : <code>{etat.db.split(' on ')[0]}</code>
    </p>
  );
}

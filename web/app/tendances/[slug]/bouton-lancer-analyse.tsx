'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiPost } from '@/lib/api';

// US-14 : « Lancer l'analyse » démarre les 5 agents, puis ouvre le suivi
export function BoutonLancerAnalyse({ slug }: { slug: string }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function lancer() {
    setEnvoi(true);
    setErreur(null);
    try {
      const { id } = await apiPost<{ id: number }>('/analyses', {
        tendance: slug,
      });
      router.push(`/analyses/${id}`);
    } catch (e) {
      setErreur((e as Error).message);
      setEnvoi(false);
    }
  }

  return (
    <div className="foot" style={{ justifyContent: 'flex-start' }}>
      <button className="btn" onClick={lancer} disabled={envoi}>
        {envoi ? 'Lancement…' : 'Lancer l’analyse'}{' '}
        <span aria-hidden="true">›</span>
      </button>
      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
    </div>
  );
}

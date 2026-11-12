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
    <div className="flex flex-col gap-2">
      <div>
        <button className="btn btn-primary" onClick={lancer} disabled={envoi}>
          {envoi && <span className="loading loading-spinner loading-sm" />}
          Lancer l&apos;analyse
        </button>
      </div>
      {erreur && <div className="alert alert-error">{erreur}</div>}
    </div>
  );
}

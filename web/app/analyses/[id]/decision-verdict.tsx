'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import type { Analyse } from '@/lib/analyse';
import { formatDateHeure } from '@/lib/format';
import { libelleVerdict, verdictRetenu } from '@/lib/verdict';

// US-25 : Camille valide le verdict ; il devient officiel, daté et signé
export function DecisionVerdict({
  analyse,
  onMaj,
}: {
  analyse: Analyse;
  onMaj: (a: Analyse) => void;
}) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const v = analyse.verdict;
  if (!v) return null;

  async function valider() {
    setEnvoi(true);
    setErreur(null);
    try {
      onMaj(
        await apiPost<Analyse>(`/analyses/${analyse.id}/verdict/validation`),
      );
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  if (v.statut === 'propose')
    return (
      <section className="flex flex-col gap-2" aria-label="Décision">
        <div className="flex flex-wrap gap-2">
          <button
            className="btn btn-primary"
            onClick={valider}
            disabled={envoi}
          >
            {envoi && <span className="loading loading-spinner loading-sm" />}
            Valider le verdict
          </button>
        </div>
        {erreur && <div className="alert alert-error">{erreur}</div>}
      </section>
    );

  return (
    <section className="flex flex-col gap-3" aria-label="Décision">
      <div role="status" className="alert alert-success">
        <span>
          <strong>
            {v.statut === 'valide' ? 'Validé' : 'Modifié'} :{' '}
            {libelleVerdict(verdictRetenu(v))}
          </strong>{' '}
          le {v.decideLe ? formatDateHeure(v.decideLe) : '?'} par {v.decidePar}
        </span>
      </div>
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <h2 className="card-title">Plan d&apos;action</h2>
          <p className="text-sm opacity-70">
            Le verdict est officiel : le plan d&apos;action de la tendance est
            accessible. Son contenu arrive avec US-27.
          </p>
        </div>
      </div>
    </section>
  );
}

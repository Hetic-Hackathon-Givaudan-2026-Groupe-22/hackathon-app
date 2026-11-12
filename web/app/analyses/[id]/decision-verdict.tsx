'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import type { Analyse } from '@/lib/analyse';
import { formatDateHeure } from '@/lib/format';
import { libelleVerdict, verdictRetenu } from '@/lib/verdict';

const JUSTIFICATION_MIN = 10;

// US-25 : Camille valide le verdict ; il devient officiel, daté et signé
// US-26 : ou elle le modifie, justification obligatoire
export function DecisionVerdict({
  analyse,
  onMaj,
}: {
  analyse: Analyse;
  onMaj: (a: Analyse) => void;
}) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [edition, setEdition] = useState(false);
  const [justification, setJustification] = useState('');
  const v = analyse.verdict;
  if (!v) return null;
  const autre = v.propose === 'buzz' ? 'durable' : 'buzz';

  async function envoyer(chemin: string, corps?: unknown) {
    setEnvoi(true);
    setErreur(null);
    try {
      onMaj(
        await apiPost<Analyse>(
          `/analyses/${analyse.id}/verdict/${chemin}`,
          corps,
        ),
      );
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  if (v.statut === 'propose')
    return (
      <section className="flex flex-col gap-3" aria-label="Décision">
        {!edition && (
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-primary"
              onClick={() => envoyer('validation')}
              disabled={envoi}
            >
              {envoi && <span className="loading loading-spinner loading-sm" />}
              Valider le verdict
            </button>
            <button className="btn" onClick={() => setEdition(true)}>
              Modifier le verdict
            </button>
          </div>
        )}

        {edition && (
          <form
            className="card bg-base-100 shadow-sm"
            onSubmit={(e) => {
              e.preventDefault();
              envoyer('modification', { verdict: autre, justification });
            }}
          >
            <div className="card-body gap-3">
              <h2 className="card-title">
                Remplacer « {libelleVerdict(v.propose)} » par «{' '}
                {libelleVerdict(autre)} »
              </h2>
              <label className="flex flex-col gap-1">
                <span>Justification (obligatoire)</span>
                <textarea
                  className="textarea w-full"
                  required
                  minLength={JUSTIFICATION_MIN}
                  maxLength={500}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Pourquoi votre expertise contredit-elle l'analyse ?"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    envoi || justification.trim().length < JUSTIFICATION_MIN
                  }
                >
                  Enregistrer ma décision
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setEdition(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </form>
        )}

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

      {v.statut === 'modifie' && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-box bg-base-100 p-4 shadow-sm">
            <p className="text-sm opacity-70">Proposé par Sillage</p>
            <p className="text-2xl font-semibold">
              {libelleVerdict(v.propose)}
            </p>
            <p className="text-sm">Score {v.score}/100</p>
          </div>
          <div className="rounded-box bg-base-100 p-4 shadow-sm ring-2 ring-primary">
            <p className="text-sm opacity-70">Décision de {v.decidePar}</p>
            <p className="text-2xl font-semibold">
              {libelleVerdict(verdictRetenu(v))}
            </p>
            <p className="text-sm">« {v.justification} »</p>
          </div>
        </div>
      )}

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

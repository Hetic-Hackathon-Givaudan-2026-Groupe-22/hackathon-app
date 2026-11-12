'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiPost } from '@/lib/api';
import type { Analyse } from '@/lib/analyse';
import { formatDateHeure } from '@/lib/format';
import { libelleVerdict, verdictRetenu } from '@/lib/verdict';

const JUSTIFICATION_MIN = 10;

const DESCRIPTION = {
  durable: 'Lancer un projet et prévenir les achats',
  buzz: 'Classer comme buzz passager',
};

// US-25 : Camille valide le verdict ; il devient officiel, daté et signé
// US-26 : ou elle choisit l'autre verdict, justification obligatoire
export function DecisionVerdict({
  analyse,
  onMaj,
}: {
  analyse: Analyse;
  onMaj: (a: Analyse) => void;
}) {
  const v = analyse.verdict;
  const [choix, setChoix] = useState<'buzz' | 'durable'>(
    v?.propose ?? 'durable',
  );
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  if (!v) return null;
  const change = choix !== v.propose;

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
      <section aria-label="Décision" style={{ marginTop: 20 }}>
        <div className="eyebrow">Votre décision</div>
        <div className="opts two" role="group" aria-label="Choisir le verdict">
          {(['durable', 'buzz'] as const).map((o) => (
            <button
              key={o}
              className="opt"
              aria-pressed={choix === o}
              onClick={() => setChoix(o)}
            >
              <div className="h">
                <b>{libelleVerdict(o)}</b>
                {o === v.propose && (
                  <span className="chip go">Proposé par le Stratège</span>
                )}
              </div>
              <span className="d">{DESCRIPTION[o]}</span>
            </button>
          ))}
        </div>

        {change && (
          <div style={{ marginTop: 14 }}>
            <label htmlFor="why" className="eyebrow">
              Pourquoi changez-vous le verdict ? (obligatoire)
            </label>
            <textarea
              id="why"
              rows={3}
              required
              minLength={JUSTIFICATION_MIN}
              maxLength={500}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Pourquoi votre expertise contredit-elle l'analyse ?"
            />
          </div>
        )}

        <div className="foot">
          {change ? (
            <button
              className="btn"
              onClick={() =>
                envoyer('modification', { verdict: choix, justification })
              }
              disabled={
                envoi || justification.trim().length < JUSTIFICATION_MIN
              }
            >
              Enregistrer ma décision : {libelleVerdict(choix)}
            </button>
          ) : (
            <button
              className="btn"
              onClick={() => envoyer('validation')}
              disabled={envoi}
            >
              Valider le verdict : {libelleVerdict(v.propose)}
            </button>
          )}
        </div>
        {erreur && (
          <p className="hint" role="alert">
            {erreur}
          </p>
        )}
      </section>
    );

  return (
    <section
      aria-label="Décision"
      style={{ marginTop: 20, display: 'grid', gap: 14 }}
    >
      <div role="status" className="decision" style={{ marginTop: 0 }}>
        <span className="chip go">
          {v.statut === 'valide' ? 'Validé' : 'Modifié'}
        </span>
        <b>{libelleVerdict(verdictRetenu(v))}</b>
        <span className="note">
          le {v.decideLe ? formatDateHeure(v.decideLe) : '?'} par {v.decidePar}
        </span>
      </div>

      {v.statut === 'modifie' && (
        <div className="side">
          <div className="card">
            <span className="note">Proposé par Sillage</span>
            <span className="score">{libelleVerdict(v.propose)}</span>
            <span className="note">Score {v.score}/100</span>
          </div>
          <div className="card mine">
            <span className="note">Décision de {v.decidePar}</span>
            <span className="score">{libelleVerdict(verdictRetenu(v))}</span>
            <span>« {v.justification} »</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="eyebrow">Après la décision</div>
        <h3>Plan d&apos;action</h3>
        <p className="note" style={{ margin: 0 }}>
          Le verdict est officiel : le plan d&apos;action de la tendance est
          accessible.
        </p>
        <div>
          <Link href={`/analyses/${analyse.id}/plan`} className="btn">
            Ouvrir le plan d&apos;action <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

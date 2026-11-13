'use client';

import { useTd } from '@/lib/traduction';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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
  const td = useTd();
  const locale = useLocale();
  const t = useTranslations();
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
      <section aria-label={t('decision')} style={{ marginTop: 20 }}>
        <div className="eyebrow">{t('votre_decision')}</div>
        <div
          className="opts two"
          role="group"
          aria-label={t('choisir_le_verdict')}
        >
          {(['durable', 'buzz'] as const).map((o) => (
            <button
              key={o}
              className="opt"
              aria-pressed={choix === o}
              onClick={() => setChoix(o)}
            >
              <div className="h">
                <b>{td(libelleVerdict(o))}</b>
                {o === v.propose && (
                  <span className="chip go">
                    {t('propose_par_le_stratege')}
                  </span>
                )}
              </div>
              <span className="d">{td(DESCRIPTION[o])}</span>
            </button>
          ))}
        </div>

        {change && (
          <div style={{ marginTop: 14 }}>
            <label htmlFor="why" className="eyebrow">
              {t('pourquoi_changez_vous_le_verdict_obligatoire')}
            </label>
            <textarea
              id="why"
              rows={3}
              required
              minLength={JUSTIFICATION_MIN}
              maxLength={500}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder={t(
                'pourquoi_votre_expertise_contredit_elle_l_analys',
              )}
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
              {t('enregistrer_ma_decision')} {td(libelleVerdict(choix))}
            </button>
          ) : (
            <button
              className="btn"
              onClick={() => envoyer('validation')}
              disabled={envoi}
            >
              {t('valider_le_verdict')} {td(libelleVerdict(v.propose))}
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
      aria-label={t('decision')}
      style={{ marginTop: 20, display: 'grid', gap: 14 }}
    >
      <div role="status" className="decision" style={{ marginTop: 0 }}>
        <span className="chip go">
          {td(v.statut === 'valide' ? 'Validé' : 'Modifié')}
        </span>
        <b>{td(libelleVerdict(verdictRetenu(v)))}</b>
        <span className="note">
          {t('le_2')} {v.decideLe ? formatDateHeure(v.decideLe, locale) : '?'}{' '}
          {t('par')} {v.decidePar}
        </span>
      </div>

      {v.statut === 'modifie' && (
        <div className="side">
          <div className="card">
            <span className="note">{t('propose_par_sillage')}</span>
            <span className="score">{td(libelleVerdict(v.propose))}</span>
            <span className="note">
              {t('score')} {v.score}/100
            </span>
          </div>
          <div className="card mine">
            <span className="note">
              {t('decision_de')} {v.decidePar}
            </span>
            <span className="score">
              {td(libelleVerdict(verdictRetenu(v)))}
            </span>
            <span>« {v.justification} »</span>
          </div>
        </div>
      )}

      <div className="card">
        <div className="eyebrow">{t('apres_la_decision')}</div>
        <h3>{t('plan_d_action')}</h3>
        <p className="note" style={{ margin: 0 }}>
          {t('le_verdict_est_officiel_le_plan_d_action_de_la_t')}
        </p>
        <div>
          <Link href={`/analyses/${analyse.id}/plan`} className="btn">
            {t('ouvrir_le_plan_d_action')} <span aria-hidden="true">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

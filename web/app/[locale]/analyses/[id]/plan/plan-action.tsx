'use client';

import { useTd } from '@/lib/traduction';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { ApiError, apiGet, apiPost } from '@/lib/api';
import { formatDateHeure } from '@/lib/format';
import {
  CHIP_PRIORITE,
  chipUrgence,
  iconeEquipe,
  jourMois,
  type Plan,
} from '@/lib/plan';
import { libelleVerdict } from '@/lib/verdict';
import { EnvoiAlerte } from './envoi-alerte';

// US-27 : le plan d'action par équipe, repris du prototype
export function PlanAction({ id }: { id: string }) {
  const td = useTd();
  const locale = useLocale();
  const t = useTranslations();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [aValider, setAValider] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [choisie, setChoisie] = useState<string | null>(null);
  const [ajout, setAjout] = useState(false);
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Plan>(`/analyses/${encodeURIComponent(id)}/plan`)
      .then((p) => {
        setPlan(p);
        setChoisie(p.equipes[0]?.cle ?? null);
      })
      .catch((e: Error) => {
        if (e instanceof ApiError && e.status === 409) setAValider(e.message);
        else setErreur(e.message);
      });
  }, [id]);

  const retour = (
    <Link href={`/analyses/${id}`} className="lnk">
      {t('retour_a_l_analyse')}
    </Link>
  );

  if (aValider)
    return (
      <>
        {retour}
        <div className="empty" style={{ marginTop: 18 }}>
          <b>{t('plan_d_action_pas_encore_disponible')}</b>
          {aValider}
          <Link href={`/analyses/${id}`} className="btn">
            {t('aller_au_verdict')}
          </Link>
        </div>
      </>
    );
  if (erreur) return <div className="empty">{erreur}</div>;
  if (!plan) return <p className="note">{t('chargement')}</p>;

  const equipe = plan.equipes.find((e) => e.cle === choisie) ?? plan.equipes[0];

  // US-28 : ajouter une équipe au plan ; la liste ne propose que les absentes
  async function ajouter(cle: string) {
    setErreurAjout(null);
    try {
      const p = await apiPost<Plan>(
        `/analyses/${encodeURIComponent(id)}/plan/equipes`,
        { equipe: cle },
      );
      setPlan(p);
      setChoisie(cle);
      setAjout(false);
    } catch (e) {
      setErreurAjout((e as Error).message);
    }
  }

  return (
    <>
      {retour}
      <div className="eyebrow" style={{ marginTop: 14 }}>
        {t('apres_la_decision')}
      </div>
      <h2 className="t">{t('le_plan_d_action_par_equipe')}</h2>
      <p className="lede">
        {t('sillage_traduit_le_verdict_en_actions_concretes')}
      </p>
      <div className="decision">
        <b>{plan.tendance}</b>
        <span className={`chip ${plan.verdict === 'durable' ? 'go' : 'risk'}`}>
          {td(libelleVerdict(plan.verdict))}
        </span>
        <span className="note">
          {t('decide_le')} {formatDateHeure(plan.decideLe, locale)}
        </span>
      </div>

      <div className="poles" role="tablist" aria-label={t('equipes')}>
        {plan.equipes.map((e) => {
          const [lettre, fond] = iconeEquipe(e.cle);
          return (
            <button
              key={e.cle}
              role="tab"
              className="pcard"
              aria-selected={e.cle === equipe?.cle}
              onClick={() => setChoisie(e.cle)}
            >
              <div className="pc-h">
                <span className="ico" style={{ background: fond }}>
                  {lettre}
                </span>
                <b>{e.nom}</b>
                <span className={`chip ${chipUrgence(e.urgence)}`}>
                  {td(e.urgence)}
                </span>
              </div>
              <span className="eyebrow">{t('premiere_action')}</span>
              <span className="pc-a">{e.actions[0]?.texte}</span>
              <span className="note">
                {t('avant_le')} {jourMois(e.actions[0]?.echeance ?? '')} ·{' '}
                {e.actions.length} {t('action')}
                {e.actions.length > 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
        {plan.disponibles.length > 0 && (
          <button className="pcard add" onClick={() => setAjout(true)}>
            <span className="ico">+</span>
            <b>{t('ajouter_une_equipe')}</b>
            <span className="note">
              {plan.disponibles.map((d) => d.nom).join(', ')}
            </span>
          </button>
        )}
      </div>

      {ajout && (
        <div
          className="modal"
          role="presentation"
          onClick={() => setAjout(false)}
        >
          <div
            className="mpanel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titre-ajout"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && setAjout(false)}
          >
            <div className="phead">
              <h3 id="titre-ajout">{t('ajouter_une_equipe_au_plan')}</h3>
              <button className="x" onClick={() => setAjout(false)} autoFocus>
                {t('fermer')}
              </button>
            </div>
            <div className="cat">
              {plan.disponibles.map((d) => {
                const [lettre, fond] = iconeEquipe(d.cle);
                return (
                  <button key={d.cle} onClick={() => ajouter(d.cle)}>
                    <span className="ico" style={{ background: fond }}>
                      {lettre}
                    </span>
                    <span className="t">
                      <b>{d.nom}</b>
                    </span>
                  </button>
                );
              })}
            </div>
            {erreurAjout && (
              <p className="hint" role="alert">
                {erreurAjout}
              </p>
            )}
          </div>
        </div>
      )}

      {equipe && (
        <div className="card" role="tabpanel" style={{ marginTop: 20 }}>
          <div className="phead">
            <div>
              <div className="eyebrow">{t('plan_pour')}</div>
              <h3>{equipe.nom}</h3>
              <span className="note">{equipe.destinataire}</span>
            </div>
            <span className={`chip ${chipUrgence(equipe.urgence)}`}>
              {td(equipe.urgence)}
            </span>
          </div>
          <div className="concl">
            <b>{t('ce_qu_il_faut_retenir')}</b>
            <p>{equipe.conclusion}</p>
          </div>
          <ol className="steps2">
            {equipe.actions.map((a, i) => (
              <li key={a.texte}>
                <span className="num">{i + 1}</span>
                <span>
                  <b>{a.texte}</b>
                  <span className="note">
                    {a.qui} {t('avant_le_2')} {jourMois(a.echeance)}
                  </span>
                </span>
                <span className={`chip ${CHIP_PRIORITE[a.priorite]}`}>
                  {td(a.priorite)}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
      <EnvoiAlerte id={id} plan={plan} />
    </>
  );
}

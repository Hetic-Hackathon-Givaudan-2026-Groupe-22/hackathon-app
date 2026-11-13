'use client';

import Link from 'next/link';
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
      ‹ Retour à l&apos;analyse
    </Link>
  );

  if (aValider)
    return (
      <>
        {retour}
        <div className="empty" style={{ marginTop: 18 }}>
          <b>Plan d&apos;action pas encore disponible</b>
          {aValider}
          <Link href={`/analyses/${id}`} className="btn">
            Aller au verdict
          </Link>
        </div>
      </>
    );
  if (erreur) return <div className="empty">{erreur}</div>;
  if (!plan) return <p className="note">Chargement…</p>;

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
        Après la décision
      </div>
      <h2 className="t">Le plan d&apos;action par équipe</h2>
      <p className="lede">
        Sillage traduit le verdict en actions concrètes pour chaque équipe.
        Actions et dates produites par l&apos;analyse simulée.
      </p>
      <div className="decision">
        <b>{plan.tendance}</b>
        <span className={`chip ${plan.verdict === 'durable' ? 'go' : 'risk'}`}>
          {libelleVerdict(plan.verdict)}
        </span>
        <span className="note">Décidé le {formatDateHeure(plan.decideLe)}</span>
      </div>

      <div className="poles" role="tablist" aria-label="Équipes">
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
                  {e.urgence}
                </span>
              </div>
              <span className="eyebrow">Première action</span>
              <span className="pc-a">{e.actions[0]?.texte}</span>
              <span className="note">
                avant le {jourMois(e.actions[0]?.echeance ?? '')} ·{' '}
                {e.actions.length} action{e.actions.length > 1 ? 's' : ''}
              </span>
            </button>
          );
        })}
        {plan.disponibles.length > 0 && (
          <button className="pcard add" onClick={() => setAjout(true)}>
            <span className="ico">+</span>
            <b>Ajouter une équipe</b>
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
              <h3 id="titre-ajout">Ajouter une équipe au plan</h3>
              <button className="x" onClick={() => setAjout(false)} autoFocus>
                Fermer
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
              <div className="eyebrow">Plan pour</div>
              <h3>{equipe.nom}</h3>
              <span className="note">{equipe.destinataire}</span>
            </div>
            <span className={`chip ${chipUrgence(equipe.urgence)}`}>
              {equipe.urgence}
            </span>
          </div>
          <div className="concl">
            <b>Ce qu&apos;il faut retenir</b>
            <p>{equipe.conclusion}</p>
          </div>
          <ol className="steps2">
            {equipe.actions.map((a, i) => (
              <li key={a.texte}>
                <span className="num">{i + 1}</span>
                <span>
                  <b>{a.texte}</b>
                  <span className="note">
                    {a.qui} · avant le {jourMois(a.echeance)}
                  </span>
                </span>
                <span className={`chip ${CHIP_PRIORITE[a.priorite]}`}>
                  {a.priorite}
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

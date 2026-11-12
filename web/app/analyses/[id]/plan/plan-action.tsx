'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiError, apiGet } from '@/lib/api';
import { formatDateHeure } from '@/lib/format';
import {
  CHIP_PRIORITE,
  chipUrgence,
  iconeEquipe,
  jourMois,
  type Plan,
} from '@/lib/plan';
import { libelleVerdict } from '@/lib/verdict';

// US-27 : le plan d'action par équipe, repris du prototype
export function PlanAction({ id }: { id: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [aValider, setAValider] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [choisie, setChoisie] = useState<string | null>(null);

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
      </div>

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
    </>
  );
}

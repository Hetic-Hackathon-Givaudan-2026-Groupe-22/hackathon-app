'use client';

import { useState } from 'react';
import { apiPost } from '@/lib/api';
import { formatDateHeure } from '@/lib/format';
import { type Canal, CANAUX, listeDestinataires, type Plan } from '@/lib/plan';
import { libelleVerdict } from '@/lib/verdict';

type Confirmation = {
  canal: string;
  nombre: number;
  envoyeeLe: string;
  simule: boolean;
};

// US-29 : choisir un canal et des destinataires, relire l'aperçu, envoyer.
// L'envoi est simulé et le dit clairement (ADR 0015).
export function EnvoiAlerte({ id, plan }: { id: string; plan: Plan }) {
  const [canal, setCanal] = useState<Canal>('email');
  const [saisie, setSaisie] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ok, setOk] = useState<Confirmation | null>(null);
  const destinataires = listeDestinataires(saisie);
  const lien =
    typeof window === 'undefined'
      ? `/analyses/${id}`
      : `${window.location.origin}/analyses/${id}`;
  const nomCanal = CANAUX.find((c) => c.cle === canal)!.nom;

  async function envoyer() {
    setEnvoi(true);
    setErreur(null);
    setOk(null);
    try {
      setOk(
        await apiPost<Confirmation>(
          `/analyses/${encodeURIComponent(id)}/plan/alertes`,
          { canal, destinataires, lien },
        ),
      );
    } catch (e) {
      setErreur((e as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <div className="phead">
        <div>
          <div className="eyebrow">Prévenir les équipes</div>
          <h3>Envoyer une alerte</h3>
        </div>
        <span className="chip wait">Envoi simulé</span>
      </div>

      <div className="channels" role="radiogroup" aria-label="Canal">
        {CANAUX.map((c) => (
          <button
            key={c.cle}
            type="button"
            role="radio"
            aria-checked={canal === c.cle}
            className="ch"
            onClick={() => {
              setCanal(c.cle);
              setOk(null);
            }}
          >
            <span className="ico" style={{ background: c.ico[1] }}>
              {c.ico[0]}
            </span>
            <span className="t">
              <b>{c.nom}</b>
              <span>{c.aide}</span>
            </span>
            <span className="tick">Choisi</span>
          </button>
        ))}
      </div>

      <div className="fld">
        <label htmlFor="destinataires">Destinataires</label>
        <textarea
          id="destinataires"
          rows={2}
          value={saisie}
          onChange={(e) => {
            setSaisie(e.target.value);
            setOk(null);
          }}
          placeholder={
            canal === 'email'
              ? 'achats@givaudan.com, kam@givaudan.com'
              : 'Équipe achats, #tendances'
          }
        />
      </div>

      <div className="preview" aria-label="Aperçu de l'alerte">
        <span className="eyebrow">Aperçu · {nomCanal}</span>
        <div className="row">
          <span>Tendance</span>
          <b>{plan.tendance}</b>
        </div>
        <div className="row">
          <span>Verdict</span>
          <b>{libelleVerdict(plan.verdict)}</b>
        </div>
        <div className="row">
          <span>Score</span>
          <b>{plan.score}/100</b>
        </div>
        <div className="row">
          <span>Lien vers l&apos;analyse</span>
          <a href={lien} className="lnk">
            {lien}
          </a>
        </div>
      </div>

      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
      {ok && (
        <p role="status" className="reserve" style={{ marginTop: 0 }}>
          <b>Envoi simulé :</b> rien n&apos;est parti. Alerte enregistrée pour{' '}
          {CANAUX.find((c) => c.cle === ok.canal)?.nom}, {ok.nombre}{' '}
          destinataire
          {ok.nombre > 1 ? 's' : ''}, le {formatDateHeure(ok.envoyeeLe)}.
        </p>
      )}
      <div>
        <button
          className="btn"
          onClick={envoyer}
          disabled={envoi || destinataires.length === 0}
        >
          {envoi
            ? 'Envoi…'
            : `Envoyer à ${destinataires.length} destinataire${destinataires.length > 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}

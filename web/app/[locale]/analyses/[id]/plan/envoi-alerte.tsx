'use client';

import { useTd } from '@/lib/traduction';
import { useLocale, useTranslations } from 'next-intl';
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
  const td = useTd();
  const locale = useLocale();
  const t = useTranslations();
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
          <div className="eyebrow">{t('prevenir_les_equipes')}</div>
          <h3>{t('envoyer_une_alerte')}</h3>
        </div>
        <span className="chip wait">{t('envoi_simule')}</span>
      </div>

      <div className="channels" role="radiogroup" aria-label={t('canal')}>
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
              <b>{td(c.nom)}</b>
              <span>{td(c.aide)}</span>
            </span>
            <span className="tick">{t('choisi')}</span>
          </button>
        ))}
      </div>

      <div className="fld">
        <label htmlFor="destinataires">{t('destinataires')}</label>
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

      <div className="preview" aria-label={t('apercu_de_l_alerte')}>
        <span className="eyebrow">
          {t('apercu')} {nomCanal}
        </span>
        <div className="row">
          <span>{t('tendance')}</span>
          <b>{plan.tendance}</b>
        </div>
        <div className="row">
          <span>{t('verdict')}</span>
          <b>{td(libelleVerdict(plan.verdict))}</b>
        </div>
        <div className="row">
          <span>{t('score')}</span>
          <b>{plan.score}/100</b>
        </div>
        <div className="row">
          <span>{t('lien_vers_l_analyse')}</span>
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
          <b>{t('envoi_simule_2')}</b>{' '}
          {t('rien_n_est_parti_alerte_enregistree_pour')}{' '}
          {td(CANAUX.find((c) => c.cle === ok.canal)?.nom ?? '')}, {ok.nombre}{' '}
          {t('destinataire')}
          {ok.nombre > 1 ? 's' : ''}
          {t('le')} {formatDateHeure(ok.envoyeeLe, locale)}.
        </p>
      )}
      <div>
        <button
          className="btn"
          onClick={envoyer}
          disabled={envoi || destinataires.length === 0}
        >
          {envoi
            ? td('Envoi…')
            : `${td('Envoyer à')} ${destinataires.length} ${td(destinataires.length > 1 ? 'destinataires' : 'destinataire')}`}
        </button>
      </div>
    </div>
  );
}

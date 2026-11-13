'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { apiPut } from '@/lib/api';
import { MOT_DE_PASSE_MIN } from '@/lib/session';
import { ChampMotDePasse } from '../champ-mot-de-passe';

// US-04 : l'ancien mot de passe, puis le nouveau deux fois
export function ChangerMotDePasse() {
  const td = useTd();
  const t = useTranslations();
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const differents = confirmation.length > 0 && confirmation !== nouveau;
  const tropCourt = nouveau.length > 0 && nouveau.length < MOT_DE_PASSE_MIN;

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setOk(false);
    if (nouveau !== confirmation) {
      setErreur(td('Les deux saisies du nouveau mot de passe diffèrent.'));
      return;
    }
    setEnvoi(true);
    try {
      await apiPut('/moi/mot-de-passe', { ancien, nouveau, confirmation });
      setOk(true);
      setAncien('');
      setNouveau('');
      setConfirmation('');
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <form
      onSubmit={envoyer}
      noValidate
      style={{ display: 'grid', gap: 10, maxWidth: 420 }}
    >
      <div className="fld">
        <label htmlFor="mdpAncien">{t('mot_de_passe_actuel')}</label>
        <ChampMotDePasse
          id="mdpAncien"
          valeur={ancien}
          onChange={setAncien}
          autoComplete="current-password"
        />
      </div>
      <div className="fld">
        <label htmlFor="mdpNouveau">{t('nouveau_mot_de_passe')}</label>
        <ChampMotDePasse
          id="mdpNouveau"
          valeur={nouveau}
          onChange={setNouveau}
          autoComplete="new-password"
          placeholder={td('8 caractères minimum')}
          invalide={tropCourt}
        />
        {tropCourt && (
          <p className="ferr">
            {t('au_moins')} {MOT_DE_PASSE_MIN} {t('caracteres')}
          </p>
        )}
      </div>
      <div className="fld">
        <label htmlFor="mdpConfirmation">
          {t('confirmer_le_nouveau_mot_de_passe')}
        </label>
        <ChampMotDePasse
          id="mdpConfirmation"
          valeur={confirmation}
          onChange={setConfirmation}
          autoComplete="new-password"
          invalide={differents}
        />
        {differents && (
          <p className="ferr">{t('les_deux_saisies_different')}</p>
        )}
      </div>
      {erreur && (
        <p className="ferr" role="alert">
          {erreur}
        </p>
      )}
      {ok && (
        <p role="status">
          <span className="chip go">{t('mot_de_passe_change')}</span>
        </p>
      )}
      <div>
        <button
          className="btn"
          type="submit"
          disabled={envoi || !ancien || nouveau.length < MOT_DE_PASSE_MIN}
        >
          {t('changer_le_mot_de_passe')}
        </button>
      </div>
    </form>
  );
}

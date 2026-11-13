'use client';

import { useTd } from '@/lib/traduction';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';
import { ApiError, apiPost } from '@/lib/api';
import {
  emailValide,
  MOT_DE_PASSE_MIN,
  useSession,
  type Utilisateur,
} from '@/lib/session';
import { ChampMotDePasse } from './champ-mot-de-passe';

type Mode = 'connexion' | 'inscription';

// Boîte d'accès de l'accueil, reprise du prototype
// US-02 : créer un compte ; US-03 : se connecter
export function Acces() {
  const td = useTd();
  const t = useTranslations();
  const router = useRouter();
  const { utilisateur, setUtilisateur } = useSession();
  const [mode, setMode] = useState<Mode>('connexion');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [tente, setTente] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const inscription = mode === 'inscription';

  if (utilisateur)
    return (
      <div className="auth" style={{ textAlign: 'center' }}>
        <p style={{ margin: 0 }}>
          {t('connectee_en_tant_que')} <b>{utilisateur.nom}</b>.
        </p>
        <Link
          href="/tendances"
          className="btn"
          style={{ justifySelf: 'center' }}
        >
          {t('voir_les_tendances')} <span aria-hidden="true">›</span>
        </Link>
      </div>
    );

  const erreurs = {
    nom:
      inscription && !nom.trim()
        ? td('Indiquez votre prénom et votre nom.')
        : null,
    email:
      inscription && !emailValide(email)
        ? td('Adresse e-mail mal formée.')
        : null,
    motDePasse:
      inscription && motDePasse.length < MOT_DE_PASSE_MIN
        ? td('Le mot de passe doit faire au moins 8 caractères.')
        : null,
    confirmation:
      inscription && confirmation !== motDePasse
        ? td('Les deux mots de passe diffèrent.')
        : null,
  };

  function changerMode(m: Mode) {
    setMode(m);
    setTente(false);
    setErreur(null);
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setTente(true);
    setErreur(null);
    if (Object.values(erreurs).some(Boolean)) return;
    setEnvoi(true);
    try {
      const u = inscription
        ? await apiPost<Utilisateur>('/auth/inscription', {
            nom: nom.trim(),
            email: email.trim(),
            motDePasse,
          })
        : await apiPost<Utilisateur>('/auth/connexion', {
            email: email.trim(),
            motDePasse,
          });
      setUtilisateur(u);
      // Un nouveau compte passe par l'onboarding (US-05)
      router.push(inscription ? '/onboarding' : '/tendances');
    } catch (err) {
      setErreur((err as Error).message);
      if (err instanceof ApiError && err.status === 409)
        changerMode('connexion');
      setEnvoi(false);
    }
  }

  const montrerEmail = (tente || email.length > 0) && erreurs.email;

  return (
    <div className="auth">
      <div className="seg" role="group" aria-label={t('acces')}>
        <button
          type="button"
          aria-pressed={!inscription}
          onClick={() => changerMode('connexion')}
        >
          {t('se_connecter')}
        </button>
        <button
          type="button"
          aria-pressed={inscription}
          onClick={() => changerMode('inscription')}
        >
          {t('creer_un_compte')}
        </button>
      </div>
      <form onSubmit={envoyer} noValidate>
        {inscription && (
          <div className="fld">
            <label htmlFor="aName">{t('prenom_et_nom')}</label>
            <input
              id="aName"
              autoComplete="name"
              placeholder={t('camille_martin')}
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              aria-invalid={Boolean(tente && erreurs.nom)}
            />
            {tente && erreurs.nom && <p className="ferr">{erreurs.nom}</p>}
          </div>
        )}
        <div className="fld">
          <label htmlFor="aMail">{t('e_mail_professionnel')}</label>
          <input
            id="aMail"
            type="email"
            autoComplete="email"
            placeholder={t('prenom_nom_givaudan_com')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(montrerEmail)}
            aria-describedby="aMailErr"
          />
          <p className="ferr" id="aMailErr" aria-live="polite">
            {montrerEmail || ''}
          </p>
        </div>
        <div className="fld">
          <label htmlFor="aPass">{t('mot_de_passe')}</label>
          <ChampMotDePasse
            id="aPass"
            valeur={motDePasse}
            onChange={setMotDePasse}
            autoComplete={inscription ? 'new-password' : 'current-password'}
            placeholder={inscription ? td('8 caractères minimum') : undefined}
            invalide={Boolean(tente && erreurs.motDePasse)}
          />
          {tente && erreurs.motDePasse && (
            <p className="ferr">{erreurs.motDePasse}</p>
          )}
        </div>
        {inscription && (
          <div className="fld">
            <label htmlFor="aPass2">{t('confirmer_le_mot_de_passe')}</label>
            <ChampMotDePasse
              id="aPass2"
              valeur={confirmation}
              onChange={setConfirmation}
              autoComplete="new-password"
            />
            {tente && erreurs.confirmation && (
              <p className="ferr">{erreurs.confirmation}</p>
            )}
          </div>
        )}
        {erreur && (
          <p className="ferr" role="alert">
            {erreur}
          </p>
        )}
        <button className="btn" type="submit" disabled={envoi}>
          {envoi
            ? td('Un instant…')
            : inscription
              ? td('Créer mon compte')
              : td('Se connecter')}
        </button>
      </form>
    </div>
  );
}

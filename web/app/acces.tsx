'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ApiError, apiPost } from '@/lib/api';
import { emailValide, MOT_DE_PASSE_MIN, type Utilisateur } from '@/lib/session';

// Boîte d'accès de l'accueil, reprise du prototype
// US-02 : créer un compte
export function Acces() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [tente, setTente] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [dejaInscrit, setDejaInscrit] = useState(false);

  const erreurs = {
    nom: !nom.trim() ? 'Indiquez votre prénom et votre nom.' : null,
    email: !emailValide(email) ? 'Adresse e-mail mal formée.' : null,
    motDePasse:
      motDePasse.length < MOT_DE_PASSE_MIN
        ? `Le mot de passe doit faire au moins ${MOT_DE_PASSE_MIN} caractères.`
        : null,
    confirmation:
      confirmation !== motDePasse ? 'Les deux mots de passe diffèrent.' : null,
  };

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setTente(true);
    setErreur(null);
    setDejaInscrit(false);
    if (Object.values(erreurs).some(Boolean)) return;
    setEnvoi(true);
    try {
      await apiPost<Utilisateur>('/auth/inscription', {
        nom: nom.trim(),
        email: email.trim(),
        motDePasse,
      });
      router.push('/tendances');
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setDejaInscrit(true);
      setErreur((err as Error).message);
      setEnvoi(false);
    }
  }

  // Le message d'un champ n'apparaît qu'après une première tentative ou une saisie
  const montrer = (champ: keyof typeof erreurs, valeur: string) =>
    (tente || valeur.length > 0) && erreurs[champ];

  return (
    <div className="auth">
      <div className="seg" role="group" aria-label="Accès">
        <button type="button" aria-pressed="true">
          Créer un compte
        </button>
      </div>
      <form onSubmit={envoyer} noValidate>
        <div className="fld">
          <label htmlFor="aName">Prénom et nom</label>
          <input
            id="aName"
            autoComplete="name"
            placeholder="Camille Martin"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            aria-invalid={Boolean(tente && erreurs.nom)}
          />
          {tente && erreurs.nom && <p className="ferr">{erreurs.nom}</p>}
        </div>
        <div className="fld">
          <label htmlFor="aMail">E-mail professionnel</label>
          <input
            id="aMail"
            type="email"
            autoComplete="email"
            placeholder="prenom.nom@givaudan.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(montrer('email', email))}
            aria-describedby="aMailErr"
          />
          <p className="ferr" id="aMailErr" aria-live="polite">
            {montrer('email', email) || ''}
          </p>
        </div>
        <div className="fld">
          <label htmlFor="aPass">Mot de passe</label>
          <input
            id="aPass"
            type="password"
            autoComplete="new-password"
            placeholder={`${MOT_DE_PASSE_MIN} caractères minimum`}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            aria-invalid={Boolean(tente && erreurs.motDePasse)}
          />
          {tente && erreurs.motDePasse && (
            <p className="ferr">{erreurs.motDePasse}</p>
          )}
        </div>
        <div className="fld">
          <label htmlFor="aPass2">Confirmer le mot de passe</label>
          <input
            id="aPass2"
            type="password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
          {tente && erreurs.confirmation && (
            <p className="ferr">{erreurs.confirmation}</p>
          )}
        </div>
        {erreur && (
          <p className="ferr" role="alert">
            {erreur}
          </p>
        )}
        {dejaInscrit && (
          <p className="note" style={{ margin: 0 }}>
            Cet e-mail a déjà un compte : utilisez « Se connecter ».
          </p>
        )}
        <button className="btn" type="submit" disabled={envoi}>
          {envoi ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>
    </div>
  );
}

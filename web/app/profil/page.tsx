'use client';

import { useState } from 'react';
import { apiPatch } from '@/lib/api';
import { useSession, type Utilisateur } from '@/lib/session';
import { ChoixMetier } from '../choix-metier';

// Le profil : métier (US-05) ; tendances suivies et mot de passe arrivent avec US-06 et US-04
export default function Profil() {
  const { utilisateur, setUtilisateur } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  if (!utilisateur) return null;

  async function changerMetier(metier: string) {
    setMessage(null);
    setErreur(null);
    try {
      setUtilisateur(await apiPatch<Utilisateur>('/moi', { metier }));
      setMessage('Métier enregistré.');
    } catch (e) {
      setErreur((e as Error).message);
    }
  }

  return (
    <section className="view narrow" style={{ maxWidth: 880 }}>
      <div className="eyebrow">Mon profil</div>
      <h2 className="t">{utilisateur.nom}</h2>
      <p className="lede">{utilisateur.email}</p>

      <div className="mtabs" style={{ marginTop: 22 }}>
        <section>
          <h4>Métier</h4>
          <ChoixMetier valeur={utilisateur.metier} onChange={changerMetier} />
          <p className="note" role="status" style={{ margin: 0 }}>
            {message}
          </p>
          {erreur && (
            <p className="hint" role="alert">
              {erreur}
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

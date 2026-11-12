'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiPatch } from '@/lib/api';
import { useSession, type Utilisateur } from '@/lib/session';
import { ChoixMetier } from '../choix-metier';
import { Comete } from '../logo';

// Onboarding repris du prototype, juste après la création du compte (US-05)
export default function Onboarding() {
  const router = useRouter();
  const { utilisateur, setUtilisateur } = useSession();
  const [metier, setMetier] = useState<string | null>(
    utilisateur?.metier ?? null,
  );
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function valider() {
    if (!metier) return;
    setEnvoi(true);
    setErreur(null);
    try {
      setUtilisateur(await apiPatch<Utilisateur>('/moi', { metier }));
      router.push('/tendances');
    } catch (e) {
      setErreur((e as Error).message);
      setEnvoi(false);
    }
  }

  return (
    <section className="view narrow" style={{ maxWidth: 880 }}>
      <div className="logo" style={{ marginBottom: 18 }}>
        <Comete />
        Sillage
      </div>
      <div className="obsteps">
        <span className="on">1 · Votre métier</span>
      </div>
      <div className="eyebrow">Bienvenue sur Sillage</div>
      <h2 className="t">
        Parlez-nous de vous, {utilisateur?.nom.split(' ')[0]}
      </h2>
      <p className="lede">
        Sillage adapte les tendances et les plans d&apos;action à votre métier.
        Vous pourrez le modifier dans votre profil.
      </p>
      <ChoixMetier valeur={metier} onChange={setMetier} />
      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}
      <div className="foot">
        <button className="btn" onClick={valider} disabled={!metier || envoi}>
          Voir les tendances <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}

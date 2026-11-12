'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPatch, apiPut } from '@/lib/api';
import { useSession, type Utilisateur } from '@/lib/session';
import { ChoixMetier } from '../choix-metier';
import { ChoixTendances } from '../choix-tendances';

// Le profil : métier (US-05), tendances suivies (US-06) ; mot de passe avec US-04
export default function Profil() {
  const { utilisateur, setUtilisateur } = useSession();
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [suivies, setSuivies] = useState<string[] | null>(null);

  useEffect(() => {
    apiGet<string[]>('/moi/suivis')
      .then(setSuivies)
      .catch(() => setSuivies([]));
  }, []);

  if (!utilisateur) return null;

  async function enregistrer(action: () => Promise<void>, ok: string) {
    setMessage(null);
    setErreur(null);
    try {
      await action();
      setMessage(ok);
    } catch (e) {
      setErreur((e as Error).message);
    }
  }

  return (
    <section className="view narrow" style={{ maxWidth: 880 }}>
      <div className="eyebrow">Mon profil</div>
      <h2 className="t">{utilisateur.nom}</h2>
      <p className="lede">{utilisateur.email}</p>
      <p className="note" role="status" style={{ minHeight: 20 }}>
        {message}
      </p>
      {erreur && (
        <p className="hint" role="alert">
          {erreur}
        </p>
      )}

      <div className="mtabs" style={{ marginTop: 10 }}>
        <section>
          <h4>Métier</h4>
          <ChoixMetier
            valeur={utilisateur.metier}
            onChange={(metier) =>
              enregistrer(async () => {
                setUtilisateur(await apiPatch<Utilisateur>('/moi', { metier }));
              }, 'Métier enregistré.')
            }
          />
        </section>

        <section>
          <h4>Tendances suivies</h4>
          <p className="note" style={{ margin: 0 }}>
            Elles apparaissent en premier dans la vue Tendances.
          </p>
          {suivies === null ? (
            <p className="note">Chargement…</p>
          ) : (
            <ChoixTendances
              choisies={suivies}
              onChange={(slugs) =>
                enregistrer(async () => {
                  setSuivies(
                    await apiPut<string[]>('/moi/suivis', { tendances: slugs }),
                  );
                }, 'Tendances suivies enregistrées.')
              }
            />
          )}
        </section>
      </div>
    </section>
  );
}
